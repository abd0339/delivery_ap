import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { io } from 'socket.io-client';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import ChatBox from './ChatBox'; // ✅ Make sure the path is correct
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const notificationSound = new Audio('/notification.mp3'); // 🔊 already placed in public/

// Fix Leaflet icons
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const SOCKET_SERVER_URL = 'http://localhost:3001';

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
    socketRef.current.emit('joinRoom', { orderId });
    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.on('orderAccepted', (data) => {
      if (data.orderId === orderId) {
        toast.info('🚚 Driver accepted your order! Tracking started.', {
          position: 'top-right',
          autoClose: 5000,
          pauseOnHover: true,
          draggable: true
        });
        notificationSound.play();
      }
    });
    

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

      {driverId && (
        <button onClick={handleMarkDelivered} style={styles.deliverButton}>
          Mark as Delivered
        </button>
      )}

      {/* ✅ Chat for driver & customer */}
      <ChatBox orderId={orderId} userType={driverId ? 'driver' : 'customer'} />
      <ToastContainer />
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
    marginBottom: '20px'
  }
};

export default OrderTracking;
