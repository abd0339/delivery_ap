import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState('simple');
  const [serialNumber, setSerialNumber] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [originAddress, setOriginAddress] = useState('');
  const [originCoords, setOriginCoords] = useState(null);
  const [useDefaultOrigin, setUseDefaultOrigin] = useState(true);
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [deliveryCoords, setDeliveryCoords] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [predictedPrice, setPredictedPrice] = useState(0);
  const [length, setLength] = useState('');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [shopAddress, setShopAddress] = useState('');
  const [distance, setDistance] = useState(0);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [isHoveringCancel, setIsHoveringCancel] = useState(false);
  const [changingOrigin, setChangingOrigin] = useState(false);

  const mapContainerStyle = {
    height: '300px',
    width: '100%',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  };

  useEffect(() => {
    const fetchCustomerData = async () => {
      const storedId = localStorage.getItem('shopOwnerId');
      if (storedId) {
        setCustomerId(storedId);
        try {
          const response = await axios.get(`http://localhost:3001/customers/${storedId}`);
          setShopAddress(response.data.shop_address);
          setOriginAddress(response.data.shop_address);
          setOriginCoords({
            lat: parseFloat(response.data.origin_lat || 33.8938),
            lng: parseFloat(response.data.origin_lng || 35.5018),
          });
        } catch (err) {
          console.error('Error fetching customer data:', err);
        }
      }
    };
    fetchCustomerData();
  }, []);

  const handleOriginMapClick = (e) => {
    setOriginCoords({
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    });
    setOriginAddress(`Lat:${e.latLng.lat().toFixed(4)},Lng:${e.latLng.lng().toFixed(4)}`);
  };

  const handleAddressToggle = () => {
    const newState = !useDefaultOrigin;
    setUseDefaultOrigin(newState);
    setChangingOrigin(!newState);
    if (newState) {
      setOriginAddress(shopAddress);
    }
  };

  const handleMapClick = (e) => {
    setDeliveryCoords({
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    });
  };

  const calculateDistance = async () => {
    if (!deliveryCoords || !shopAddress) return;

    try {
      const response = await axios.post('http://localhost:3001/calculate-distance', {
        origin: originAddress,
        destination: `${deliveryCoords.lat},${deliveryCoords.lng}`
      });
      setDistance(response.data.distance);
    } catch (err) {
      console.error('Distance calculation error:', err);
    }
  };

  useEffect(() => {
    if (orderType === 'package' && deliveryCoords) {
      calculateDistance();
    }
  }, [deliveryCoords, orderType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (orderType === 'package' && !deliveryCoords) {
      setError('Please select a delivery location on the map');
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      customerId,
      orderType,
      serialNumber: serialNumber || null,
      originAddress,
      originCoords,
      deliveryInfo: showMap ? deliveryCoords : deliveryPhone,
      paymentMethod,
      packagePrice: parseFloat(packagePrice),
      deliveryFee: predictedPrice,
      totalPrice: (parseFloat(packagePrice) || 0) + predictedPrice,
      ...(orderType === 'package' && {
        length: parseFloat(length),
        weight: parseFloat(weight),
        distance: distance
      })
    };

    try {
      const response = await axios.post('http://localhost:3001/orders', orderData);
      if (response.data.success) {
        navigate('/shop-owner-dashboard');
      }
    } catch (err) {
      setError('Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.heading}>Create New Order</h2>
          <div style={styles.headerDecoration}></div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Order Type Selection */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>📦</span>
              Order Type
            </h3>
            <div style={styles.radioGroup}>
              <label style={orderType === 'simple' ? styles.activeRadioLabel : styles.radioLabel}>
                <input
                  type="radio"
                  name="orderType"
                  value="simple"
                  checked={orderType === 'simple'}
                  onChange={() => setOrderType('simple')}
                  style={styles.radioInput}
                />
                <span style={styles.radioText}>Simple Package</span>
                <span style={styles.radioCheckmark}></span>
              </label>
              <label style={orderType === 'package' ? styles.activeRadioLabel : styles.radioLabel}>
                <input
                  type="radio"
                  name="orderType"
                  value="package"
                  checked={orderType === 'package'}
                  onChange={() => setOrderType('package')}
                  style={styles.radioInput}
                />
                <span style={styles.radioText}>Big Package</span>
                <span style={styles.radioCheckmark}></span>
              </label>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>ℹ️</span>
              Package Details
            </h3>
            {/* Package Price Input */}
            <div style={styles.inputWrapper}>
              <label style={styles.inputLabel}>Package Price*</label>
              <div style={styles.inputContainer}>
                <span style={styles.inputPrefix}>$</span>
                <input
                  type="number"
                  placeholder="Enter price"
                  value={packagePrice}
                  onChange={(e) => setPackagePrice(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {/* Serial Number Input */}
            <div style={styles.inputWrapper}>
              <label style={styles.inputLabel}>Bill Serial Number (Optional)</label>
              <input
                type="text"
                placeholder="Enter serial number"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                style={styles.input}
              />
            </div>

            {/* Package Details */}
            {orderType === 'package' && (
              <div style={styles.packageDetails}>
                <div style={styles.inputWrapper}>
                  <label style={styles.inputLabel}>Length (cm)*</label>
                  <div style={styles.inputContainer}>
                    <input
                      type="number"
                      placeholder="Enter length"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      style={styles.input}
                      required
                    />
                    <span style={styles.inputSuffix}>cm</span>
                  </div>
                </div>
                <div style={styles.inputWrapper}>
                  <label style={styles.inputLabel}>Weight (kg)*</label>
                  <div style={styles.inputContainer}>
                    <input
                      type="number"
                      placeholder="Enter weight"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      style={styles.input}
                      required
                    />
                    <span style={styles.inputSuffix}>kg</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Origin Address Section */}
          {changingOrigin && originCoords && (
            <div style={{ marginTop: 20 }}>
              <LoadScript googleMapsApiKey="AIzaSyDBz09hJefhlXJUFtOd9p34dSa9aHO0lz4">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={originCoords}
                  zoom={14}
                  onClick={handleOriginMapClick}
                >
                  <Marker position={originCoords} />
                </GoogleMap>
              </LoadScript>
              <p style={{ textAlign: 'center', marginTop: 10, color: '#475569' }}>
                📍 Selected Origin: {originCoords.lat.toFixed(4)}, {originCoords.lng.toFixed(4)}
              </p>
            </div>
          )}
          {/* Delivery Method Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>🚚</span>
              Delivery Method
            </h3>
            <div style={styles.deliveryMethods}>
              <button
                type="button"
                onClick={() => setShowMap(false)}
                style={!showMap ? styles.activeMethod : styles.inactiveMethod}
              >
                WhatsApp Link
                {!showMap && <span style={styles.methodIndicator}></span>}
              </button>
              <button
                type="button"
                onClick={() => setShowMap(true)}
                style={showMap ? styles.activeMethod : styles.inactiveMethod}
              >
                Map Location
                {showMap && <span style={styles.methodIndicator}></span>}
              </button>
            </div>

            {showMap ? (
              <div style={styles.mapContainer}>
                <LoadScript googleMapsApiKey="AIzaSyDBz09hJefhlXJUFtOd9p34dSa9aHO0lz4">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={{ lat: 33.8938, lng: 35.5018 }}
                    zoom={12}
                    onClick={handleMapClick}
                  >
                    {deliveryCoords && <Marker position={deliveryCoords} />}
                  </GoogleMap>
                </LoadScript>
                {deliveryCoords && (
                  <div style={styles.coordsDisplay}>
                    <span>📍 Selected Location: {deliveryCoords.lat.toFixed(4)}, {deliveryCoords.lng.toFixed(4)}</span>
                  </div>
                )}
              </div>
            ) : (
                <div style={styles.inputWrapper}>
                  <label style={styles.inputLabel}>Recipient WhatsApp Number*</label>
                  <div style={styles.inputContainer}>
                    <span style={styles.inputPrefix}>+</span>
                    <input
                      type="tel"
                      placeholder="e.g. 1234567890"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>
              )}
          </div>

          {/* Payment Method */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>💳</span>
              Payment Details
            </h3>
            <div style={styles.inputWrapper}>
              <label style={styles.inputLabel}>Payment Method</label>
              <div style={styles.selectContainer}>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={styles.select}
                >
                  <option value="cash">Cash on Delivery</option>
                  <option value="wallet">Wallet Payment</option>
                </select>
                <span style={styles.selectArrow}>▼</span>
              </div>
            </div>

            {/* Total Price Display */}
            <div style={styles.totalSection}>
              <div style={styles.priceBreakdown}>
                <div style={styles.priceRow}>
                  <span>Package Price:</span>
                  <span>${(parseFloat(packagePrice) || 0).toFixed(2)}</span>
                </div>
                <div style={styles.priceRow}>
                  <span>Delivery Fee:</span>
                  <span>${predictedPrice.toFixed(2)}</span>
                </div>
              </div>
              <div style={styles.totalPrice}>
                <h3>Total:</h3>
                <h3 style={styles.totalAmount}>${((parseFloat(packagePrice) || 0) + predictedPrice).toFixed(2)}</h3>
              </div>
            </div>
          </div>

          {error && (
            <div style={styles.error}>
              <span style={styles.errorIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form Actions */}
          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => navigate('/shop-owner-dashboard')}
              style={styles.cancelButton}
              onMouseEnter={() => setIsHoveringCancel(true)}
              onMouseLeave={() => setIsHoveringCancel(false)}
            >
              Cancel
              <span style={isHoveringCancel ? styles.buttonHoverEffect : {}}></span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={isSubmitting ? styles.submittingButton : styles.submitButton}
              onMouseEnter={() => setIsHoveringSubmit(true)}
              onMouseLeave={() => setIsHoveringSubmit(false)}
            >
              {isSubmitting ? 'Creating...' : 'Create Order'}
              <span style={isHoveringSubmit ? styles.buttonHoverEffect : {}}></span>
              {isSubmitting && <span style={styles.spinner}></span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  },
  container: {
    width: '100%',
    maxWidth: '950px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    transform: 'translateY(0)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12)'
    }
  },
  header: {
    position: 'relative',
    padding: '30px 40px 20px',
    background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
    color: 'white',
    textAlign: 'center',
  },
  heading: {
    fontSize: '2.2rem',
    fontWeight: '700',
    margin: '0 0 10px',
    position: 'relative',
    display: 'inline-block',
  },
  headerDecoration: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    height: '4px',
    background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #3b82f6 100%)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
    padding: '30px 40px',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    transition: 'all 0.3s ease',
    border: '1px solid #f1f5f9',
    ':hover': {
      boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
      transform: 'translateY(-2px)',
    }
  },
  sectionTitle: {
    fontSize: '1.3rem',
    color: '#1e293b',
    marginBottom: '20px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sectionIcon: {
    fontSize: '1.2rem',
  },
  radioGroup: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    cursor: 'pointer',
    padding: '15px 20px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    transition: 'all 0.3s ease',
    flex: '1',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    ':hover': {
      backgroundColor: '#f1f5f9',
    }
  },
  activeRadioLabel: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    cursor: 'pointer',
    padding: '15px 20px',
    borderRadius: '10px',
    backgroundColor: '#eff6ff',
    transition: 'all 0.3s ease',
    flex: '1',
    border: '1px solid #3b82f6',
    color: '#1d4ed8',
    fontWeight: '500',
    overflow: 'hidden',
    ':hover': {
      backgroundColor: '#dbeafe',
    }
  },
  radioInput: {
    position: 'absolute',
    opacity: '0',
    cursor: 'pointer',
    height: '0',
    width: '0',
  },
  radioText: {
    fontSize: '15px',
    transition: 'color 0.3s ease',
  },
  radioCheckmark: {
    position: 'absolute',
    top: '0',
    right: '0',
    width: '0',
    height: '0',
    borderStyle: 'solid',
    borderWidth: '0 30px 30px 0',
    borderColor: 'transparent #3b82f6 transparent transparent',
    transition: 'all 0.3s ease',
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '20px',
    position: 'relative',
  },
  inputLabel: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '8px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputPrefix: {
    position: 'absolute',
    left: '15px',
    color: '#64748b',
    fontWeight: '500',
    zIndex: '1',
  },
  inputSuffix: {
    position: 'absolute',
    right: '15px',
    color: '#64748b',
    fontWeight: '500',
    zIndex: '1',
  },
  input: {
    padding: '14px 15px 14px 30px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    backgroundColor: '#f8fafc',
    width: '100%',
    ':focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)',
      outline: 'none',
      backgroundColor: 'white',
    },
    ':hover': {
      borderColor: '#cbd5e1',
      backgroundColor: 'white',
    },
    '::placeholder': {
      color: '#94a3b8',
    }
  },
  packageDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  originHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  toggleButton: {
    background: 'transparent',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'relative',
    overflow: 'hidden',
    ':hover': {
      backgroundColor: '#3b82f610',
    },
  },
  toggleButtonActive: {
    background: '#3b82f620',
    color: '#1d4ed8',
    border: '1px solid #3b82f6',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'relative',
    overflow: 'hidden',
    ':hover': {
      backgroundColor: '#3b82f630',
    },
  },
  textarea: {
    padding: '15px',
    height: '100px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    resize: 'vertical',
    fontFamily: 'inherit',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    backgroundColor: '#f8fafc',
    width: '100%',
    ':focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)',
      outline: 'none',
      backgroundColor: 'white',
    },
    ':hover': {
      borderColor: '#cbd5e1',
      backgroundColor: 'white',
    }
  },
  deliveryMethods: {
    display: 'flex',
    gap: '15px',
    marginBottom: '25px',
  },
  activeMethod: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    boxShadow: '0 2px 5px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.3s ease',
    flex: '1',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    ':hover': {
      backgroundColor: '#2563eb',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(59, 130, 246, 0.4)',
    },
  },
  inactiveMethod: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    flex: '1',
    textAlign: 'center',
    fontWeight: '500',
    position: 'relative',
    overflow: 'hidden',
    ':hover': {
      backgroundColor: '#e2e8f0',
      color: '#334155',
    },
  },
  methodIndicator: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    height: '3px',
    backgroundColor: '#f59e0b',
  },
  mapContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  coordsDisplay: {
    textAlign: 'center',
    color: '#475569',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px dashed #cbd5e1',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: '#f1f5f9',
    }
  },
  selectContainer: {
    position: 'relative',
  },
  select: {
    padding: '14px 15px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '15px',
    backgroundColor: '#f8fafc',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    appearance: 'none',
    width: '100%',
    ':focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)',
      outline: 'none',
      backgroundColor: 'white',
    },
    ':hover': {
      borderColor: '#cbd5e1',
      backgroundColor: 'white',
    }
  },
  selectArrow: {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: '#64748b',
    fontSize: '12px',
  },
  totalSection: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px dashed #cbd5e1',
    transition: 'all 0.3s ease',
  },
  priceBreakdown: {
    marginBottom: '20px',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    color: '#475569',
    fontSize: '15px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e2e8f0',
  },
  totalPrice: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '15px',
    borderTop: '2px solid #e2e8f0',
    color: '#1e293b',
    fontWeight: '600',
    fontSize: '17px',
  },
  totalAmount: {
    color: '#3b82f6',
    fontSize: '18px',
  },
  error: {
    color: '#dc2626',
    fontSize: '15px',
    padding: '15px',
    backgroundColor: '#fef2f2',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    borderLeft: '4px solid #dc2626',
  },
  errorIcon: {
    fontSize: '18px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '20px',
  },
  submitButton: {
    padding: '14px 28px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    position: 'relative',
    overflow: 'hidden',
    ':hover': {
      backgroundColor: '#2563eb',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 10px rgba(59, 130, 246, 0.4)',
    },
    ':active': {
      transform: 'translateY(0)',
    },
  },
  submittingButton: {
    padding: '14px 28px',
    backgroundColor: '#94a3b8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    position: 'relative',
    overflow: 'hidden',
  },
  cancelButton: {
    padding: '14px 28px',
    backgroundColor: 'white',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    position: 'relative',
    overflow: 'hidden',
    ':hover': {
      backgroundColor: '#f8fafc',
      borderColor: '#cbd5e1',
      color: '#475569',
      transform: 'translateY(-2px)',
    },
    ':active': {
      transform: 'translateY(0)',
    }
  },
  buttonHoverEffect: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)',
    animation: 'shine 1.5s infinite',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    borderTopColor: 'white',
    animation: 'spin 1s linear infinite',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  },
  '@keyframes shine': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' }
  }
};

export default CreateOrder;