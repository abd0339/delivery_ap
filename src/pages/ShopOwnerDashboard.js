import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ShopOwnerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [hoveredItem, setHoveredItem] = useState(null);
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
        const walletResponse = await axios.get(`http://localhost:3001/wallet/shopowner/${shopOwnerId}`);
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
      currency: 'LBP',
    }).format(amount);
  };

  const handleLogout = () => {
    // Remove user data from localStorage and redirect to login page
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('shopOwnerId');
    navigate('/login'); // Redirect to login page
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingSpinner}></div>
      <p style={styles.loadingText}>Loading your dashboard...</p>
    </div>
  );

  if (error) return (
    <div style={styles.errorContainer}>
      <div style={styles.errorIcon}>!</div>
      <p style={styles.errorText}>{error}</p>
      <button
        style={styles.errorButton}
        onClick={() => window.location.reload()}
        onMouseEnter={() => setHoveredItem('errorButton')}
        onMouseLeave={() => setHoveredItem(null)}

      >
        Try Again
      </button>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <h2 style={styles.logo}>DeliveryApp</h2>
        </div>
        <div style={styles.menuItems}>
          <div 
            style={{
              ...styles.menuItem,
              ...(activeSection === 'dashboard' && styles.activeMenuItem),
              ...(hoveredItem === 'dashboard' && styles.menuItemHover)
            }}
            onClick={() => setActiveSection('dashboard')}
            onMouseEnter={() => setHoveredItem('dashboard')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <span style={styles.menuIcon}>📊</span>
            Dashboard
          </div>
          <Link to="/create-order" style={styles.menuItemLink}>
            <div 
              style={{
                ...styles.menuItem,
                ...(hoveredItem === 'createOrder' && styles.menuItemHover)
              }}
              onMouseEnter={() => setHoveredItem('createOrder')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={styles.menuIcon}>➕</span>
              Create Order
            </div>
          </Link>
          <Link to="/wallet" style={styles.menuItemLink}>
            <div 
              style={{
                ...styles.menuItem,
                ...(hoveredItem === 'wallet' && styles.menuItemHover)
              }}
              onMouseEnter={() => setHoveredItem('wallet')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={styles.menuIcon}>💰</span>
              Wallet
            </div>
          </Link>

          <Link to="/profile" style={styles.menuItemLink}>
            <div 
              style={{
                ...styles.menuItem,
                ...(hoveredItem === 'profile' && styles.menuItemHover)
              }}
              onMouseEnter={() => setHoveredItem('profile')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={styles.menuIcon}>📩</span>
              profile
            </div>
          </Link>

        </div>
        <div style={styles.sidebarFooter}>
          <button 
            onClick={handleLogout} 
            style={{
              ...styles.logoutButton,
              ...(hoveredItem === 'logout' && styles.logoutButtonHover)
            }}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>Shop Owner Dashboard</h1>
          <div style={styles.headerRight}>
            <div style={styles.dateTime}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div style={styles.userInfo}>
              <div 
                style={{
                  ...styles.userAvatar,
                  ...(hoveredItem === 'avatar' && styles.userAvatarHover)
                }}
                onMouseEnter={() => setHoveredItem('avatar')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                SO
              </div>
            </div>
          </div>
        </header>

        <main style={styles.main}>
          <div style={styles.dashboardSummary}>
            <div 
              style={{
                ...styles.summaryCard,
                ...(hoveredItem === 'walletCard' && styles.summaryCardHover)
              }}
              onMouseEnter={() => setHoveredItem('walletCard')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div style={styles.summaryIconContainer}>
                <span style={styles.summaryIcon}>💰</span>
              </div>
              <div style={styles.summaryContent}>
                <h3 style={styles.summaryTitle}>Wallet Balance</h3>
                <p style={styles.walletBalance}>{wallet ? formatCurrency(wallet.balance) : '(L.L)0.00'}</p>
              </div>
            </div>
            
            <div 
              style={{
                ...styles.summaryCard,
                ...(hoveredItem === 'ordersCard' && styles.summaryCardHover)
              }}
              onMouseEnter={() => setHoveredItem('ordersCard')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div style={styles.summaryIconContainer}>
                <span style={styles.summaryIcon}>📦</span>
              </div>
              <div style={styles.summaryContent}>
                <h3 style={styles.summaryTitle}>Total Orders</h3>
                <p style={styles.summaryValue}>{orders.length}</p>
              </div>
            </div>
            
            <div 
              style={{
                ...styles.summaryCard,
                ...(hoveredItem === 'pendingCard' && styles.summaryCardHover)
              }}
              onMouseEnter={() => setHoveredItem('pendingCard')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div style={styles.summaryIconContainer}>
                <span style={styles.summaryIcon}>🔄</span>
              </div>
              <div style={styles.summaryContent}>
                <h3 style={styles.summaryTitle}>Pending Orders</h3>
                <p style={styles.summaryValue}>
                  {orders.filter(order => order.status === 'Pending' || !order.status).length}
                </p>
              </div>
            </div>
          </div>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Recent Orders</h2>
              <button 
                style={{
                  ...styles.viewAllButton,
                  ...(hoveredItem === 'viewAll' && styles.viewAllButtonHover)
                }}
                onMouseEnter={() => setHoveredItem('viewAll')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                View All
              </button>
            </div>
            
            {orders.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>📭</div>
                <p style={styles.emptyStateText}>No orders found.</p>
                <Link 
                  to="/create-order" 
                  style={{
                    ...styles.emptyStateButton,
                    ...(hoveredItem === 'createFirst' && styles.emptyStateButtonHover)
                  }}
                  onMouseEnter={() => setHoveredItem('createFirst')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  Create Your First Order
                </Link>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.tableHeaderCell}>Order ID</th>
                      <th style={styles.tableHeaderCell}>Customer</th>
                      <th style={styles.tableHeaderCell}>Total</th>
                      <th style={styles.tableHeaderCell}>Status</th>
                      <th style={styles.tableHeaderCell}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr 
                        key={order.order_id} 
                        style={{
                          ...(index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd),
                          ...(hoveredItem === `row-${order.id}` && styles.tableRowHover)
                        }}
                        onMouseEnter={() => setHoveredItem(`row-${order.id}`)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <td style={styles.tableCell}>{order.order_id}</td>
                        <td style={styles.tableCell}>{order.customer_id}</td>
                        <td style={styles.tableCell}>{formatCurrency(order.total_amount)}</td>
                        <td style={styles.tableCell}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: 
                              (order.status === 'Completed' ? '#4caf50' : 
                              order.status === 'Processing' ? '#2196f3' : 
                              order.status === 'Cancelled' ? '#f44336' : '#ff9800')
                          }}>
                            {order.status || "Pending"}
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          <button onClick={() => navigate(`/track-order/${order.order_id}`)}
                            style={{
                              ...styles.viewButton,
                              ...(hoveredItem === `view-${order.order_id}` && styles.viewButtonHover)
                            }}
                            onMouseEnter={() => setHoveredItem(`view-${order.order_id}`)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

const styles = {
  // Main container
  container: {
    fontFamily: "'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    display: 'flex',
    margin: 0,
    padding: 0,
    transition: 'all 0.3s ease',
    backgroundImage: 'url("/images/shopDashboard.png")',
  },

  // Sidebar styles
  sidebar: {
    width: '260px',
    backgroundColor: '#0f172a',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    boxShadow: '2px 0px 10px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    zIndex: 10,
  },
  logoContainer: {
    padding: '24px',
    borderBottom: '1px solid #1e293b',
  },
  logo: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
    background: 'linear-gradient(45deg, #4ade80, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center',
  },
  menuItems: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    flex: 1,
  },
  menuItem: {
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    color: '#cbd5e1',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderLeft: '4px solid transparent',
    marginBottom: '5px',
  },
  menuItemHover: {
    backgroundColor: '#1e293b',
    color: '#fff',
    borderLeft: '4px solid #4ade80',
    transform: 'translateX(5px)',
  },
  activeMenuItem: {
    backgroundColor: '#1e293b',
    color: '#fff',
    borderLeft: '4px solid #4ade80',
  },
  menuItemLink: {
    textDecoration: 'none',
  },
  menuIcon: {
    marginRight: '12px',
    fontSize: '18px',
    transition: 'transform 0.3s ease',
  },
  sidebarFooter: {
    padding: '20px',
    borderTop: '1px solid #1e293b',
  },
  logoutButton: {
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#cbd5e1',
    border: '1px solid #475569',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    width: '100%',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
  },
  logoutButtonHover: {
    backgroundColor: '#dc2626',
    color: '#fff',
    border: '1px solid #dc2626',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(220, 38, 38, 0.2)',
  },

  // Content area
  content: {
    flex: 1,
    marginLeft: '260px',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
  },

  // Header
  header: {
    backgroundColor: 'yellow',
    padding: '20px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 5,
  },
  headerTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#1e293b',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  dateTime: {
    color: '#64748b',
    fontSize: '14px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  userAvatarHover: {
    transform: 'scale(1.1)',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
  },

  // Main content area
  main: {
    padding: '30px',
    flex: 1,
  },

  // Dashboard summary cards
  dashboardSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '30px',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid #e2e8f0',
  },
  summaryCardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
    borderColor: '#cbd5e1',
  },
  summaryIconContainer: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '20px',
    background: 'linear-gradient(45deg, rgba(74, 222, 128, 0.2), rgba(59, 130, 246, 0.2))',
    transition: 'all 0.3s ease',
  },
  summaryIcon: {
    fontSize: '28px',
    transition: 'transform 0.3s ease',
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    margin: '0 0 5px 0',
    fontSize: '16px',
    color: '#64748b',
    fontWeight: 500,
  },
  walletBalance: {
    fontSize: '28px',
    color: '#0f172a',
    fontWeight: 700,
    margin: 0,
  },
  summaryValue: {
    fontSize: '28px',
    color: '#0f172a',
    fontWeight: 700,
    margin: 0,
  },

  // Section styles
  section: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    marginBottom: '30px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#1e293b',
  },
  viewAllButton: {
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  viewAllButtonHover: {
    backgroundColor: '#e2e8f0',
    color: '#334155',
    transform: 'translateY(-2px)',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },

  // Table styles
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 10px',
    marginTop: '10px',
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
  },
  tableHeaderCell: {
    padding: '16px',
    textAlign: 'left',
    color: '#64748b',
    fontWeight: 600,
    fontSize: '14px',
    borderBottom: '1px solid #e2e8f0',
  },
  tableRowEven: {
    backgroundColor: '#fff',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  tableRowOdd: {
    backgroundColor: '#f8fafc',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  tableRowHover: {
    backgroundColor: '#f1f5f9',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px',
    color: '#334155',
    borderBottom: '1px solid #e2e8f0',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#fff',
    display: 'inline-block',
  },
  viewButton: {
    padding: '6px 12px',
    backgroundColor: '#e0f2fe',
    color: '#0284c7',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  viewButtonHover: {
    backgroundColor: '#bae6fd',
    transform: 'translateY(-2px)',
    boxShadow: '0 2px 5px rgba(2, 132, 199, 0.2)',
  },

  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '40px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    transition: 'transform 0.3s ease',
    ':hover': {
      transform: 'scale(1.1)',
    },
  },
  emptyStateText: {
    fontSize: '16px',
    color: '#64748b',
    margin: '0 0 20px 0',
  },
  emptyStateButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  emptyStateButtonHover: {
    backgroundColor: '#2563eb',
    transform: 'translateY(-3px)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },

  // Loading state
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa',
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '3px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '50%',
    borderTop: '3px solid #3b82f6',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  },
  loadingText: {
    color: '#64748b',
    fontSize: '16px',
  },

  // Error state
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa',
  },
  errorIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#fee2e2',
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  errorText: {
    color: '#64748b',
    fontSize: '16px',
    marginBottom: '20px',
  },
  errorButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  errorButtonHover: {
    backgroundColor: '#2563eb',
    transform: 'translateY(-3px)',
    boxShadow: '0 4px 8px rgba(37, 99, 235, 0.2)',
  },
};

export default ShopOwnerDashboard;

