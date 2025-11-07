const BaseProvider = require('./baseProvider');
const axios = require('axios');

class OpenAIProvider extends BaseProvider {
  constructor({apiKey}) {
    super(); this.apiKey = apiKey;
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async chat({messages, options = {}, onDelta}) {
    // using completions/ chat completions streaming via fetch SSE is more complex; here is a simple outline using streaming via Axios and EventSource is left for production.
    // For demo: non-streaming call:
    const body = {
      model: options.model || 'gpt-4o-mini',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 512
    };
    const res = await axios.post(`${this.baseUrl}/chat/completions`, body, {
      headers: { Authorization: `Bearer ${this.apiKey}` }
    });
    const assistant = res.data.choices[0].message;
    if (onDelta) onDelta(assistant.content);
    return { assistant, usage: res.data.usage || {} };
  }
}

module.exports = OpenAIProvider;
