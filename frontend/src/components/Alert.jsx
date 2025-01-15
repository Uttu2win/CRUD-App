import React, { useEffect } from 'react';
import '../styles/Alert.css';

export const Alert = ({ type, message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`alert ${type}`}>
      <span className="message">{message}</span>
      <button className="close" onClick={onClose}>&times;</button>
    </div>
  );
};
