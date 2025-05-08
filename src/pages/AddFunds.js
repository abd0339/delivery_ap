import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Change to useNavigate for React Router v6
import axios from 'axios'; // For API requests

const AddFunds = () => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const userType = localStorage.getItem('userType');
  let userId;

  // Assign userId based on user type (customer, driver, admin)
  if (userType === 'customer') {
    userId = localStorage.getItem('shopOwnerId');
  } else if (userType === 'driver') {
    userId = localStorage.getItem('driverId');
  } else if (userType === 'admin') {
    userId = localStorage.getItem('shopOwnerId');
  }

  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post('http://localhost:3001/wallet/add-funds', {
        userId: userId,
        amount: parseFloat(amount),
      });

      if (response.data.success) {
        setSuccessMessage('Funds added successfully!');
        setAmount(''); // Clear input field
        setTimeout(() => {
          navigate('/wallet'); // Use navigate to redirect to wallet page after success
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to add funds');
      }
    } catch (err) {
      setError('An error occurred while adding funds');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Add Funds</h2>

      {loading && <p>Processing...</p>}
      {successMessage && <p style={styles.success}>{successMessage}</p>}
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.card}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Amount to Add:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
            placeholder="Enter amount"
            min="1"
            step="0.01"
          />
        </div>

        <button onClick={handleAddFunds} style={styles.button}>Add Funds</button>
      </div>

      <div style={styles.cancelButtonContainer}>
        <button onClick={() => navigate('/wallet')} style={styles.cancelButton}>Cancel</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    fontSize: '24px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  card: {
    padding: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  label: {
    fontSize: '16px',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  cancelButtonContainer: {
    marginTop: '15px',
    textAlign: 'center',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f44336',
    color: 'white',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '10px',
  },
  success: {
    color: 'green',
    textAlign: 'center',
    marginBottom: '10px',
  },
};

export default AddFunds;
