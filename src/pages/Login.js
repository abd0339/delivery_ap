import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [userType, setUserType] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:3001/auth/login',
        { userType, email, password },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        localStorage.setItem('userType', userType);

        // Set shopOwnerId for customer and admin user types
        if (userType === 'customer') {
          localStorage.setItem('shopOwnerId', response.data.customer_id);
        } else if (userType === 'admin') {
          localStorage.setItem('shopOwnerId', response.data.userId); // keep as-is if admin still uses `userId`
        } else {
          localStorage.removeItem('shopOwnerId');
        }

        // Set driverId for driver user type
        if (userType === 'driver') {
          localStorage.setItem('driverId', response.data.driverId);
        } else {
          localStorage.removeItem('driverId');
        }

        const dashboardRoutes = {
          customer: '/shop-owner-dashboard',
          driver: '/driver-dashboard',
          admin: '/admin-dashboard',
        };

        navigate(dashboardRoutes[userType]);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      const message =
        err.response.data.message || 'An error occurred during login';
      setError(message);
      console.error('Login error:', err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2 style={styles.title}>Login to DeliveryApp</h2>

        <div style={styles.userTypeSelector}>
          <button
            style={{
              ...styles.userTypeButton,
              ...(userType === 'customer' && styles.activeButton),
            }}
            onClick={() => setUserType('customer')}
            type="button"
          >
            Shop Owner
          </button>
          <button
            style={{
              ...styles.userTypeButton,
              ...(userType === 'driver' && styles.activeButton),
            }}
            onClick={() => setUserType('driver')}
            type="button"
          >
            Driver
          </button>
          <button
            style={{
              ...styles.userTypeButton,
              ...(userType === 'admin' && styles.activeButton),
            }}
            onClick={() => setUserType('admin')}
            type="button"
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          {error && <p style={styles.errorText}>{error}</p>}
          <button type="submit" style={styles.loginButton}>
            Login
          </button>
        </form>

        <div style={styles.links}>
          <Link to="/forgot-password" style={styles.link}>
            Forgot Password?
          </Link>
          <p style={styles.signupText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Inline CSS
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
  },
  loginBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '400px',
    textAlign: 'center',
  },
  title: {
    marginBottom: '30px',
    color: '#333',
  },
  userTypeSelector: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  userTypeButton: {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#e0e0e0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  activeButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
  },
  loginButton: {
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  links: {
    marginTop: '20px',
    fontSize: '14px',
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
  },
  signupText: {
    marginTop: '10px',
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: '14px',
    marginTop: '10px',
  },
};

export default Login;
