import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
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

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const socketRef = useRef(null);

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

    const driverId = localStorage.getItem('driverId');
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
  }, [orderId]);

  return (
    <MapContainer center={[33.89, 35.5]} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {driverLocation && (
        <Marker position={driverLocation}>
          <Popup>Driver is here!</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};


const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    margin: 0,
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
  },
  content: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  orderDetails: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  status: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  mapContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  map: {
    height: '400px',
    width: '100%',
    borderRadius: '5px',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '18px',
  },
  errorText: {
    textAlign: 'center',
    marginTop: '50px',
    color: 'red',
    fontSize: '18px',
  },
};

export default OrderTracking;
