import React, { useState, useContext, useRef, useEffect } from 'react';
import { ChatContext } from '../context/ChatContext';
import ProviderSelector from './ProviderSelector';
import Loader from './Loader';
import MessageBubble from './MessageBubble';

export default function ChatWindow() {
  const { 
    messages, 
    send, 
    sendStreaming, 
    clearMessages, 
    provider, 
    setProvider, 
    isStreaming,
    sessionId 
  } = useContext(ChatContext);
  const [text, setText] = useState('');
  const [useStreaming, setUseStreaming] = useState(true);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const t = text;
    setText('');
    try {
      if (useStreaming) {
        sendStreaming(t);
      } else {
        await send(t);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card" style={{height:'80vh', display:'flex', flexDirection:'column'}}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <b>AI Chat</b>
          {sessionId && (
            <small className="text-muted ms-2">Session: {sessionId.substring(0, 8)}...</small>
          )}
        </div>
        <div className="d-flex align-items-center">
          <ProviderSelector provider={provider} setProvider={setProvider} />
          <button className="btn btn-sm btn-outline-secondary ms-2" onClick={clearMessages}>
            Clear
          </button>
        </div>
      </div>

      <div className="card-body" style={{overflowY:'auto', flex:1}}>
        {messages.length === 0 && (
          <div className="text-muted text-center p-4">
            No messages yet — say hi 👋
          </div>
        )}
        {messages.map(m => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {isStreaming && messages.length > 0 && (
          <div className="text-muted small ms-3">
            <Loader size="sm" text="AI is typing..." />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="card-footer">
        <div className="mb-2 d-flex align-items-center justify-content-between">
          <label className="form-check-label">
            <input 
              className="form-check-input me-1" 
              type="checkbox" 
              checked={useStreaming} 
              onChange={e => setUseStreaming(e.target.checked)} 
            /> 
            Stream responses
          </label>
          {isStreaming && <Loader size="sm" text="Streaming..." />}
        </div>

        <div className="input-group">
          <input 
            className="form-control" 
            placeholder="Type a message..." 
            value={text} 
            onChange={e => setText(e.target.value)} 
            onKeyDown={e => { 
              if(e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                handleSend(); 
              } 
            }} 
            disabled={isStreaming}
          />
          <button 
            className="btn btn-primary" 
            onClick={handleSend}
            disabled={isStreaming || !text.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
