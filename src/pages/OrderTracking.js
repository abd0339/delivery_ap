import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { io } from 'socket.io-client';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

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
    socketRef.current.emit('chatMessage', msgData);
    setNewMessage('');
  };

  return (
    <div style={chatStyles.chatContainer}>
      <h3 style={chatStyles.chatTitle}>Order Chat</h3>
      <div style={chatStyles.chatMessages}>
        {messages.map((msg, i) => (
          <div 
            key={i} 
            style={msg.sender === userType ? chatStyles.myMessage : chatStyles.theirMessage}
          >
            {msg.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={chatStyles.inputRow}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={chatStyles.input}
          placeholder="Type a message..."
        />
        <button onClick={handleSend} style={chatStyles.sendButton}>
          Send
        </button>
      </div>
    </div>
  );
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const socketRef = useRef(null);
  const driverId = localStorage.getItem('driverId');

  const handleMarkDelivered = async () => {
    try {
      await axios.put(`http://localhost:3001/orders/mark-delivered/${orderId}`);
      alert('Order marked as delivered!');
      navigate('/driver-dashboard');
    } catch (err) {
      console.error('Failed to mark delivered:', err);
    }
  };

  useEffect(() => {
    axios.get(`http://localhost:3001/orders/${orderId}`)
      .then(res => setOrder(res.data))
      .catch(() => console.error('Order fetch failed'));
  }, [orderId]);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.on(`orderLocationUpdate:${orderId}`, data => {
      setDriverLocation([data.lat, data.lng]);
    });

    if (driverId) {
      const watchId = navigator.geolocation.watchPosition(
        ({ coords }) => {
          socketRef.current.emit('driverLocation', {
            orderId,
            lat: coords.latitude,
            lng: coords.longitude
          });
        },
        err => console.error(err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 3000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }

    return () => socketRef.current.disconnect();
  }, [orderId, driverId]);

  return (
    <div style={styles.container}>
      <MapContainer center={[33.89, 35.5]} zoom={13} style={styles.map}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {driverLocation && (
          <Marker position={driverLocation}>
            <Popup>Driver is here!</Popup>
          </Marker>
        )}
      </MapContainer>

      <ChatBox orderId={orderId} userType={driverId ? 'driver' : 'customer'} />

      {driverId && (
        <button onClick={handleMarkDelivered} style={styles.deliverButton}>
          Mark as Delivered
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
    padding: '20px'
  },
  map: {
    height: '400px',
    width: '100%',
    borderRadius: '5px',
    marginBottom: '20px'
  },
  deliverButton: {
    padding: '12px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '20px'
  }
};

const chatStyles = {
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

export default OrderTracking;