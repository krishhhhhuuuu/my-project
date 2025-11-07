const Message = require('../models/Message');
async function autoSummarizeIfNeeded(session, messages) {
  // simple heuristic: if messages length > 40 then summarize oldest half
  if (messages.length < 40) return;
  const toSummarize = messages.slice(0, Math.floor(messages.length / 2));
  const text = toSummarize.map(m => `${m.role}: ${m.text}`).join('\n');
  // naive summarization: truncate and store as system message
  const summary = text.slice(0, 1000) + '...'; // replace with provider summarization
  await Message.create({ sessionId: session._id, role: 'system', text: `Summary: ${summary}` });
  // delete old messages after summarizing
  const ids = toSummarize.map(m => m._id);
  await Message.deleteMany({ _id: { $in: ids } });
}
module.exports = { autoSummarizeIfNeeded };
