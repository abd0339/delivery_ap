import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
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
        // 1) Users
        const usersRes = await axios.get(
          'http://localhost:3001/admin/users',
          { withCredentials: true }
        );
        setUsers(usersRes.data.users || usersRes.data);

        // 2) Orders
        const ordersRes = await axios.get(
          'http://localhost:3001/admin/orders',
          { withCredentials: true }
        );
        setOrders(ordersRes.data.orders || ordersRes.data);

        // 3) Verification Requests
        const verRes = await axios.get(
          'http://localhost:3001/admin/verification-requests',
          { withCredentials: true }
        );
        setVerificationRequests(verRes.data.requests || verRes.data);

        // 4) Analytics
        const analyticsRes = await axios.get(
          'http://localhost:3001/admin/analytics',
          { withCredentials: true }
        );
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

  const handleVerify = async (requestId, action) => {
    try {
      const res = await axios.post(
        'http://localhost:3001/admin/verify',
        { requestId, action },
        { withCredentials: true }
      );

      if (res.data.success) {
        setVerificationRequests(prev =>
          prev.filter(r => r.id !== requestId)
        );
      } else {
        setError(res.data.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('An error occurred while processing the request');
    }
  };

  const handleLogout = () => {
    axios.post(
      'http://localhost:3001/auth/logout',
      {},
      { withCredentials: true }
    ).finally(() => {
      navigate('/login');
    });
  };

  if (loading) return <p style={styles.loadingText}>Loading...</p>;
  if (error)   return <p style={styles.errorText}>{error}</p>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Admin Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
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
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={`${u.type}-${u.id}`}>
                    <td>{u.id}</td>
                    <td>{u.type}</td>
                    <td>{u.email}</td>
                    <td>{new Date(u.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Verification Requests */}
        <section style={styles.section}>
          <h2>ID Verification Requests</h2>
          {verificationRequests.length === 0 ? (
            <p style={styles.noRequests}>No pending requests</p>
          ) : (
            verificationRequests.map(r => (
              <div key={r.id} style={styles.requestItem}>
                <div>
                  <p><strong>Driver:</strong> {r.driver}</p>
                  <p><strong>Document:</strong> {r.document}</p>
                </div>
                <div style={styles.requestActions}>
                  <button
                    style={styles.approveButton}
                    onClick={() => handleVerify(r.id, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    style={styles.rejectButton}
                    onClick={() => handleVerify(r.id, 'reject')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
};

const styles = {
  container:    { fontFamily: 'Arial, sans-serif', background: '#f0f2f5', minHeight: '100vh' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#4CAF50', color: 'white' },
  headerTitle:  { margin: 0 },
  logoutButton: { background: 'transparent', border: '1px solid white', color: 'white', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' },
  content:      { maxWidth: '1200px', margin: '30px auto', padding: '0 20px' },
  analyticsSection: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: '20px', marginBottom: '30px' },
  analyticsCard:    { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' },
  analyticsValue:   { fontSize: '24px', fontWeight: 'bold', margin: '10px 0' },
  section:  { background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' },
  tableContainer: { overflowX: 'auto', marginTop: '15px' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  requestItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #eee', borderRadius: '8px', background: 'white', marginBottom: '10px' },
  requestActions: { display: 'flex', gap: '10px' },
  approveButton: { background: '#4CAF50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
  rejectButton:  { background: '#ff4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
  noRequests:    { textAlign: 'center', color: '#666', padding: '20px' },
  loadingText:   { textAlign: 'center', marginTop: '50px', fontSize: '18px' },
  errorText:     { textAlign: 'center', marginTop: '50px', color: 'red', fontSize: '18px' },
};

export default AdminDashboard;
