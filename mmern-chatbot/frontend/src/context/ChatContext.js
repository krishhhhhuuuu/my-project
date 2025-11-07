import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import api from '../api/api';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]); // {role, text, ts, id}
  const [provider, setProvider] = useState('dialogflow'); // openai | dialogflow | mock
  const [sessionId, setSessionId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [eventSource, setEventSource] = useState(null);

  const appendMessage = useCallback((msg) => {
    setMessages(m => [...m, { ...msg, id: Date.now() + Math.random() }]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  // Load conversation history for a session
  const loadSessionHistory = useCallback(async (sid) => {
    if (!token || !sid) return;
    try {
      const res = await api.get(`/chat/sessions/${sid}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.ok && res.data.messages) {
        const loadedMessages = res.data.messages.map(m => ({
          role: m.role,
          text: m.text,
          ts: new Date(m.createdAt).getTime(),
          id: m._id || Date.now() + Math.random()
        }));
        setMessages(loadedMessages);
        setSessionId(sid);
      }
    } catch (err) {
      console.error('Failed to load session history:', err);
    }
  }, [token]);

  const send = useCallback(async (text) => {
    if (!token) throw new Error('Not authenticated');
    appendMessage({ role: 'user', text, ts: Date.now() });
    try {
      const res = await api.post('/chat', { 
        text, 
        sessionId, 
        provider,
        providerOptions: {}
      }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      const reply = res.data.assistant || res.data.reply || res.data.message?.text || res.data.message;
      appendMessage({ role: 'assistant', text: reply, ts: Date.now() });
      
      // Update sessionId if returned
      if (res.data.sessionId && res.data.sessionId !== sessionId) {
        setSessionId(res.data.sessionId);
      }
      
      return reply;
    } catch (err) {
      appendMessage({ role: 'assistant', text: `[Error: ${err.response?.data?.error || err.message}]`, ts: Date.now() });
      throw err;
    }
  }, [token, sessionId, provider, appendMessage]);

  const sendStreaming = useCallback((text, { onDone } = {}) => {
    if (!token) throw new Error('Not authenticated');
    appendMessage({ role: 'user', text, ts: Date.now() });
    // start a new assistant partial message
    const assistantId = Date.now() + Math.random();
    appendMessage({ id: assistantId, role: 'assistant', text: '', ts: Date.now(), partial: true });

    const qs = new URLSearchParams({ 
      text, 
      sessionId: sessionId || '', 
      provider,
      token // Pass token in query for SSE
    });
    const baseUrl = api.defaults.baseURL.replace(/\/api$/, '');
    const url = `${baseUrl}/api/chat/stream?${qs.toString()}`;

    const es = new EventSource(url);

    setIsStreaming(true);
    setEventSource(es);

    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        if (!payload?.delta) return;
        setMessages(prev => {
          // update last assistant partial with new delta appended
          const newMsgs = [...prev];
          const idx = newMsgs.findIndex(m => m.id === assistantId);
          if (idx === -1) {
            newMsgs.push({ id: assistantId, role: 'assistant', text: payload.delta, partial: true, ts: Date.now() });
          } else {
            newMsgs[idx] = { ...newMsgs[idx], text: (newMsgs[idx].text || '') + payload.delta, partial: true };
          }
          return newMsgs;
        });
      } catch(e) {
        console.error('SSE parse error', e);
      }
    };

    es.addEventListener('done', (ev) => {
      setIsStreaming(false);
      try {
        const data = JSON.parse(ev.data);
        // Update sessionId if returned
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
        }
      } catch (e) {
        console.error('Error parsing done event:', e);
      }
      // finalize the assistant message (remove partial flag)
      setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, partial: false } : m)));
      es.close();
      setEventSource(null);
      if (onDone) onDone();
    });

    es.addEventListener('error', (ev) => {
      try {
        const data = JSON.parse(ev.data);
        appendMessage({ role: 'assistant', text: `[Error: ${data.message || 'Stream error'}]`, ts: Date.now() });
      } catch (e) {
        console.error('SSE error parse:', e);
      }
      setIsStreaming(false);
      setEventSource(null);
      es.close();
    });

    es.onerror = (e) => {
      console.error('SSE connection error', e);
      setIsStreaming(false);
      setEventSource(null);
      es.close();
    };

    return { cancel: () => { es.close(); setIsStreaming(false); setEventSource(null); } };
  }, [token, sessionId, provider, appendMessage]);

  return (
    <ChatContext.Provider value={{
      messages, 
      appendMessage, 
      clearMessages,
      send, 
      sendStreaming,
      provider, 
      setProvider,
      sessionId, 
      setSessionId,
      loadSessionHistory,
      isStreaming
    }}>
      {children}
    </ChatContext.Provider>
  );
};
