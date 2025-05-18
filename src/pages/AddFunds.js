import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddFunds = () => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [animateSuccess, setAnimateSuccess] = useState(false);
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
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (successMessage) {
      setAnimateSuccess(true);
      const timer = setTimeout(() => setAnimateSuccess(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
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
          navigate('/wallet');
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
      <div style={styles.overlay}>
        <div style={styles.content}>
          <h2 style={styles.heading}>Add Funds to Your Wallet</h2>
          
          {loading && (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <p style={styles.loadingText}>Processing your transaction...</p>
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
              <label style={styles.label}>Amount to Add:</label>
              <div style={styles.inputWrapper}>
                <span style={styles.currencySymbol}>$</span>
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
              onClick={handleAddFunds} 
              style={styles.button}
              className="add-funds-button"
            >
              Add Funds
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
          .add-funds-button:hover {
            background-color: #3d8b40 !important;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
          }
          
          .add-funds-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 5px rgba(76, 175, 80, 0.4);
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
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideDown {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @keyframes checkmark {
            0% { height: 0; }
            100% { height: 10px; }
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: '550px',
    padding: '20px',
    animation: 'fadeIn 0.8s ease-out',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: '25px',
    textAlign: 'center',
    color: '#333',
    animation: 'slideDown 0.5s ease-out',
  },
  card: {
    padding: '25px',
    borderRadius: '12px',
    backgroundColor: 'white',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    animation: 'fadeIn 0.8s ease-out',
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
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
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
    transition: 'background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
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
    animation: 'fadeIn 0.5s ease-out',
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
    animation: 'fadeIn 0.5s ease-out, pulse 2s infinite',
    transition: 'transform 0.3s ease',
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
    animation: 'checkmark 0.3s ease-out forwards',
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
    borderTop: '3px solid #4CAF50',
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

export default AddFunds;
