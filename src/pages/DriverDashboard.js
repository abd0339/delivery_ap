import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [balance, setBalance] = useState('$0.00');
  const [verificationStatus, setVerificationStatus] = useState({ 
    isVerified: false, 
    status: 'pending' 
  });
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
        const [
          availableOrdersRes, 
          currentOrdersRes, 
          walletRes, 
          verificationRes
        ] = await Promise.all([
          axios.get('http://localhost:3001/orders/available'),
          axios.get(`http://localhost:3001/orders/current/${driverId}`),
          axios.get(`http://localhost:3001/wallet/driver/${driverId}`),
          axios.get(`http://localhost:3001/verification/status/${driverId}`)
        ]);

        setAvailableOrders(availableOrdersRes.data);
        setCurrentOrders(currentOrdersRes.data);

        const rawBalance = walletRes.data.balance;
        const numericBalance = parseFloat(rawBalance) || 0;
        setBalance(`$${numericBalance.toFixed(2)}`);

        if (verificationRes.data.success) {
          setVerificationStatus({
            isVerified: verificationRes.data.isVerified,
            status: verificationRes.data.verificationStatus
          });
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response.data.message || 'Failed to fetch data');
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
      await axios.post('http://localhost:3001/orders/accept', { 
        orderId, 
        driverId 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh orders after acceptance
      const [available, current] = await Promise.all([
        axios.get('http://localhost:3001/orders/available'),
        axios.get(`http://localhost:3001/orders/current/${driverId}`)
      ]);
      
      setAvailableOrders(available.data);
      setCurrentOrders(current.data);
      
    } catch (err) {
      console.error('Accept order error:', err);
      setError(err.response.data.message || 'Failed to accept order');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("driverId");
    navigate('/login');
  };

  if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner}></div></div>;
  if (error) return <div style={styles.errorContainer}><p style={styles.errorText}>{error}</p></div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>Driver Dashboard</h1>
          <nav style={styles.nav}>
            <Link to="/profile" style={styles.navLink}>Profile</Link>
            <Link to="/wallet" style={styles.navLink}>Wallet</Link>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
              <span style={styles.logoutIcon}>→</span>
            </button>
          </nav>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.statusSection}>
          <div style={styles.balanceCard}>
            <div style={styles.cardIcon}>💰</div>
            <h3 style={styles.cardTitle}>Wallet Balance</h3>
            <p style={styles.balanceAmount}>{balance}</p>
            <Link to="/wallet" style={styles.walletLink}>
              View Transactions
              <span style={styles.linkArrow}>→</span>
            </Link>
          </div>
          <div style={styles.verificationCard}>
            <div style={styles.cardIcon}>
              {verificationStatus.isVerified ? '✅' : '🆔'}
            </div>
            <h3 style={styles.cardTitle}>ID Verification</h3>
            {verificationStatus.isVerified ? (
              <p style={styles.verifiedText}>Verified</p>
            ) : (
              <>
                <p style={styles.notVerifiedText}>
                  {verificationStatus.status.charAt(0).toUpperCase() + verificationStatus.status.slice(1)}
                </p>
                <Link to="/id-verification" style={styles.verifyLink}>
                  Verify Now
                  <span style={styles.linkArrow}>→</span>
                </Link>
              </>
            )}
          </div>
        </div>

        <div style={styles.ordersSection}>
          <h2 style={styles.sectionTitle}>Available Orders</h2>
          <div style={styles.ordersList}>
            {availableOrders.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📭</div>
                <p>No available orders at the moment</p>
              </div>
            ) : (
              availableOrders.map((order) => (
                <div key={order.id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <span style={styles.orderNumber}>Order #{order.id}</span>
                    <span style={styles.orderAmount}>${parseFloat(order.total_amount).toFixed(2)}</span>
                  </div>
                  <div style={styles.orderDetails}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Pickup:</span>
                      <span>{order.pickup_address}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Delivery:</span>
                      <span>{order.delivery_address}</span>
                    </div>
                  </div>
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
          <h2 style={styles.sectionTitle}>Current Orders</h2>
          <div style={styles.ordersList}>
            {currentOrders.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🚚</div>
                <p>You don't have any active orders</p>
              </div>
            ) : (
              currentOrders.map((order) => (
                <div key={order.id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <span style={styles.orderNumber}>Order #{order.id}</span>
                    <span style={styles.orderStatus} data-status={order.status}>
                      {order.status}
                    </span>
                  </div>
                  <div style={styles.orderDetails}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Pickup:</span>
                      <span>{order.pickup_address}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Delivery:</span>
                      <span>{order.delivery_address}</span>
                    </div>
                  </div>
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill,
                        width: order.status === 'delivered' ? '100%' : 
                              order.status === 'picked-up' ? '66%' : '33%'
                      }}
                    ></div>
                  </div>
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
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    color: '#333',
  },
  header: {
    backgroundColor: '#4f46e5',
    padding: '1.5rem 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    margin: 0,
    color: 'white',
    fontSize: '1.8rem',
    fontWeight: '600',
    letterSpacing: '-0.5px',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '0.5rem 0',
    position: 'relative',
    transition: 'all 0.2s ease',
    '&:hover': {
      opacity: 0.9,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '0',
      height: '2px',
      backgroundColor: 'white',
      transition: 'width 0.3s ease',
    },
    '&:hover::after': {
      width: '100%',
    },
  },
  logoutButton: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid white',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
  },
  logoutIcon: {
    transition: 'transform 0.2s ease',
  },
  'logoutButton:hover $logoutIcon': {
    transform: 'translateX(2px)',
  },
  content: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 2rem',
  },
  statusSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  balanceCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
    },
  },
  verificationCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
    },
  },
  cardIcon: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
    color: '#111827',
  },
  balanceAmount: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0.5rem 0 1rem 0',
    color: '#4f46e5',
  },
  walletLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      color: '#4338ca',
    },
  },
  verifyLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      color: '#4338ca',
    },
  },
  linkArrow: {
    transition: 'transform 0.2s ease',
  },
  'walletLink:hover $linkArrow': {
    transform: 'translateX(2px)',
  },
  verifiedText: {
    color: '#10b981',
    fontWeight: '500',
    margin: '0.5rem 0',
  },
  notVerifiedText: {
    color: '#ef4444',
    fontWeight: '500',
    margin: '0.5rem 0',
  },
  ordersSection: {
    marginTop: '2.5rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#111827',
    position: 'relative',
    paddingBottom: '0.5rem',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '50px',
      height: '3px',
      backgroundColor: '#4f46e5',
      borderRadius: '3px',
    },
  },
  ordersList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  orderCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
    },
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #e5e7eb',
  },
  orderNumber: {
    fontWeight: '600',
    color: '#111827',
  },
  orderAmount: {
    fontWeight: '700',
    color: '#4f46e5',
    fontSize: '1.1rem',
  },
  orderStatus: {
    fontWeight: '600',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    textTransform: 'capitalize',
    '&[data-status="pending"]': {
      backgroundColor: '#fef3c7',
      color: '#92400e',
    },
    '&[data-status="accepted"]': {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
    },
    '&[data-status="picked-up"]': {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    '&[data-status="delivered"]': {
      backgroundColor: '#dcfce7',
      color: '#166534',
    },
  },
  orderDetails: {
    marginBottom: '1.5rem',
  },
  detailItem: {
    display: 'flex',
    marginBottom: '0.75rem',
    fontSize: '0.95rem',
  },
  detailLabel: {
    fontWeight: '600',
    minWidth: '80px',
    color: '#6b7280',
  },
  acceptButton: {
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    width: '100%',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#4338ca',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },
  progressBar: {
    height: '6px',
    backgroundColor: '#e5e7eb',
    borderRadius: '3px',
    marginTop: '1rem',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '3rem 0',
    color: '#6b7280',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    opacity: 0.5,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #e5e7eb',
    borderTop: '5px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    padding: '2rem',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '1.2rem',
    textAlign: 'center',
    maxWidth: '600px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
};

export default DriverDashboard;