import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');
  const shopOwnerId = localStorage.getItem('shopOwnerId');
  const driverId = localStorage.getItem('driverId');

  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    shop_name: '',
    shop_address: '',
    vehicle_type: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = userType === 'drivers' ? driverId : shopOwnerId;

  useEffect(() => {
    if (!userType || !userId) {
      setError('User type or ID missing');
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/profile/${userType}/${userId}`);
        setFormData((prev) => ({
          ...prev,
          ...response.data,
        }));
      } catch (err) {
        setError('Failed to fetch profile data');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userType, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userType || !userId) {
      setError('User type or ID missing');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3001/profile/${userType}/${userId}`, formData);
      if (response.data.success) {
        if (userType === 'customers') {
          navigate('/shop-owner-dashboard');
        } else if (userType === 'drivers') {
          navigate('/driver-dashboard');
        } else if (userType === 'admins') {
          navigate('/admin-dashboard');
        }
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating the profile');
      console.error('Update error:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <p style={styles.loadingText}>Loading...</p>;
  if (error) return <p style={styles.errorText}>{error}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.profileBox}>
        <div style={styles.backLink}>
          <Link
            to={
              userType === 'customers'
                ? '/shop-owner-dashboard'
                : userType === 'drivers'
                ? '/driver-dashboard'
                : '/admin-dashboard'
            }
            style={styles.link}
          >
            ← Back to Dashboard
          </Link>
        </div>

        <h2 style={styles.title}>Update Profile</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Shop Owner Fields */}
          {userType === 'customers' && (
            <>
              <div style={styles.formGroup}>
                <label>Shop Name</label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shop_name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label>Shop Address</label>
                <input
                  type="text"
                  name="shopAddress"
                  value={formData.shop_address}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </>
          )}

          {/* Driver Fields */}
          {userType === 'drivers' && (
            <div style={styles.formGroup}>
              <label>Vehicle Type</label>
              <input
                type="text"
                name="vehicleType"
                value={formData.vehicle_type}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          )}

          <button type="submit" style={styles.saveButton}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  profileBox: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '600px',
  },
  backLink: {
    marginBottom: '20px',
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
    fontSize: '14px',
  },
  title: {
    color: '#333',
    marginBottom: '30px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '15px',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '20px',
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

export default Profile;
