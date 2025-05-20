import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

axios.defaults.baseURL = 'http://localhost:3001';
axios.defaults.withCredentials = true;

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopCoords, setShopCoords] = useState(null);
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
      if (!phoneNumber || !shopName || !shopCoords || !username) {
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
          shopCoords: JSON.stringify(shopCoords),
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
    <div>
      <label style={styles.mapLabel}>Select Shop Location on Map:</label>
      <LoadScript googleMapsApiKey="AIzaSyDBz09hJefhlXJUFtOd9p34dSa9aHO0lz4">
        <GoogleMap
          mapContainerStyle={{ height: '250px', width: '100%', marginBottom: '15px', borderRadius: '8px' }}
          center={shopCoords || { lat: 33.8938, lng: 35.5018 }}
          zoom={12}
          onClick={handleMapClick}
        >
          {shopCoords && <Marker position={shopCoords} />}
        </GoogleMap>
      </LoadScript>
      {shopCoords && (
        <p style={{ fontSize: '14px', color: '#ccc' }}>
          📍 Selected: {shopCoords.lat.toFixed(4)}, {shopCoords.lng.toFixed(4)}
        </p>
      )}
    </div>
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

  const [location, setLocation] = useState({ lat: 33.8938, lng: 35.5018 }); // Default: Beirut

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setLocation({ lat, lng });
    setShopCoords({ lat, lng }); // Set address field to coordinates
  };


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
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundImage: 'url("/images/driver4.jpg")',
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
  registerBox: {
    backgroundColor: 'rgba(4, 36, 0, 0.85)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    letterSpacing: '0.5px',
    fontWeight: '500',
  },
  activeButton: {
    backgroundColor: 'rgba(255, 230, 0, 0.9)',
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
  vehicleTypeContainer: {
    position: 'relative',
    width: '100%',
  },
  vehicleInput: {
    padding: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '6px',
    fontSize: '16px',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#ffeb3b',
    },
  },
  arrowIcon: {
    fontSize: '12px',
    transition: 'transform 0.3s ease',
    color: 'white',
  },
  vehicleOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0 0 6px 6px',
    zIndex: 10,
    marginTop: '2px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)',
  },
  vehicleOption: {
    padding: '12px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 235, 59, 0.3)',
      color: '#ffeb3b',
    },
  },

  fileUpload: {
    textAlign: 'left',
    marginTop: '10px',
  },
  fileLabel: {
    display: 'block',
    marginBottom: '10px',
    color: '#FFA000',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  fileInput: {
    display: 'none',
  },
  fileName: {
    fontSize: '13px',
    color: '#4CAF50',
    marginTop: '5px',
    fontWeight: '500',
  },
  registerButton: {
    padding: '14px',
    background: 'linear-gradient(to right, #FF9800, #E65100)',
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
    marginTop: '15px',
    '&:active': {
      transform: 'translateY(1px)',
    },
  },
  disabledButton: { backgroundColor: '#8BC34A', cursor: 'not-allowed' },
  loginText: {
    marginTop: '25px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px',
    fontWeight: '600',
  },
  errorText: {
    color: '#ffccbc',
    fontSize: '14px',
    marginTop: '5px',
    textAlign: 'center',
    fontWeight: '500',
  },
  input: { padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' },
  mapLabel: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#fff' },
};

export default Register;
