const Session = require('../models/Session');
const Message = require('../models/Message');
const User = require('../models/User');
const dialogflowProvider = require('../providers/dialogflowProvider');
const openaiProvider = require('../providers/openaiProvider');
const { isSafe } = require('../services/safetyService');
const { autoSummarizeIfNeeded } = require('../utils/summarizer');
const { estimateTokens } = require('../utils/tokenEstimator');
const { maxTokensPerSession } = require('../config');

/**
 * Gets or creates a session for the user
 */
async function getOrCreateSession(userId, sessionId, provider = 'dialogflow', providerOptions = {}) {
  if (sessionId) {
    const session = await Session.findOne({ _id: sessionId, userId });
    if (session) {
      session.lastActiveAt = new Date();
      await session.save();
      return session;
    }
  }
  
  // Create new session
  const session = await Session.create({
    userId,
    provider,
    model: providerOptions.model || (provider === 'openai' ? 'gpt-4o-mini' : 'default'),
    systemPrompt: providerOptions.systemPrompt,
    lastActiveAt: new Date()
  });
  
  return session;
}

/**
 * Loads conversation history for a session
 */
async function loadConversationHistory(sessionId, maxMessages = 50) {
  const messages = await Message.find({ sessionId })
    .sort({ createdAt: 1 })
    .limit(maxMessages)
    .lean();
  
  // Convert to chat format
  return messages.map(m => ({
    role: m.role,
    content: m.text
  }));
}

/**
 * Saves a message to the database
 */
async function saveMessage(sessionId, userId, role, text, tokens = null, metadata = {}) {
  const message = await Message.create({
    sessionId,
    userId,
    role,
    text,
    tokens: tokens || estimateTokens(text),
    metadata
  });
  return message;
}

/**
 * Updates session token usage
 */
async function updateSessionTokenUsage(session, tokens) {
  session.tokenUsage = (session.tokenUsage || 0) + tokens;
  await session.save();
  
  // Check if we need to summarize
  if (session.tokenUsage > maxTokensPerSession * 0.8) {
    const messages = await Message.find({ sessionId: session._id }).sort({ createdAt: 1 });
    await autoSummarizeIfNeeded(session, messages);
  }
}

/**
 * Main chat handler with full context management
 */
async function handleChat({ userId, sessionId, inputText, providerName = 'dialogflow', providerOptions = {}, onDelta }) {
  try {
    // 1. Safety check
    if (!isSafe(inputText)) {
      throw new Error('Input contains potentially unsafe content');
    }

    // 2. Get or create session
    const session = await getOrCreateSession(userId, sessionId, providerName, providerOptions);
    
    // 3. Save user message
    await saveMessage(session._id, userId, 'user', inputText);

    // 4. Load conversation history
    const history = await loadConversationHistory(session._id);
    
    // Build messages array for provider
    const messages = [];
    if (session.systemPrompt) {
      messages.push({ role: 'system', content: session.systemPrompt });
    }
    messages.push(...history);
    messages.push({ role: 'user', content: inputText });

    // 5. Get provider instance
    let provider;
    if (providerName === 'openai') {
      const { openaiKey } = require('../config');
      provider = new openaiProvider({ apiKey: openaiKey });
    } else if (providerName === 'dialogflow') {
      provider = dialogflowProvider;
    } else {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    // 6. Call provider
    let response;
    let usage = null;
    
    if (providerName === 'dialogflow') {
      // Dialogflow uses session path, not message history
      const dialogflowSessionId = session._id.toString();
      response = await dialogflowProvider.sendMessage(inputText, dialogflowSessionId);
      
      // Stream if onDelta provided
      if (onDelta && typeof response === 'string') {
        const words = response.split(' ');
        for (const word of words) {
          await new Promise(resolve => setTimeout(resolve, 30));
          onDelta(word + (words.indexOf(word) < words.length - 1 ? ' ' : ''));
        }
      }
    } else {
      // OpenAI or other providers
      const result = await provider.chat({
        messages,
        options: {
          model: session.model || providerOptions.model,
          temperature: providerOptions.temperature ?? 0.7,
          max_tokens: providerOptions.max_tokens ?? 512
        },
        onDelta
      });
      
      if (typeof result === 'string') {
        response = result;
      } else {
        response = result.assistant?.content || result.assistant || result;
        usage = result.usage;
      }
    }

    // 7. Save assistant response
    const responseText = typeof response === 'string' ? response : response.content || JSON.stringify(response);
    const responseTokens = usage?.total_tokens || estimateTokens(responseText);
    await saveMessage(session._id, userId, 'assistant', responseText, responseTokens, { usage });

    // 8. Update session token usage
    await updateSessionTokenUsage(session, responseTokens);

    // 9. Return response
    return {
      assistant: responseText,
      usage: usage || { estimated_tokens: responseTokens },
      sessionId: session._id.toString()
    };
  } catch (err) {
    console.error('❌ Chat service error:', err.message);
    throw new Error(`Chat request failed: ${err.message}`);
  }
}

module.exports = { handleChat, getOrCreateSession, loadConversationHistory };
