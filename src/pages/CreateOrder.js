import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([{ name: '', quantity: 1, price: 0 }]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [orderType, setOrderType] = useState('simple');
  const [length, setLength] = useState('');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    const storedId = localStorage.getItem('shopOwnerId');
    if (storedId) {
      setCustomerId(storedId);
    } else {
      setError('Customer ID not found. Please log in again.');
    }
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'quantity' || field === 'price' ? Number(value) : value;
    setItems(newItems);
    setTotalAmount(calculateTotal(newItems));
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setTotalAmount(calculateTotal(newItems));
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!customerId) {
      setError('Customer ID not found. Please log in again.');
      setIsSubmitting(false);
      return;
    }

    const orderData = {
      customerId,
      items,
      deliveryAddress,
      paymentMethod,
      totalAmount: calculateTotal(items),
      order_type: orderType,
      length: orderType === 'package' ? parseFloat(length) : null,
      weight: orderType === 'package' ? parseFloat(weight) : null,
    };

    try {
      const response = await axios.post('http://localhost:3001/orders', orderData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      if (response.data.success) {
        navigate('/shop-owner-dashboard');
      } else {
        setError(response.data.message || 'Order creation failed');
      }
    } catch (err) {
      console.error('❌ Order creation error:', err);
      setError('Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create New Order</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.radioGroup}>
          <label>
            <input
              type="radio"
              name="orderType"
              value="simple"
              checked={orderType === 'simple'}
              onChange={() => setOrderType('simple')}
            />
            Simple Order
          </label>
          <label>
            <input
              type="radio"
              name="orderType"
              value="package"
              checked={orderType === 'package'}
              onChange={() => setOrderType('package')}
            />
            Package Order
          </label>
        </div>

        {items.map((item, index) => (
          <div key={index} style={styles.itemRow}>
            <input
              type="text"
              placeholder="Item name"
              value={item.name}
              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              style={styles.input}
              min="1"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={item.price}
              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
              style={styles.input}
              min="0"
              required
            />
            <button type="button" onClick={() => handleRemoveItem(index)} style={styles.removeButton}>
              Remove
            </button>
          </div>
        ))}

        <button type="button" onClick={handleAddItem} style={styles.addButton}>
          Add Item
        </button>

        {orderType === 'package' && (
          <>
            <input
              type="number"
              placeholder="Length (cm)"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              style={styles.input}
              min="0"
              required
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={styles.input}
              min="0"
              required
            />
          </>
        )}

        <textarea
          placeholder="Delivery Address"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          style={styles.textarea}
          required
        />

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={styles.select}
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
        </select>

        <p>Total: ${totalAmount.toFixed(2)}</p>

        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" disabled={isSubmitting} style={styles.submitButton}>
          {isSubmitting ? 'Submitting...' : 'Create Order'}
        </button>
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
