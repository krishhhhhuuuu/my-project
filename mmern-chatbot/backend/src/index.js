// ✅ Load environment variables from .env file
require('dotenv').config();

const server = require('./server');
const { port } = require('./config');

// Debug check — you can remove this later
console.log("✅ OpenAI key loaded:", !!process.env.OPENAI_API_KEY);
console.log("✅ Mongo URI:", process.env.MONGO_URI ? "set" : "missing");

server.listen(port, () => {
  console.log(`🚀 API listening on port ${port}`);
});
