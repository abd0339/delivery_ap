import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // For making API requests

const AddFunds = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate amount
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate adding funds (replace with actual API integration)
      const response = await axios.post('http://localhost:3000/wallet/add-funds', {
        userId: 1, // Replace with the logged-in user's ID
        amount: parseFloat(amount),
        paymentMethod,
      });

      if (response.data.success) {
        navigate('/wallet'); // Redirect to wallet after successful transaction
      } else {
        setError(response.data.message || 'Failed to add funds');
      }
    } catch (err) {
      setError('An error occurred while adding funds');
      console.error('Add funds error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        {/* Back Button */}
        <div style={styles.backLink}>
          <Link to="/wallet" style={styles.link}>← Back to Wallet</Link>
        </div>

        <h2 style={styles.title}>Add Funds to Wallet</h2>

        {/* Error Message */}
        {error && <p style={styles.error}>{error}</p>}

        {/* Add Funds Form */}
        <form onSubmit={handleSubmit}>
          {/* Amount Input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              style={styles.input}
              disabled={isSubmitting}
            />
          </div>

          {/* Payment Method */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={styles.select}
              disabled={isSubmitting}
            >
              <option value="credit_card">Credit/Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            style={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Add Funds'}
          </button>
        </form>

        {/* Security Note */}
        <p style={styles.securityNote}>
          🔒 All transactions are securely processed using SSL encryption.
        </p>
      </div>
    </div>
  );
};

// Inline CSS Styles (consistent with Wallet Page)
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '500px',
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
  formGroup: {
    marginBottom: '25px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#666',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    backgroundColor: 'white',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '15px',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '20px',
    opacity: (props) => (props.disabled ? 0.7 : 1),
    pointerEvents: (props) => (props.disabled ? 'none' : 'auto'),
  },
  error: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: '20px',
  },
  securityNote: {
    textAlign: 'center',
    color: '#666',
    fontSize: '12px',
    marginTop: '30px',
  },
};

export default AddFunds;
