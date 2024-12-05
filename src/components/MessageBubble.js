// MessageBubble.js
import React from 'react';

const MessageBubble = ({ type, content }) => {
  return (
    <div className={`message-bubble ${type}`}>
      {content.split('\n').map((text, i) => (
        <p key={i} className="message-text">{text}</p>
      ))}
    </div>
  );
};

export default MessageBubble;
