import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3001';
axios.defaults.withCredentials = true;

const Register = () => {
  const navigate = useNavigate();

  const [userType, setUserType] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [username, setUsername] = useState('');
  const [idDocument, setIdDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateFields = () => {
    if (!email || !password) {
      return 'Please fill in email and password.';
    }

    if (userType === 'customer') {
      if (!phoneNumber || !shopName || !shopAddress || !username) {
        return 'Please complete all customer fields.';
      }
    } else if (userType === 'driver') {
      if (!phoneNumber || !vehicleType || !username || !idDocument) {
        return 'Please complete all driver fields and upload ID.';
      }
      if (idDocument.size > 5 * 1024 * 1024) {
        return 'ID document must be under 5MB.';
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      let response;

      if (userType === 'customer') {
        response = await axios.post('/auth/register-customer', {
          email,
          password,
          phoneNumber,
          shopName,
          shopAddress,
          username,
        });
      } else if (userType === 'driver') {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('phoneNumber', phoneNumber);
        formData.append('vehicleType', vehicleType);
        formData.append('username', username);
        if (idDocument) formData.append('idDocument', idDocument);

        response = await axios.post('/auth/register-driver', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await axios.post('/auth/register-admin', { email, password });
      }

      if (response.data.success) {
        navigate('/login');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response.data.message || err.message || 'An error occurred during registration';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setIdDocument(file);
      setError('');
    } else {
      setError('File must be under 5MB');
    }
  };

  const renderSharedFields = () => (
    <>
      <input
        type="tel"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        style={styles.input}
        required
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={styles.input}
        required
      />
    </>
  );

  const renderCustomerFields = () => (
    <>
      <input
        type="text"
        placeholder="Shop Name"
        value={shopName}
        onChange={(e) => setShopName(e.target.value)}
        style={styles.input}
        required
      />
      <input
        type="text"
        placeholder="Shop Address"
        value={shopAddress}
        onChange={(e) => setShopAddress(e.target.value)}
        style={styles.input}
        required
      />
    </>
  );

  const renderDriverFields = () => (
    <>
      <input
        type="text"
        placeholder="Vehicle Type"
        value={vehicleType}
        onChange={(e) => setVehicleType(e.target.value)}
        style={styles.input}
        required
      />
      <div style={styles.fileUpload}>
        <label style={styles.fileLabel}>
          Upload ID Document (max 5MB)
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            style={styles.fileInput}
            required
          />
        </label>
        {idDocument && <p style={styles.fileName}>{idDocument.name}</p>}
      </div>
    </>
  );

  return (
    <div style={styles.container}>
      <div style={styles.registerBox}>
        <h2 style={styles.title}>Create Your Account</h2>

        <div style={styles.userTypeSelector}>
          {['customer', 'driver', 'admin'].map((type) => (
            <button
              key={type}
              type="button"
              style={{
                ...styles.userTypeButton,
                ...(userType === type && styles.activeButton),
              }}
              onClick={() => setUserType(type)}
            >
              {type === 'customer' ? 'Shop Owner' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
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

          {userType !== 'admin' && renderSharedFields()}
          {userType === 'customer' && renderCustomerFields()}
          {userType === 'driver' && renderDriverFields()}

          {error && <p style={styles.errorText}>{error}</p>}

          <button
            type="submit"
            style={{
              ...styles.registerButton,
              ...(isLoading && styles.disabledButton),
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.loginText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
  },
  registerBox: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '400px',
    textAlign: 'center',
  },
  title: { marginBottom: '30px', color: '#333' },
  userTypeSelector: { display: 'flex', gap: '10px', marginBottom: '20px' },
  userTypeButton: {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#e0e0e0',
    cursor: 'pointer',
    fontSize: '14px',
  },
  activeButton: { backgroundColor: '#4CAF50', color: 'white' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
  },
  fileUpload: { textAlign: 'left' },
  fileLabel: {
    display: 'block',
    marginBottom: '10px',
    color: '#666',
    fontSize: '14px',
  },
  fileInput: { display: 'block', marginTop: '5px' },
  fileName: { fontSize: '12px', color: '#4CAF50', marginTop: '5px' },
  registerButton: {
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  disabledButton: { backgroundColor: '#8BC34A', cursor: 'not-allowed' },
  loginText: { marginTop: '20px', color: '#666', fontSize: '14px' },
  link: { color: '#4CAF50', textDecoration: 'none' },
  errorText: { color: 'red', fontSize: '14px', marginTop: '10px' },
};

export default Register;
