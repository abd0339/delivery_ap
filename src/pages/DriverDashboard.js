import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';/* live location*/
import { toast, ToastContainer } from 'react-toastify';/*for notification sound*/
import 'react-toastify/dist/ReactToastify.css';


const notificationSound = new Audio('/notification.mp3'); // put notification.mp3 in public folder
const DriverDashboard = () => {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [balance, setBalance] = useState('$0.00');
  const [vehicleType, setVehicleType] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState({
    isVerified: false,
    status: 'pending'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    const driverId = localStorage.getItem("driverId");

    socket.on('connect', () => {
      if (driverId) {
        socket.emit('registerDriver', driverId);
      }
    });

    if (socket && driverId) {
      socket.on('newAssignedOrder', (data) => {
        toast.success(`📦 New Order Assigned! Order #${data.orderId}`, {
          position: 'top-right',
          autoClose: 5000,
          pauseOnHover: true,
          draggable: true
        });

        notificationSound.play();

        setTimeout(() => {
          navigate(`/track-order/${data.orderId}`);
        }, 3000);
      });
    }

    const fetchData = async () => {
      if (!driverId) {
        setError("Driver not logged in. Please log in.");
        setLoading(false);
        return;
      }
      const driverRes = await axios.get(`http://localhost:3001/drivers/${driverId}`);
      setVehicleType(driverRes.data.vehicle_type);

      try {
        const [
          availableOrdersRes,
          currentOrdersRes,
          walletRes,
          verificationRes
        ] = await Promise.all([
          axios.get(`http://localhost:3001/orders/available?vehicleType=${driverRes.data.vehicle_type}`),
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

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const handleAcceptOrder = async (orderId) => {
    const driverId = localStorage.getItem("driverId");
    console.log("Accepting Order", { orderId, driverId });
    if (!driverId) {
      setError("Driver not logged in.");
      navigate('/login');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3001/orders/accept', {
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
      if (res.data.success) {
        navigate(`/track-order/${orderId}`);
      }
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
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .nav-link {
            color: white;
            text-decoration: none;
            font-size: 1rem;
            font-weight: 500;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            position: relative;
            transition: all 0.3s ease;
            background: transparent;
          }
          
          .nav-link:hover {
            background-color: rgba(255, 255, 255, 0.15);
            transform: translateY(-1px);
            color: #f0f0f0;
          }
          
          .logout-button {
            background-color: transparent;
            color: white;
            border: 2px solid white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
          }
          
          .logout-button:hover {
            background-color: white;
            color: #4f46e5;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
          }
          
          .logout-button:hover .logout-icon {
            transform: translateX(3px);
          }
          
          .wallet-link, .verify-link {
            color: #4f46e5;
            text-decoration: none;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            transition: all 0.3s ease;
            background: transparent;
          }
          
          .wallet-link:hover, .verify-link:hover {
            background-color: rgba(79, 70, 229, 0.1);
            color: #3730a3;
            transform: translateX(3px);
          }
          
          .wallet-link:hover .link-arrow, .verify-link:hover .link-arrow {
            transform: translateX(4px);
          }
          
          .accept-button {
            background: linear-gradient(135deg, #4f46e5, #6366f1);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            width: 100%;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .accept-button:hover {
            background: linear-gradient(135deg, #4338ca, #5b21b6);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4);
          }
          
          .accept-button:active {
            transform: translateY(-1px);
          }
          
          .order-card, .balance-card, .verification-card {
            transition: all 0.3s ease;
          }
          
          .order-card:hover, .balance-card:hover, .verification-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
          }
          
          .card-icon {
            transition: all 0.3s ease;
          }
          
          .balance-card:hover .card-icon,
          .verification-card:hover .card-icon {
            transform: scale(1.1) rotate(5deg);
          }
        `}
      </style>

      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>Driver Dashboard</h1>
          <nav style={styles.nav}>
            <Link to="/profile" className="nav-link">Profile</Link>
            <Link to="/wallet" className="nav-link">Wallet</Link>
            <button onClick={handleLogout} className="logout-button">
              Logout
              <span className="logout-icon" style={styles.logoutIcon}>→</span>
            </button>
          </nav>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.statusSection}>
          <div className="balance-card" style={styles.balanceCard}>
            <div className="card-icon" style={styles.cardIcon}>💰</div>
            <h3 style={styles.cardTitle}>Wallet Balance</h3>
            <p style={styles.balanceAmount}>{balance}</p>
            <Link to="/wallet" className="wallet-link">
              View Transactions
              <span className="link-arrow" style={styles.linkArrow}>→</span>
            </Link>
          </div>
          <div className="verification-card" style={styles.verificationCard}>
            <div className="card-icon" style={styles.cardIcon}>
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
                <Link to="/id-verification" className="verify-link">
                  Verify Now
                  <span className="link-arrow" style={styles.linkArrow}>→</span>
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
                  <div key={order.order_id} className="order-card" style={styles.orderCard}>
                    <div style={styles.orderHeader}>
                      <span style={styles.orderNumber}>Order #{order.order_id}</span>
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
                      onClick={() => handleAcceptOrder(order.order_id)}
                      className="accept-button"
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
                  <div key={order.order_id} className="order-card" style={styles.orderCard}>
                    <div style={styles.orderHeader}>
                      <span style={styles.orderNumber}>Order #{order.order_id}</span>
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
      <ToastContainer />
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    minHeight: '100vh',
    backgroundImage: 'url("/images/driverDashboard.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    position: 'relative',
    color: '#333',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 1,
  },
  header: {
    backgroundColor: 'rgba(255, 16, 16, 0.7)',
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
    gap: '1rem',
  },
  logoutIcon: {
    transition: 'transform 0.3s ease',
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
    backgroundColor: 'rgba(255, 132, 16, 0.97)',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    cursor: 'default',
  },
  verificationCard: {
    backgroundColor: 'rgba(255, 132, 16, 0.97)',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    cursor: 'default',
  },
  cardIcon: {
    fontSize: '2rem',
    marginBottom: '1rem',
    display: 'inline-block',
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
  linkArrow: {
    transition: 'transform 0.3s ease',
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
  },
  ordersList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  orderCard: {
    backgroundColor: 'rgba(255, 251, 16, 0.97)',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    cursor: 'default',
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
};

export default DriverDashboard;