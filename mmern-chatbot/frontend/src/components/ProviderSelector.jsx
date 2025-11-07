import React from 'react';

export default function ProviderSelector({ provider, setProvider }) {
  return (
    <select 
      className="form-select form-select-sm" 
      style={{width:180}} 
      value={provider} 
      onChange={e => setProvider(e.target.value)}
    >
      <option value="dialogflow">Dialogflow</option>
      <option value="openai">OpenAI</option>
      <option value="mock">Mock (dev)</option>
    </select>
  );
}
