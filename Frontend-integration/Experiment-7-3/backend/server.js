// backend/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React app
    methods: ["GET", "POST"],
  },
});

let messages = [];

// Socket.io connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send old messages
  socket.emit("previousMessages", messages);

  socket.on("sendMessage", (data) => {
    messages.push(data);
    io.emit("receiveMessage", data); // Broadcast message
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// API example using Axios (optional)
app.get("/test", async (req, res) => {
  const response = await axios.get("https://api.github.com");
  res.json({ github_status: response.status });
});

server.listen(5000, () => console.log("✅ Server running on port 5000"));
