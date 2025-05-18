import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const WithdrawFunds = () => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [animateSuccess, setAnimateSuccess] = useState(false);

  const userType = localStorage.getItem('userType');
  let userId;

  if (userType === 'customer') {
    userId = localStorage.getItem('shopOwnerId');
  } else if (userType === 'driver') {
    userId = localStorage.getItem('driverId');
  } else if (userType === 'admin') {
    userId = localStorage.getItem('shopOwnerId');
  }

  const navigate = useNavigate();

  useEffect(() => {
    if (successMessage) {
      setAnimateSuccess(true);
      const timer = setTimeout(() => setAnimateSuccess(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleWithdrawFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post('http://localhost:3001/wallet/withdraw-funds', {
        userId: userId,
        amount: parseFloat(amount),
      });

      if (response.data.success) {
        setSuccessMessage('Funds withdrawn successfully!');
        setAmount('');
        setTimeout(() => {
          navigate('/wallet');
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to withdraw funds');
      }
    } catch (err) {
      setError('An error occurred while withdrawing funds');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        <div style={styles.content}>
          <h2 style={styles.heading}>Withdraw Funds</h2>
          
          {loading && (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <p style={styles.loadingText}>Processing your withdrawal...</p>
            </div>
          )}
          
          {successMessage && (
            <div style={{
              ...styles.successMessage,
              transform: animateSuccess ? 'scale(1.1)' : 'scale(1)',
            }}>
              <div style={styles.checkmarkCircle}>
                <div style={styles.checkmark}></div>
              </div>
              <p>{successMessage}</p>
            </div>
          )}
          
          {error && (
            <div style={styles.errorMessage}>
              <div style={styles.errorIcon}>!</div>
              <p>{error}</p>
            </div>
          )}
          
          <div style={styles.card}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Amount to Withdraw:</label>
              <div style={styles.inputWrapper}>
                <span style={styles.currencySymbol}>₹</span>
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
            </div>
            
            <button 
              onClick={handleWithdrawFunds} 
              style={{...styles.button, backgroundColor: '#f39c12'}}
              className="action-button"
            >
              Withdraw Funds
            </button>
            
            <div style={styles.securityNote}>
              <div style={styles.securityIcon}>🔒</div>
              <p style={styles.securityText}>Your transaction is secure</p>
            </div>
          </div>
          
          <div style={styles.cancelButtonContainer}>
            <button 
              onClick={() => navigate('/wallet')} 
              style={styles.cancelButton}
              className="cancel-button"
            >
              Back to Wallet
            </button>
          </div>
        </div>
      </div>
      
      <style>
        {`
          .action-button:hover {
            background-color: #e67e22 !important;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(230, 126, 34, 0.4);
          }
          
          .action-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 5px rgba(230, 126, 34, 0.4);
          }
          
          .cancel-button:hover {
            background-color: #d32f2f !important;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(244, 67, 54, 0.4);
          }
          
          .cancel-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 5px rgba(244, 67, 54, 0.4);
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: 'url("https://images.unsplash.com/photo-1625225233840-695456021cde?ixlib=rb-4.0.3")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
  },
  overlay: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: '550px',
    padding: '20px',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: '25px',
    textAlign: 'center',
    color: '#333',
  },
  card: {
    padding: '25px',
    borderRadius: '12px',
    backgroundColor: 'white',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '8px',
    color: '#444',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  currencySymbol: {
    position: 'absolute',
    left: '15px',
    fontSize: '18px',
    color: '#666',
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 30px',
    borderRadius: '8px',
    border: '2px solid #e0e0e0',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '14px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
  },
  cancelButtonContainer: {
    marginTop: '20px',
    textAlign: 'center',
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    padding: '10px 15px',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  errorIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#d32f2f',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    marginRight: '10px',
  },
  successMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  checkmarkCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#2e7d32',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  checkmark: {
    width: '5px',
    borderBottom: '3px solid white',
    borderRight: '3px solid white',
    height: '10px',
    transform: 'rotate(45deg)',
    marginBottom: '5px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '15px',
  },
  loadingSpinner: {
    width: '30px',
    height: '30px',
    border: '3px solid rgba(0, 0, 0, 0.1)',
    borderTop: '3px solid #f39c12',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '10px',
  },
  loadingText: {
    color: '#666',
    fontSize: '16px',
  },
  securityNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '15px',
    color: '#757575',
    fontSize: '14px',
  },
  securityIcon: {
    marginRight: '5px',
    fontSize: '16px',
  },
  securityText: {
    margin: 0,
  },
};

export default WithdrawFunds;
