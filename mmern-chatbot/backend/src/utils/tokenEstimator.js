// Rough token estimator based on whitespace splitting
function estimateTokens(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

module.exports = { estimateTokens };