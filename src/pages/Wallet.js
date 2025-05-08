import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Importing Link for navigation
import axios from 'axios'; // For API requests

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null); // Track current balance

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

  useEffect(() => {
    if (!userType || !userId) {
      setError('User not logged in or invalid.');
      setLoading(false);
      return;
    }

    const fetchWallet = async () => {
      try {
        const response = await fetch(`http://localhost:3001/wallet/${userType}/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch wallet data');
        }

        const data = await response.json();
        setWallet(data);
        setBalance(data.balance); // Set balance from fetched wallet data
        setError('');
      } catch (err) {
        setError(err.message);
        setWallet(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [userType, userId]);

  // Function to handle Add Funds
  const addFunds = async (amount) => {
    try {
      const response = await axios.post('http://localhost:3001/wallet/add-funds', {
        userId: userId,
        amount: parseFloat(amount),
      });

      if (response.data.success) {
        setBalance(balance + parseFloat(amount)); // Update balance after successful transaction
      } else {
        setError(response.data.message || 'Failed to add funds');
      }
    } catch (err) {
      setError('An error occurred while adding funds');
    }
  };

  // Function to handle Withdraw Funds
  const withdrawFunds = async (amount) => {
    try {
      const response = await axios.post('http://localhost:3001/wallet/withdraw', {
        userId: userId,
        amount: parseFloat(amount),
      });

      if (response.data.success) {
        setBalance(balance - parseFloat(amount)); // Update balance after successful withdrawal
      } else {
        setError(response.data.message || 'Failed to withdraw funds');
      }
    } catch (err) {
      setError('An error occurred while withdrawing funds');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Wallet</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {wallet && (
        <div style={styles.card}>
          <p><strong>Balance:</strong> ₹{balance}</p>
          <p><strong>Last Updated:</strong> {new Date(wallet.updated_at).toLocaleString()}</p>

          {/* Navigation buttons for Add and Withdraw */}
          <div style={styles.buttonsContainer}>
            <Link to="/add-funds" style={styles.button}>Add Funds</Link>
            <Link to="/withdraw-funds" style={styles.button}>Withdraw Funds</Link>
          </div>
        </div>
      )}
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
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '10px',
  },
  buttonsContainer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#4CAF50',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    textAlign: 'center',
  },
};

export default Wallet;
