import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';
import ChatBox from './ChatBox';
import { toast, ToastContainer } from 'react-toastify';
import { io } from 'socket.io-client';
import 'react-toastify/dist/ReactToastify.css';

const SOCKET_SERVER_URL = 'http://localhost:3001';
const GOOGLE_MAPS_API_KEY = 'AIzaSyDBz09hJefhlXJUFtOd9p34dSa9aHO0lz4';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '10px',
  marginBottom: '20px'
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const socketRef = useRef(null);
  const driverId = localStorage.getItem('driverId');
  const [routeDuration, setRouteDuration] = useState('');
  const [routeDistance, setRouteDistance] = useState('');

  function parseLatLngFromText(text) {
    try {
      if (!text || typeof text !== 'string') return null;
  
      if (text.includes('Lat:') && text.includes('Lng:')) {
        const match = text.match(/Lat:([-+]?[0-9]*\.?[0-9]+),Lng:([-+]?[0-9]*\.?[0-9]+)/);
        if (!match) return null;
        return {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2])
        };
      }
  
      // Fallback if it's a plain object string like {"lat":34.4,"lng":35.8}
      const parsed = JSON.parse(text);
      if (parsed && parsed.lat && parsed.lng) return parsed;
  
      return null;
    } catch (err) {
      console.error("❌ Failed to parse pickup location:", err);
      return null;
    }
  }  

  const { pickup, destination } = useMemo(() => {
    if (!order) return { pickup: null, destination: null };

    const delivery = (() => {
      try {
        const d = JSON.parse(order.delivery_address);
        return d && d.lat && d.lng ? d : null;
      } catch (err) {
        return null;
      }
    })();

    const pickupCoords = parseLatLngFromText(order.origin_address);

    return { pickup: pickupCoords, destination: delivery };
  }, [order]);


  const handleMarkDelivered = async () => {
    try {
      await axios.put(`http://localhost:3001/orders/mark-delivered/${orderId}`);
      alert('Order marked as delivered!');
      navigate('/driver-dashboard');
    } catch (err) {
      console.error('Failed to mark delivered:', err);
    }
  };

  // 1. Fetch order
  useEffect(() => {
    axios.get(`http://localhost:3001/orders/${orderId}`)
      .then(res => setOrder(res.data))
      .catch(() => console.error('Order fetch failed'));
  }, [orderId]);

  // 2. Set up socket and  driver location
  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      query: { driverId }
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to socket');
      socket.emit('joinRoom', { orderId });
    });

    socket.on('orderAccepted', (data) => {
      if (data.orderId === orderId) {
        toast.info('🚚 Driver accepted your order! Tracking started.', {
          position: 'top-right',
          autoClose: 5000,
          pauseOnHover: true,
          draggable: true
        });
        new Audio('/notification.mp3').play();
      }
    });

    socket.on(`orderLocationUpdate:${orderId}`, (data) => {
      const location = { lat: data.lat, lng: data.lng };
      console.log("📡 Location received from server:", location);
      setDriverLocation(location);
    });

    if (driverId) {
      const watchId = navigator.geolocation.watchPosition(
        ({ coords }) => {
          if (socket.connected) {
            socket.emit('driverLocation', {
              orderId,
              lat: coords.latitude,
              lng: coords.longitude
            });
          }
        },
        err => console.error(err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 3000 }
      );
      return () => {
        navigator.geolocation.clearWatch(watchId);
        socket.disconnect();
      };
    }

    return () => socket.disconnect();
  }, [orderId, driverId]);

  // 3. Use Google Maps Directions API when both points are ready
  useEffect(() => {
    console.log("📍 Driver Location:", driverLocation);
    console.log("🏁 Destination:", destination);
    console.log("📦 Pickup:", pickup);
    console.log("🧭 Directions:", directions);
    if (!driverLocation || !pickup || !destination) return;

    const service = new window.google.maps.DirectionsService();

    service.route({
      origin: driverLocation,
      destination,
      waypoints: [
        { location: pickup, stopover: true }
      ],
      travelMode: window.google.maps.TravelMode.DRIVING
    }, (result, status) => {
      if (status === 'OK') {
        setDirections(result);
        // Combine distances and durations from both legs
        const leg1 = result.routes[0].legs[0];
        const leg2 = result.routes[0].legs[1];
        const totalDuration = `${leg1.duration.text} + ${leg2.duration.text}`;
        const totalDistance = `${leg1.distance.text} + ${leg2.distance.text}`;
        setRouteDuration(totalDuration);
        setRouteDistance(totalDistance);
      } else {
        console.error('Directions request failed due to', status);
      }
    });

  }, [driverLocation, pickup, destination]);

  return (
    <div style={styles.container}>
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={driverLocation || { lat: 33.89, lng: 35.5 }}
          zoom={13}
        >
          {driverLocation && <Marker position={driverLocation} label="Driver" />}
          {pickup && typeof pickup === 'object' && <Marker position={pickup} label="📦 Pickup" />}
          {destination && <Marker position={destination} label="Drop-off" />}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </LoadScript>
      {routeDuration && routeDistance && (
        <div style={styles.routeInfo}>
          <p><strong>Estimated Time:</strong> {routeDuration}</p>
          <p><strong>Distance:</strong> {routeDistance}</p>
        </div>
      )}
      {driverId && (
        <button onClick={handleMarkDelivered} style={styles.deliverButton}>
          Mark as Delivered
        </button>
      )}

      <ChatBox orderId={orderId} userType={driverId ? 'driver' : 'customer'} />
      <ToastContainer />
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f7fa',
    minHeight: '100vh',
  },
  deliverButton: {
    padding: '12px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '20px 0'
  },
  routeInfo: {
    marginTop: '10px',
    backgroundColor: '#ffffff',
    padding: '10px 15px',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    fontSize: '15px'
  },

};

export default OrderTracking;
