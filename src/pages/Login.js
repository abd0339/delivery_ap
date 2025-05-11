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
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundImage: 'url("https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    position: 'relative',
  },
    backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  loginBox: {
    backgroundColor: 'rgba(41, 12, 146, 0.85)',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(244, 67, 54, 0.3)',
    width: '400px',
    textAlign: 'center',
    transform: 'translateY(0)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    position: 'relative',
    zIndex: 2,
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 15px 35px rgba(244, 67, 54, 0.4)',
    },
  },
  title: {
    marginBottom: '30px',
    color: 'white',
    fontSize: '28px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  userTypeSelector: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
  },
  userTypeButton: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    letterSpacing: '0.5px',
    fontWeight: '500',
  },
  activeButton: {
    backgroundColor: 'rgba(255, 230, 1, 0.86)',
    color: '#212121',
    fontWeight: '600',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
  hoverStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: 'scale(1.03)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  input: {
    padding: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid transparent',
    borderRadius: '6px',
    fontSize: '16px',
    color: 'white',
    transition: 'all 0.3s ease',
    '&:focus': {
      borderColor: '#ffeb3b',
      boxShadow: '0 0 0 3px rgba(255, 235, 59, 0.3)',
      outline: 'none',
    },
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
  },
  loginButton: {
    padding: '14px',
    background: 'linear-gradient(to right,rgb(12, 187, 18), #2E7D32)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    '&:active': {
      transform: 'translateY(1px)',
    },
  },
  links: {
    marginTop: '25px',
    fontSize: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  forgotPasswordLink: {
    color: '#FFA000',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px',
    fontWeight: '500',
    padding: '6px 0',
    fontSize: '15px',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },

  link: {
    color: '#4CAF50',
    textDecoration: 'none',
  },
  signupText: {
    marginTop: '10px',
    color: '#fff',
    fontSize: '14px',
  },
  signupLink: {
    color: '#fff',
    backgroundColor: 'transparent',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '25px',
    transition: 'all 0.3s ease',
    fontWeight: '600',
    letterSpacing: '0.5px',
    marginLeft: '5px',
  },
  errorText: {
    color: '#ffccbc',
    fontSize: '14px',
    marginTop: '5px',
    textAlign: 'center',
    fontWeight: '500',
  },
};

export default Login;
