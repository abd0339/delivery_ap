import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState({
    id: orderId,
    status: '',
    pickup_address: '',
    delivery_address: '',
    driver_location: [51.505, -0.09], // Default location
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        setError('Failed to fetch order details');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  if (loading) return <p style={styles.loadingText}>Loading...</p>;
  if (error) return <p style={styles.errorText}>{error}</p>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Order Tracking</h1>
        <Link to="/shop-owner-dashboard" style={styles.navLink}>Back to Dashboard</Link>
      </header>

      <div style={styles.content}>
        <div style={styles.orderDetails}>
          <h2>Order #{order.id}</h2>
          <p><strong>Status:</strong> <span style={styles.status}>{order.status}</span></p>
          <p><strong>Pickup:</strong> {order.pickup_address}</p>
          <p><strong>Delivery:</strong> {order.delivery_address}</p>
        </div>

        <div style={styles.mapContainer}>
          <MapContainer
            center={order.driver_location}
            zoom={13}
            style={styles.map}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <Marker position={order.driver_location}>
              <Popup>Driver is here!</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

// CSS Styles (move to a separate CSS file or use CSS-in-JS)
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
