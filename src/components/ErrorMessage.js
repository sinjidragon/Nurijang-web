// components/ErrorMessage.js
import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onClose }) => (
  <div className="error-message">
    <p>{message}</p>
    <button onClick={onClose}>&times;</button>
  </div>
);

export default ErrorMessage;