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

    // States for hover effects
  const [hoveredButton, setHoveredButton] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

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
          shopAddress: JSON.stringify(shopCoords),
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
      <label 
        style={{
          ...styles.fileLabel,
          ...(hoveredButton === 'fileUpload' && {
            color: '#FFD54F',
            transform: 'translateX(5px)'
          })
        }}
        onMouseEnter={() => setHoveredButton('fileUpload')}
        onMouseLeave={() => setHoveredButton(null)}
      >
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
                ...(hoveredButton === type && { 
                  transform: 'scale(1.05)', 
                  backgroundColor: 'rgba(255, 50, 50, 0.3)' 
                }),
              }}
              onClick={() => setUserType(type)}
              onMouseEnter={() => setHoveredButton(type)}
              onMouseLeave={() => setHoveredButton(null)}
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
              ...(hoveredButton === 'register' && !isLoading && { 
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 10px rgba(0,0,0,0.2)'
              }),

            }}
            disabled={isLoading}
            onMouseEnter={() => !isLoading && setHoveredButton('register')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {isLoading ? 'Processing...' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.loginText}>
          Already have an account?{' '}
          <Link 
            to="/login" 
            style={{
              ...styles.link,
              ...(hoveredLink === 'login' && { 
                color: '#FFD54F',
                transform: 'translateX(5px)'
              }),
            }}
            onMouseEnter={() => setHoveredLink('login')}
            onMouseLeave={() => setHoveredLink(null)}
          >
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
    backgroundImage: 'url("/images/RegisterPage.png")',
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
    backgroundColor: 'rgba(41, 12, 146, 0)',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(244, 67, 54, 0.3)',
    width: '400px',
    textAlign: 'center',
    transform: 'translateY(0)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    position: 'relative',
    zIndex: 2,
  },
  title: {
    marginBottom: '60px',
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
    color: 'black',
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
    color: 'black', // Changed text color to black
    transition: 'all 0.3s ease',
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
    color: 'black', // Changed to black
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.3s ease',
  },
  arrowIcon: {
    fontSize: '12px',
    transition: 'transform 0.3s ease',
    color: 'black', // Changed to black
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
    color: 'black', // Changed to black
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
  },
  disabledButton: { backgroundColor: '#8BC34A', cursor: 'not-allowed' },
  loginText: {
    marginTop: '25px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
  },
  link: {
    color: '#FF9800', // Changed login link color to match the signup color from login page
    textDecoration: 'none',
    transition: 'color 0.3s ease, transform 0.3s ease',
    display: 'inline-block',
  },
  errorText: {
    color: '#ffccbc',
    fontSize: '14px',
    marginTop: '5px',
    textAlign: 'center',
    fontWeight: '500',
  },
  mapLabel: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#fff' },
};

export default Register;
