import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: '$0',
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, ordersRes, verRes, analyticsRes] = await Promise.all([
          axios.get('http://localhost:3001/admin/users', { withCredentials: true }),
          axios.get('http://localhost:3001/admin/orders', { withCredentials: true }),
          axios.get('http://localhost:3001/admin/verification-requests', { withCredentials: true }),
          axios.get('http://localhost:3001/admin/analytics', { withCredentials: true })
        ]);

        setUsers(usersRes.data.users || usersRes.data);
        setOrders(ordersRes.data.orders || ordersRes.data);
        setVerifications(verRes.data.requests || verRes.data);
        setAnalytics(analyticsRes.data.analytics || analyticsRes.data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchVerifications = async () => {
    try {
      const response = await fetch("http://localhost:3001/admin/driver-verifications");
      const data = await response.json();
      setVerifications(data);
    } catch (error) {
      console.error("Failed to fetch verifications:", error);
    }
  };

  const handleVerify = async (driverId, status) => {
    try {
      const response = await fetch("http://localhost:3001/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ driverId, status }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Driver status updated successfully!");
        fetchVerifications();
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error verifying driver:", error);
      alert("Something went wrong.");
    }
  };

  const handleDeleteUser = async (userId, type) => {
    try {
      await axios.delete(`http://localhost:3001/admin/users/${type}/${userId}`, {
        withCredentials: true,
      });
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete user');
    }
  };

  const handleLogout = () => {
    axios.post('http://localhost:3001/auth/logout', {}, { withCredentials: true })
      .finally(() => navigate('/login'));
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingSpinner}></div>
      <p style={styles.loadingText}>Loading Dashboard...</p>
    </div>
  );

  if (error) return (
    <div style={styles.errorContainer}>
      <div style={styles.errorIcon}>!</div>
      <p style={styles.errorText}>{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        style={styles.retryButton}
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>Admin Dashboard</h1>
          <div style={styles.headerActions}>
            <button 
              onClick={() => navigate('/wallet')} 
              style={styles.actionButton}
              className="dashboard-button"
            >
              <i className="fas fa-wallet" style={styles.buttonIcon}></i> Wallet
            </button>
            <button 
              onClick={() => navigate('/profile')} 
              style={styles.actionButton}
              className="dashboard-button"
            >
              <i className="fas fa-user" style={styles.buttonIcon}></i> Profile
            </button>
            <button 
              onClick={handleLogout} 
              style={styles.logoutButton}
              className="dashboard-button"
            >
              <i className="fas fa-sign-out-alt" style={styles.buttonIcon}></i> Logout
            </button>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        {/* Analytics Cards */}
        <div style={styles.analyticsSection}>
          <div style={styles.analyticsCard} className="analytics-card">
            <div style={styles.cardIconContainer}>
              <i className="fas fa-shopping-cart" style={styles.cardIcon}></i>
            </div>
            <h3 style={styles.cardTitle}>Total Orders</h3>
            <p style={styles.analyticsValue}>{analytics.totalOrders}</p>
            <div style={styles.cardFooter}></div>
          </div>
          
          <div style={styles.analyticsCard} className="analytics-card">
            <div style={styles.cardIconContainer}>
              <i className="fas fa-dollar-sign" style={styles.cardIcon}></i>
            </div>
            <h3 style={styles.cardTitle}>Total Revenue</h3>
            <p style={styles.analyticsValue}>{analytics.totalRevenue}</p>
            <div style={styles.cardFooter}></div>
          </div>
          
          <div style={styles.analyticsCard} className="analytics-card">
            <div style={styles.cardIconContainer}>
              <i className="fas fa-users" style={styles.cardIcon}></i>
            </div>
            <h3 style={styles.cardTitle}>Active Users</h3>
            <p style={styles.analyticsValue}>{analytics.activeUsers}</p>
            <div style={styles.cardFooter}></div>
          </div>
        </div>

        {/* User Management Section */}
        <section style={styles.section} className="dashboard-section">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <i className="fas fa-users-cog" style={styles.sectionIcon}></i> User Management
            </h2>
          </div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Type</th>
                  <th style={styles.tableHeader}>Email</th>
                  <th style={styles.tableHeader}>Created At</th>
                  <th style={styles.tableHeader}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={`${u.type}-${u.id}`} style={styles.tableRow}>
                    <td style={styles.tableCell}>{u.id}</td>
                    <td style={styles.tableCell}>
                      <span style={u.type === 'admin' ? styles.adminBadge : styles.userBadge}>
                        {u.type}
                      </span>
                    </td>
                    <td style={styles.tableCell}>{u.email}</td>
                    <td style={styles.tableCell}>{new Date(u.created_at).toLocaleString()}</td>
                    <td style={styles.tableCell}>
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDeleteUser(u.id, u.type)}
                        className="action-button"
                      >
                        <i className="fas fa-trash-alt"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Driver Verification Section */}
        <section style={styles.section} className="dashboard-section">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <i className="fas fa-id-card" style={styles.sectionIcon}></i> Driver Verification Requests
            </h2>
          </div>
          
          {verifications.length === 0 ? (
            <div style={styles.emptyState}>
              <i className="fas fa-check-circle" style={styles.emptyIcon}></i>
              <p style={styles.emptyText}>No pending verification requests</p>
            </div>
          ) : (
            <div style={styles.verificationGrid}>
              {verifications.map((verification) => (
                <div
                  key={verification.driver_id}
                  style={styles.verificationCard}
                  className="verification-card"
                >
                  <div style={styles.verificationHeader}>
                    <h3 style={styles.verificationTitle}>
                      Driver ID: {verification.driver_id}
                    </h3>
                    <span style={verification.status === 'approved' ? styles.approvedStatus : 
                                 verification.status === 'rejected' ? styles.rejectedStatus : styles.pendingStatus}>
                      {verification.status}
                    </span>
                  </div>
                  
                  <div style={styles.verificationBody}>
                    <p style={styles.verificationText}>
                      <i className="fas fa-id-badge" style={styles.verificationIcon}></i>
                      <strong>ID Proof:</strong>{" "}
                      <a 
                        href={`http://localhost:3001/${verification.id_proof}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={styles.verificationLink}
                      >
                        View Document
                      </a>
                    </p>
                    
                    <div style={styles.verificationActions}>
                      <button
                        onClick={() => handleVerify(verification.driver_id, "approved")}
                        style={styles.approveButton}
                        className="action-button"
                      >
                        <i className="fas fa-check"></i> Approve
                      </button>
                      
                      <button
                        onClick={() => handleVerify(verification.driver_id, "rejected")}
                        style={styles.rejectButton}
                        className="action-button"
                      >
                        <i className="fas fa-times"></i> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
        
        .dashboard-button {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        
        .dashboard-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .dashboard-button:active {
          transform: translateY(0);
        }
        
        .analytics-card {
          transition: all 0.3s ease;
        }
        
        .analytics-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }
        
        .dashboard-section {
          transition: all 0.3s ease;
        }
        
        .dashboard-section:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important;
        }
        
        .action-button {
          transition: all 0.2s ease;
        }
        
        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .action-button:active {
          transform: translateY(0);
        }
        
        .verification-card {
          transition: all 0.3s ease;
        }
        
        .verification-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12) !important;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { 
    fontFamily: "'Inter', sans-serif",
    backgroundImage: 'url("/images/adminDashboard2.png")',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    color: '#2d3748'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'rgba(255,255,255,0.9)'
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  loadingText: {
    fontSize: '18px',
    color: '#4a5568',
    fontWeight: '500'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: '20px',
    textAlign: 'center',
    background: 'rgba(255,255,255,0.9)'
  },
  errorIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#ff4444',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    fontWeight: 'bold',
    marginBottom: '20px'
  },
  errorText: {
    fontSize: '18px',
    color: '#2d3748',
    marginBottom: '20px',
    maxWidth: '500px'
  },
  retryButton: {
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(52, 152, 219, 0.3)'
  },
  header: {
    background: 'linear-gradient(135deg,rgb(21, 157, 167) 0%,rgb(189, 8, 8) 100%)',
    color: 'white',
    padding: '0 20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0'
  },
  headerTitle: {
    margin: '0',
    fontSize: '28px',
    fontWeight: '700',
    background: 'linear-gradient(to right, #fff, #eee)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  headerActions: {
    display: 'flex',
    gap: '15px'
  },
  actionButton: {
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    color: '#2c3e50',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  logoutButton: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backdropFilter: 'blur(5px)'
  },
  buttonIcon: {
    fontSize: '16px'
  },
  content: {
    maxWidth: '1200px',
    margin: '30px auto',
    padding: '0 20px'
  },
  analyticsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '25px',
    marginBottom: '40px'
  },
  analyticsCard: {
    background: 'yellow',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  cardIconContainer: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3498db 0%, #2c3e50 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    color: 'white',
    fontSize: '24px'
  },
  cardIcon: {
    fontSize: '24px'
  },
  cardTitle: {
    fontSize: '18px',
    color: '#4a5568',
    margin: '0 0 15px',
    fontWeight: '600'
  },
  analyticsValue: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '10px 0',
    color: '#2c3e50',
    background: 'linear-gradient(to right, #3498db, #2c3e50)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  cardFooter: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '100%',
    height: '5px',
    background: 'linear-gradient(to right, #3498db, #2c3e50)'
  },
  section: {
    background: 'orange',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    marginBottom: '40px'
  },
  sectionHeader: {
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '15px',
    marginBottom: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionTitle: {
    fontSize: '22px',
    color: '#2c3e50',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  sectionIcon: {
    color: '#3498db',
    fontSize: '20px'
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  tableHeader: {
    background: '#2c3e50',
    color: 'white',
    padding: '15px',
    textAlign: 'left',
    fontWeight: '600'
  },
  tableRow: {
    borderBottom: '1px solid #e2e8f0',
    transition: 'background 0.2s ease',
    '&:hover': {
      background: '#f8fafc'
    }
  },
  tableCell: {
    padding: '15px',
    color: '#4a5568'
  },
  adminBadge: {
    background: '#2c3e50',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600'
  },
  userBadge: {
    background: '#3498db',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600'
  },
  deleteButton: {
    background: '#ff4444',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 6px rgba(255, 68, 68, 0.2)'
  },
  verificationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  verificationCard: {
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    border: '1px solid #e2e8f0'
  },
  verificationHeader: {
    background: '#f8fafc',
    padding: '15px 20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  verificationTitle: {
    margin: '0',
    fontSize: '16px',
    color: '#2c3e50',
    fontWeight: '600'
  },
  approvedStatus: {
    background: '#28a745',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  rejectedStatus: {
    background: '#dc3545',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  pendingStatus: {
    background: '#ffc107',
    color: '#2c3e50',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  verificationBody: {
    padding: '20px'
  },
  verificationText: {
    margin: '0 0 15px',
    color: '#4a5568',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  verificationIcon: {
    color: '#3498db',
    fontSize: '16px'
  },
  verificationLink: {
    color: '#3498db',
    textDecoration: 'none',
    fontWeight: '500',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  verificationActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  approveButton: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: '1',
    justifyContent: 'center'
  },
  rejectButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: '1',
    justifyContent: 'center'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: '50px',
    color: '#38a169',
    marginBottom: '20px'
  },
  emptyText: {
    fontSize: '16px',
    color: '#4a5568',
    margin: '0'
  },
  '@keyframes spin': {
    '0%': {
      transform: 'rotate(0deg)'
    },
    '100%': {
      transform: 'rotate(360deg)'
    }
  }
};

export default AdminDashboard;
