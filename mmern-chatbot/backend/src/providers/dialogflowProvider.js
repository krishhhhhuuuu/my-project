const dialogflow = require('@google-cloud/dialogflow');
const BaseProvider = require('./baseProvider');

const projectId = process.env.DIALOGFLOW_PROJECT_ID;

/**
 * Dialogflow Provider that maintains conversation context using session IDs
 */
class DialogflowProvider extends BaseProvider {
  constructor() {
    super();
    if (!projectId) {
      throw new Error('Missing DIALOGFLOW_PROJECT_ID in environment variables');
    }
    this.sessionClient = new dialogflow.SessionsClient();
  }

  /**
   * Sends a message to Dialogflow using a specific session ID to maintain context
   */
  async sendMessage(text, sessionId = null) {
    if (!projectId) {
      throw new Error('Missing DIALOGFLOW_PROJECT_ID in environment variables');
    }

    // Use provided sessionId or generate a new one
    const dfSessionId = sessionId || require('uuid').v4();
    const sessionPath = this.sessionClient.projectAgentSessionPath(projectId, dfSessionId);

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text,
          languageCode: 'en-US',
        },
      },
    };

    try {
      const [response] = await this.sessionClient.detectIntent(request);
      const result = response.queryResult;

      const reply = result.fulfillmentText || result.queryText || '[No response from Dialogflow]';
      console.log('🤖 Dialogflow reply:', reply);
      
      return reply;
    } catch (err) {
      console.error('Dialogflow API error:', err.message);
      throw err;
    }
  }

  /**
   * Implements BaseProvider interface for consistency
   */
  async chat({ messages, options = {}, onDelta }) {
    // Dialogflow doesn't use message history the same way as OpenAI
    // It maintains context through session IDs
    // Get the last user message
    const userMessages = messages.filter(m => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];
    
    if (!lastUserMessage) {
      throw new Error('No user message found');
    }

    // Use sessionId from options if provided
    const sessionId = options.sessionId || null;
    const response = await this.sendMessage(lastUserMessage.content, sessionId);

    // Stream if onDelta provided
    if (onDelta && typeof response === 'string') {
      const words = response.split(' ');
      for (const word of words) {
        await new Promise(resolve => setTimeout(resolve, 30));
        onDelta(word + (words.indexOf(word) < words.length - 1 ? ' ' : ''));
      }
    }

    return { assistant: response, usage: null };
  }

  async estimateTokens(text) {
    return text.split(/\s+/).length;
  }
}

// Export singleton instance and legacy function for backward compatibility
const providerInstance = projectId ? new DialogflowProvider() : null;

module.exports = providerInstance || {
  sendMessage: async (text, sessionId) => {
    if (!projectId) {
      throw new Error('Missing DIALOGFLOW_PROJECT_ID in environment variables');
    }
    const sessionClient = new dialogflow.SessionsClient();
    const dfSessionId = sessionId || require('uuid').v4();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, dfSessionId);
    
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text,
          languageCode: 'en-US',
        },
      },
    };

    try {
      const [response] = await sessionClient.detectIntent(request);
      const result = response.queryResult;
      return result.fulfillmentText || result.queryText || '[No response from Dialogflow]';
    } catch (err) {
      console.error('Dialogflow API error:', err.message);
      throw err;
    }
  }
};
