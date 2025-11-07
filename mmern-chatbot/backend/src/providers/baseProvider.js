class BaseProvider {
  constructor(config) { this.config = config; }
  // send a chat request; supports streaming: callback for partial token
  async chat({messages, options, onDelta}) { throw new Error('not implemented'); }
  async estimateTokens(text) { return text.split(/\s+/).length; } // naive
}
module.exports = BaseProvider;
