import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000");

function Chat() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("previousMessages", (messages) => {
      setChat(messages);
    });

    socket.on("receiveMessage", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => {
      socket.off();
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && username.trim()) {
      const newMessage = {
        user: username,
        text: message,
        time: new Date().toLocaleTimeString(),
      };
      socket.emit("sendMessage", newMessage);
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <h2>Real-Time Chat</h2>
      <input
        type="text"
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <div className="chat-box">
        {chat.map((msg, index) => (
          <p key={index}>
            <strong>{msg.user}</strong> [{msg.time}]: {msg.text}
          </p>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
