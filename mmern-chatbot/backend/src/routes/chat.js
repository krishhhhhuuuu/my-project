const express = require('express');
const router = express.Router();
const jwtAuth = require('../middlewares/jwtAuth');
const rateLimiter = require('../middlewares/rateLimiter');
const { handleChat, getOrCreateSession, loadConversationHistory } = require('../services/chatService');
const Session = require('../models/Session');
const Message = require('../models/Message');
const { autoSummarizeIfNeeded } = require('../utils/summarizer');
const jwt = require('jsonwebtoken');

// POST /api/chat - normal non-streaming
router.post('/', jwtAuth, rateLimiter, async (req, res) => {
  try {
    const { sessionId, text, provider, providerOptions } = req.body;
    const out = await handleChat({
      userId: req.user.id,
      sessionId,
      inputText: text,
      providerName: provider,
      providerOptions
    });
    res.json({ 
      ok: true, 
      assistant: out.assistant, 
      usage: out.usage,
      sessionId: out.sessionId 
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ ok: false, error: err.message });
  }
});

// GET /api/chat/stream - streaming mode (SSE)
router.get('/stream', rateLimiter, async (req, res) => {
  // ✅ Manually handle token since EventSource can't send headers
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.sub || decoded.id };
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // ✅ Setup Server-Sent Events (SSE)
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.flushHeaders();

  const heartbeat = setInterval(() => res.write(':\n\n'), 20000);

  const { sessionId, text, provider = 'openai' } = req.query;

  try {
    const result = await handleChat({
      userId: req.user.id,
      sessionId,
      inputText: text,
      providerName: provider,
      onDelta: chunk => res.write(`data: ${JSON.stringify({ delta: chunk })}\n\n`)
    });

    res.write(`event: done\ndata: ${JSON.stringify({ sessionId: result.sessionId, usage: result.usage })}\n\n`);
  } catch (err) {
    console.error('Stream error:', err.message);
    res.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`);
  } finally {
    clearInterval(heartbeat);
    res.end();
  }
});

// GET /api/chat/sessions - List user's sessions
router.get('/sessions', jwtAuth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id })
      .sort({ lastActiveAt: -1 })
      .limit(50)
      .select('_id title provider model lastActiveAt tokenUsage createdAt');
    res.json({ ok: true, sessions });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/chat/sessions/:sessionId/history - Get conversation history
router.get('/sessions/:sessionId/history', jwtAuth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.sessionId, userId: req.user.id });
    if (!session) {
      return res.status(404).json({ ok: false, error: 'Session not found' });
    }
    
    const messages = await Message.find({ sessionId: session._id })
      .sort({ createdAt: 1 })
      .select('role text createdAt');
    
    res.json({ ok: true, session, messages });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/chat/sessions/:sessionId/clear - Clear session messages
router.post('/sessions/:sessionId/clear', jwtAuth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.sessionId, userId: req.user.id });
    if (!session) {
      return res.status(404).json({ ok: false, error: 'Session not found' });
    }
    
    await Message.deleteMany({ sessionId: session._id });
    session.tokenUsage = 0;
    await session.save();
    
    res.json({ ok: true, message: 'Session cleared' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/chat/sessions/:sessionId/summarize - Summarize and compress session
router.post('/sessions/:sessionId/summarize', jwtAuth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.sessionId, userId: req.user.id });
    if (!session) {
      return res.status(404).json({ ok: false, error: 'Session not found' });
    }
    
    const messages = await Message.find({ sessionId: session._id }).sort({ createdAt: 1 });
    await autoSummarizeIfNeeded(session, messages);
    
    res.json({ ok: true, message: 'Session summarized', tokenUsage: session.tokenUsage });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/chat/sessions/:sessionId/export - Export conversation as JSON
router.get('/sessions/:sessionId/export', jwtAuth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.sessionId, userId: req.user.id });
    if (!session) {
      return res.status(404).json({ ok: false, error: 'Session not found' });
    }
    
    const messages = await Message.find({ sessionId: session._id })
      .sort({ createdAt: 1 })
      .select('role text createdAt tokens');
    
    const exportData = {
      session: {
        id: session._id,
        title: session.title,
        provider: session.provider,
        model: session.model,
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt,
        tokenUsage: session.tokenUsage
      },
      messages: messages.map(m => ({
        role: m.role,
        text: m.text,
        timestamp: m.createdAt,
        tokens: m.tokens
      })),
      exportedAt: new Date().toISOString()
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="conversation-${session._id}.json"`);
    res.json(exportData);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/chat/sessions/:sessionId - Delete a session
router.delete('/sessions/:sessionId', jwtAuth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.sessionId, userId: req.user.id });
    if (!session) {
      return res.status(404).json({ ok: false, error: 'Session not found' });
    }
    
    await Message.deleteMany({ sessionId: session._id });
    await Session.deleteOne({ _id: session._id });
    
    res.json({ ok: true, message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
