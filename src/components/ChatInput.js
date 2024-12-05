// ChatInput.js
import React, { useState } from 'react';

const ChatInput = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="AI 누리에게 질문하기"
          disabled={disabled}
        />
        <button type="submit" disabled={!message.trim() || disabled}>
          전송
        </button>
      </form>
    </div>
  );
};

export default ChatInput;