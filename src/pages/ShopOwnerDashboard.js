import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ShopOwnerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const shopOwnerId = localStorage.getItem("shopOwnerId");
        console.log("Shop Owner ID:", shopOwnerId);

        if (!shopOwnerId) {
          throw new Error("Shop owner ID not found. Please log in again.");
        }
        const ordersResponse = await axios.get(`http://localhost:3001/orders/shop/${shopOwnerId}`);
        const walletResponse = await axios.get(`http://localhost:3001/wallet/shop/${shopOwnerId}`);
        console.log("Orders:", ordersResponse.data);
        console.log("Wallet:", walletResponse.data);

        setOrders(ordersResponse.data);
        setWallet(walletResponse.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleLogout = () => {
    // Remove user data from localStorage and redirect to login page
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('shopOwnerId');
    navigate('/login'); // Redirect to login page
  };

  if (loading) return <p style={styles.loading}>Loading...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Shop Owner Dashboard</h1>
        <nav style={styles.nav}>
          <Link to="/create-order" style={styles.navLink}>Create Order</Link>
          <Link to="/wallet" style={styles.navLink}>Wallet</Link>
          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </nav>
      </header>

      <main style={styles.main}>
        <section style={styles.section}>
          <h2>Wallet Balance</h2>
          <p style={styles.walletBalance}>{wallet ? formatCurrency(wallet.balance) : '$0.00'}</p>
        </section>

        <section style={styles.section}>
          <h2>Orders</h2>
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer_id}</td> {/* if customer_name is not available */}
                    <td>{formatCurrency(order.total_amount)}</td>
                    <td>{order.status || "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
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
  nav: {
    display: 'flex',
    gap: '20px',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  main: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  section: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  walletBalance: {
    fontSize: '2rem',
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  loading: {
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '18px',
  },
  error: {
    textAlign: 'center',
    marginTop: '50px',
    color: 'red',
    fontSize: '18px',
  },
};

export default ShopOwnerDashboard;
