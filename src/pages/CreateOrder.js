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

  const mapContainerStyle = {
    height: '300px',
    width: '100%'
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
        } catch (err) {
          console.error('Error fetching customer data:', err);
        }
      }
    };
    fetchCustomerData();
  }, []);

  const handleAddressToggle = () => {
    const newState = !useDefaultOrigin;
    setUseDefaultOrigin(newState);
    if (newState) setOriginAddress(shopAddress);
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
        origin: shopAddress,
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
      console.log('Sending order data:', orderData);
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
    <div style={styles.container}>
      <h2>Create New Order</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Order Type Selection */}
        <div style={styles.radioGroup}>
          <label>
            <input
              type="radio"
              name="orderType"
              value="simple"
              checked={orderType === 'simple'}
              onChange={() => setOrderType('simple')}
            />
            Simple Package
          </label>
          <label>
            <input
              type="radio"
              name="orderType"
              value="package"
              checked={orderType === 'package'}
              onChange={() => setOrderType('package')}
            />
            Big Package
          </label>
        </div>

        {/* Package Price Input */}
        <input
          type="number"
          placeholder="Package Price *"
          value={packagePrice}
          onChange={(e) => setPackagePrice(e.target.value)}
          style={styles.input}
          required
        />

        {/* Serial Number Input */}
        <input
          type="text"
          placeholder="Bill Serial Number (Optional)"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          style={styles.input}
        />

        {/* Package Details */}
        {orderType === 'package' && (
          <div style={styles.packageDetails}>
            <input
              type="number"
              placeholder="Length (cm) *"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="number"
              placeholder="Weight (kg) *"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={styles.input}
              required
            />
          </div>
        )}

        {/* Origin Address Section */}
        <div style={styles.addressSection}>
          <div style={styles.originHeader}>
            <h4>Origin Address</h4>
            <button
              type="button"
              onClick={handleAddressToggle}
              style={styles.toggleButton}
            >
              {useDefaultOrigin ? 'Change Address' : 'Use Default'}
            </button>
          </div>
          <textarea
            value={originAddress}
            onChange={(e) => setOriginAddress(e.target.value)}
            style={styles.textarea}
            readOnly={useDefaultOrigin}
            required
          />
        </div>

        {/* Delivery Method Section */}
        <div style={styles.deliverySection}>
          <h4>Delivery Method</h4>
          <div style={styles.deliveryMethods}>
            <button
              type="button"
              onClick={() => setShowMap(false)}
              style={!showMap ? styles.activeMethod : styles.inactiveMethod}
            >
              WhatsApp Link
            </button>
            <button
              type="button"
              onClick={() => setShowMap(true)}
              style={showMap ? styles.activeMethod : styles.inactiveMethod}
            >
              Map Location
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
            </div>
          ) : (
            <input
              type="tel"
              placeholder="Recipient WhatsApp Number *"
              value={deliveryPhone}
              onChange={(e) => setDeliveryPhone(e.target.value)}
              style={styles.input}
              required
            />
          )}
        </div>

        {/* Payment Method */}
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={styles.select}
        >
          <option value="cash">Cash</option>
          <option value="wallet">Wallet</option>
        </select>

        {/* Total Price Display */}
        <div style={styles.totalSection}>
          <h3>Total Price: ${((parseFloat(packagePrice) || 0) + predictedPrice).toFixed(2)}</h3>
          <small>(Package price + Delivery fee)</small>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Form Actions */}
        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate('/shop-owner-dashboard')}
            style={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={styles.submitButton}
          >
            {isSubmitting ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '30px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#f0f2f5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  itemRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  input: {
    padding: '10px',
    flex: 1,
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  removeButton: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  textarea: {
    padding: '10px',
    height: '80px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    resize: 'vertical',
  },
  select: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  submitButton: {
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: '12px',
    backgroundColor:'red',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  
  error: {
    color: 'red',
    fontSize: '14px',
  },
  radioGroup: {
    display: 'flex',
    gap: '20px',
    marginBottom: '10px',
  },
};

export default CreateOrder;
