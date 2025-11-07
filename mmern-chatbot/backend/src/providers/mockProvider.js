const BaseProvider = require('./baseProvider');
class MockProvider extends BaseProvider {
  async chat({messages, options, onDelta}) {
    const reply = `mock reply to: ${messages[messages.length-1].content || messages[messages.length-1].text}`;
    if (onDelta) {
      // simulate streaming
      for (let i=0;i<reply.length;i+=10) {
        await new Promise(r => setTimeout(r, 50));
        onDelta(reply.slice(i, i+10));
      }
    }
    return { assistant: { role: 'assistant', content: reply }, usage: { prompt_tokens: 1, completion_tokens: 1 } };
  }
}
module.exports = MockProvider;
