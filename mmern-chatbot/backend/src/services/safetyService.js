const banned = ['<script>', 'rm -rf', 'shutdown', 'terror']; // extend this list
function isSafe(input) {
  if (!input) return true;
  const lower = input.toLowerCase();
  for (const b of banned) if (lower.includes(b)) return false;
  // basic prompt-injection heuristic:
  if (lower.includes('ignore previous') || lower.includes('forget instructions')) return false;
  return true;
}
module.exports = { isSafe };
