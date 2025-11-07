cat <<'EOF' > src/components/MessageBubble.jsx
import React from 'react';

export default function MessageBubble({ message }) {
  const isAssistant = message.role === 'assistant';
  const cls = isAssistant ? 'text-start mb-3' : 'text-end mb-3';
  const bubbleStyle = {
    display: 'inline-block',
    padding: '8px 12px',
    borderRadius: 12,
    maxWidth: '80%',
    whiteSpace: 'pre-wrap',
    background: isAssistant ? '#eef6ff' : '#f1f3f5'
  };
  return (
    <div className={cls}>
      <div style={bubbleStyle}>
        <div style={{fontSize:12, color:'#666', marginBottom:4}}>{message.role}</div>
        <div>{message.text}</div>
        {message.partial && <div style={{fontSize:12, color:'#999', marginTop:6}}>typing...</div>}
      </div>
    </div>
  );
}
EOF
