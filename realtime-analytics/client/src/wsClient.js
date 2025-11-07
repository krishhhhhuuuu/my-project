export function createWS(token, room, onMessage) {
  const url = `ws://localhost:4000/?token=${token}&room=${room}`;
  const ws = new WebSocket(url);

  ws.onopen = () => console.log("✅ WebSocket connected");
  ws.onclose = () => console.log("❌ WebSocket closed");

  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onMessage && onMessage(data);
    } catch (err) {
      console.error("Bad WS message:", err);
    }
  };

  return ws;
}
