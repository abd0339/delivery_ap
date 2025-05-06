import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [balance, setBalance] = useState('$0.00');
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const driverId = localStorage.getItem("driverId");
      if (!driverId) {
        setError("Driver not logged in. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const [availableOrdersRes, currentOrdersRes, walletRes, verificationRes] = await Promise.all([
          axios.get('http://localhost:3001/orders/available'),
          axios.get(`http://localhost:3001/orders/current/${driverId}`),
          axios.get(`http://localhost:3001/wallet/${driverId}`),
          axios.get(`http://localhost:3001/verification/${driverId}`)
        ]);

        setAvailableOrders(availableOrdersRes.data);
        setCurrentOrders(currentOrdersRes.data);
        setBalance(`$${walletRes.data.balance.toFixed(2)}`);
        setIsVerified(verificationRes.data.isVerified);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAcceptOrder = async (orderId) => {
    const driverId = localStorage.getItem("driverId");
    if (!driverId) {
      setError("Driver not logged in.");
      navigate('/login');
      return;
    }

    try {
      await axios.post('http://localhost:3001/orders/accept', { orderId, driverId });
      navigate('/current-orders');
    } catch (err) {
      console.error('Accept order error:', err);
      setError('Failed to accept order');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("driverId");
    navigate('/login');
  };

  if (loading) return <p style={styles.loadingText}>Loading...</p>;
  if (error) return <p style={styles.errorText}>{error}</p>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Driver Dashboard</h1>
        <nav style={styles.nav}>
          <Link to="/profile" style={styles.navLink}>Profile</Link>
          <Link to="/wallet" style={styles.navLink}>Wallet</Link>
          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </nav>
      </header>

      <div style={styles.content}>
        <div style={styles.statusSection}>
          <div style={styles.balanceCard}>
            <h3>Wallet Balance</h3>
            <p style={styles.balanceAmount}>{balance}</p>
            <Link to="/wallet" style={styles.walletLink}>View Transactions</Link>
          </div>
          <div style={styles.verificationCard}>
            <h3>ID Verification</h3>
            {isVerified ? (
              <p style={styles.verifiedText}>✅ Verified</p>
            ) : (
              <>
                <p style={styles.notVerifiedText}>❌ Not Verified</p>
                <Link to="/id-verification" style={styles.navLink}>Verify Now</Link>
              </>
            )}
          </div>
        </div>

        <div style={styles.ordersSection}>
          <h2>Available Orders</h2>
          <div style={styles.ordersList}>
            {availableOrders.length === 0 ? (
              <p>No available orders.</p>
            ) : (
              availableOrders.map((order) => (
                <div key={order.id} style={styles.orderCard}>
                  <p><strong>Order #{order.id}</strong></p>
                  <p>Pickup: {order.pickup_address}</p>
                  <p>Delivery: {order.delivery_address}</p>
                  <p>Amount: ${order.total_amount.toFixed(2)}</p>
                  <button
                    onClick={() => handleAcceptOrder(order.id)}
                    style={styles.acceptButton}
                  >
                    Accept Order
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.ordersSection}>
          <h2>Current Orders</h2>
          <div style={styles.ordersList}>
            {currentOrders.length === 0 ? (
              <p>No current orders.</p>
            ) : (
              currentOrders.map((order) => (
                <div key={order.id} style={styles.orderCard}>
                  <p><strong>Order #{order.id}</strong></p>
                  <p>Pickup: {order.pickup_address}</p>
                  <p>Delivery: {order.delivery_address}</p>
                  <p>Status: <span style={styles.status}>{order.status}</span></p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    margin: '20px',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: '10px 0',
    textAlign: 'center',
    color: 'white',
  },
  headerTitle: {
    margin: 0,
  },
  nav: {
    marginTop: '10px',
  },
  navLink: {
    marginRight: '15px',
    textDecoration: 'none',
    color: 'white',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    cursor: 'pointer',
    marginLeft: '20px',
  },
  content: {
    marginTop: '20px',
  },
  statusSection: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  balanceCard: {
    width: '45%',
    padding: '10px',
    backgroundColor: '#f1f1f1',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  verificationCard: {
    width: '45%',
    padding: '10px',
    backgroundColor: '#f1f1f1',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  balanceAmount: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  walletLink: {
    color: '#4CAF50',
    textDecoration: 'none',
  },
  verifiedText: {
    color: 'green',
  },
  notVerifiedText: {
    color: 'red',
  },
  ordersSection: {
    marginTop: '30px',
  },
  ordersList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  orderCard: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    marginTop: '10px',
    cursor: 'pointer',
  },
  status: {
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
  },
};

export default DriverDashboard;
