// ✅ ChatBox.js — Real-time Chat Component

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const SOCKET_SERVER_URL = 'http://localhost:3001';

const ChatBox = ({ orderId, userType }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    socketRef.current.emit('joinRoom', { orderId });

    socketRef.current.on('chatMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [orderId]);

  useEffect(() => {
    bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msgData = {
      orderId,
      sender: userType,
      message: newMessage
    };
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('chatMessage', msgData);
      setNewMessage('');
    }
  };

  return (
    <div style={styles.chatContainer}>
      <h3 style={styles.chatTitle}>Chat</h3>
      <div style={styles.chatMessages}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={msg.sender === userType ? styles.myMessage : styles.theirMessage}
          >
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={styles.inputRow}>
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSend} style={styles.sendButton}>Send</button>
      </div>
    </div>
  );
};

const styles = {
  chatContainer: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 0 8px rgba(0,0,0,0.1)'
  },
  chatTitle: {
    marginBottom: '10px'
  },
  chatMessages: {
    height: '200px',
    overflowY: 'auto',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    marginBottom: '10px'
  },
  inputRow: {
    display: 'flex',
    gap: '10px'
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc'
  },
  sendButton: {
    padding: '10px 15px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  myMessage: {
    textAlign: 'right',
    backgroundColor: '#e0f7fa',
    marginBottom: '5px',
    padding: '5px 10px',
    borderRadius: '8px'
  },
  theirMessage: {
    textAlign: 'left',
    backgroundColor: '#eeeeee',
    marginBottom: '5px',
    padding: '5px 10px',
    borderRadius: '8px'
  }
};

export default ChatBox;
