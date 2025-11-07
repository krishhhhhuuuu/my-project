import React, { useState, useContext, useRef, useEffect } from 'react';
import { sendMessage } from '../api/api';
import { AuthContext } from '../context/AuthContext';

export default function ChatPage() {
  const { token, logoutUser } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true);
  const bottomRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };
    setMessages((m) => [...m, userMsg]);
    const prompt = text;
    setText('');

    // --- Non-streaming fallback ---
    if (!useStreaming) {
      setLoading(true);
      try {
        const res = await sendMessage(token, prompt);
        setMessages((m) => [...m, { role: 'assistant', text: res.reply }]);
      } catch (e) {
        setMessages((m) => [...m, { role: 'assistant', text: '[Error fetching reply]' }]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // --- Streaming mode ---
    try {
      const url = new URL('http://localhost:4000/api/chat/stream');
      url.searchParams.append('text', prompt);
      url.searchParams.append('token', token); // ✅ Include JWT token
      console.log('JWT token:', token);

      const es = new EventSource(url); // No headers allowed, token is in query param
      let partial = '';

      setMessages((m) => [...m, { role: 'assistant', text: '', partial: true }]);
      setLoading(true);

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.delta) {
            partial += data.delta;
            setMessages((prev) => {
              const newMsgs = [...prev];
              newMsgs[newMsgs.length - 1] = {
                role: 'assistant',
                text: partial,
                partial: true,
              };
              return newMsgs;
            });
          }
        } catch (err) {
          console.error('SSE parse error', err);
        }
      };

      es.addEventListener('done', () => {
        es.close();
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = {
            role: 'assistant',
            text: partial,
            partial: false,
          };
          return newMsgs;
        });
        setLoading(false);
      });

      es.addEventListener('error', (err) => {
        console.error('SSE error', err);
        setMessages((m) => [...m, { role: 'assistant', text: '[Stream Error]' }]);
        setLoading(false);
        es.close();
      });
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { role: 'assistant', text: '[Streaming failed]' }]);
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-2 align-items-center">
        <h4>Chat</h4>
        <div className="d-flex align-items-center gap-2">
          <label className="form-check-label small me-2">
            <input
              type="checkbox"
              className="form-check-input me-1"
              checked={useStreaming}
              onChange={(e) => setUseStreaming(e.target.checked)}
            />
            Stream
          </label>
          <button className="btn btn-outline-danger btn-sm" onClick={logoutUser}>
            Logout
          </button>
        </div>
      </div>

      <div
        className="border p-3 mb-3 bg-white rounded"
        style={{ height: '400px', overflowY: 'auto' }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${m.role === 'assistant' ? 'text-primary' : 'text-dark'}`}
          >
            <b>{m.role}:</b> {m.text}
            {m.partial && <span className="text-muted"> ▌</span>}
          </div>
        ))}
        {loading && (
          <div>
            <em>Assistant is typing...</em>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="input-group">
        <input
          className="form-control"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button className="btn btn-success" onClick={send} disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
