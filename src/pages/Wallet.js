import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);
  const navigate = useNavigate();

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
        setBalance(data.balance);
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

  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        <div style={styles.content}>
          <h2 style={styles.heading}>Your Wallet</h2>
          
          {loading && (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <p style={styles.loadingText}>Loading your wallet...</p>
            </div>
          )}
          
          {error && (
            <div style={styles.errorMessage}>
              <div style={styles.errorIcon}>!</div>
              <p>{error}</p>
            </div>
          )}
          
          {wallet && (
            <div style={styles.card}>
              <div style={styles.balanceContainer}>
                <p style={styles.balanceLabel}>Current Balance</p>
                <p style={styles.balanceAmount}>₹{balance}</p>
              </div>
              
              <div style={styles.detailsContainer}>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Wallet ID:</span>
                  <span style={styles.detailValue}>{wallet.walletId || 'N/A'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Last Updated:</span>
                  <span style={styles.detailValue}>{new Date(wallet.updated_at).toLocaleString()}</span>
                </div>
              </div>
              
              <div style={styles.buttonsContainer}>
                <Link 
                  to="/add-funds" 
                  style={styles.button}
                  className="action-button"
                >
                  Add Funds
                </Link>
                <Link 
                  to="/withdraw-funds" 
                  style={{...styles.button, backgroundColor: '#f39c12'}}
                  className="action-button"
                >
                  Withdraw
                </Link>
              </div>
              
              <div style={styles.securityNote}>
                <div style={styles.securityIcon}>🔒</div>
                <p style={styles.securityText}>All transactions are secure</p>
              </div>
            </div>
          )}
          
          <div style={styles.cancelButtonContainer}>
            <button 
              onClick={() => navigate(-1)} 
              style={styles.cancelButton}
              className="cancel-button"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
      
      <style>
        {`
          .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          }
          
          .action-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
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
  balanceContainer: {
    textAlign: 'center',
    marginBottom: '25px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee',
  },
  balanceLabel: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '5px',
  },
  balanceAmount: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#2e7d32',
    margin: '0',
  },
  detailsContainer: {
    marginBottom: '20px',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    padding: '8px 0',
  },
  detailLabel: {
    fontWeight: '500',
    color: '#555',
  },
  detailValue: {
    fontWeight: '400',
    color: '#333',
  },
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '15px',
    marginTop: '20px',
  },
  button: {
    flex: '1',
    padding: '14px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
    textDecoration: 'none',
    textAlign: 'center',
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

export default Wallet;
