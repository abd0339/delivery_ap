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
        fetchVerifications(); // refresh list
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

  if (loading) return <p style={styles.loadingText}>Loading...</p>;
  if (error) return <p style={styles.errorText}>{error}</p>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Admin Dashboard</h1>
        <div style={styles.headerActions}>
          <button onClick={() => navigate('/wallet')} style={styles.actionButton}>Wallet</button>
          <button onClick={() => navigate('/profile')} style={styles.actionButton}>Profile</button>
          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
      </header>

      <div style={styles.content}>
        {/* Analytics */}
        <div style={styles.analyticsSection}>
          <div style={styles.analyticsCard}>
            <h3>Total Orders</h3>
            <p style={styles.analyticsValue}>{analytics.totalOrders}</p>
          </div>
          <div style={styles.analyticsCard}>
            <h3>Total Revenue</h3>
            <p style={styles.analyticsValue}>{analytics.totalRevenue}</p>
          </div>
          <div style={styles.analyticsCard}>
            <h3>Active Users</h3>
            <p style={styles.analyticsValue}>{analytics.activeUsers}</p>
          </div>
        </div>

        {/* User Management */}
        <section style={styles.section}>
          <h2>User Management</h2>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Email</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={`${u.type}-${u.id}`}>
                    <td>{u.id}</td>
                    <td>{u.type}</td>
                    <td>{u.email}</td>
                    <td>{new Date(u.created_at).toLocaleString()}</td>
                    <td>
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDeleteUser(u.id, u.type)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Driver Verification Requests */}
        <div style={{ padding: "30px", fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>

          <h2 style={{ marginTop: "40px", color: "#444" }}>Driver Verification Requests</h2>

          {verifications.length === 0 ? (
            <p>No pending verification requests.</p>
          ) : (
            verifications.map((verification) => (
              <div
                key={verification.driver_id}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  padding: "20px",
                  marginTop: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <p><strong>Driver ID:</strong> {verification.driver_id}</p>
                <p>
                  <strong>ID Proof:</strong>{" "}
                  <a href={`http://localhost:3001/${verification.id_proof}`} target="_blank" rel="noreferrer">
                    View ID
                  </a>
                </p>
                <p><strong>Status:</strong> {verification.status}</p>

                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() => handleVerify(verification.driver_id, "approved")}
                    style={{
                      backgroundColor: "#28a745",
                      color: "#fff",
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "5px",
                      marginRight: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleVerify(verification.driver_id, "rejected")}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { fontFamily: 'Arial, sans-serif', background: '#f0f2f5', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#4CAF50', color: 'white' },
  headerTitle: { margin: 0 },
  headerActions: { display: 'flex', gap: '10px' },
  actionButton: { background: '#fff', border: '1px solid white', color: '#4CAF50', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' },
  logoutButton: { background: 'transparent', border: '1px solid white', color: 'white', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' },
  content: { maxWidth: '1200px', margin: '30px auto', padding: '0 20px' },
  analyticsSection: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: '20px', marginBottom: '30px' },
  analyticsCard: { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' },
  analyticsValue: { fontSize: '24px', fontWeight: 'bold', margin: '10px 0' },
  section: { background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' },
  tableContainer: { overflowX: 'auto', marginTop: '15px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  deleteButton: { background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' },
  loadingText: { textAlign: 'center', marginTop: '50px', fontSize: '18px' },
  errorText: { textAlign: 'center', marginTop: '50px', color: 'red', fontSize: '18px' },
};

export default AdminDashboard;
