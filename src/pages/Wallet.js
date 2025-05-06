import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Wallet = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0.00);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch wallet balance and transactions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const shopOwnerId = localStorage.getItem("shopOwnerId");
        if (!shopOwnerId) {
          throw new Error("Shop owner ID not found. Please log in again.");
        }

        // Fetch wallet balance and transaction history
        const [balanceResponse, transactionsResponse] = await Promise.all([
          axios.get(`http://localhost:3000/wallet/shop/${shopOwnerId}`),
          axios.get(`http://localhost:3000/wallet/transactions/${shopOwnerId}`)
        ]);

        setBalance(balanceResponse.data.balance);
        setTransactions(transactionsResponse.data);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format currency display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format transaction date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) return <p style={styles.loadingText}>Loading...</p>;
  if (error) return <p style={styles.errorText}>{error}</p>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Wallet</h1>
        <nav style={styles.nav}>
          <Link to="/shop-owner-dashboard" style={styles.navLink}>Back to Dashboard</Link>
        </nav>
      </header>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Balance Card */}
        <div style={styles.balanceCard}>
          <h3>Current Balance</h3>
          <p style={styles.balanceAmount}>{formatCurrency(balance)}</p>
          <div style={styles.actionButtons}>
            <button 
              onClick={() => navigate('/add-funds')} 
              style={styles.actionButton}
            >
              Add Funds
            </button>
            <button
              onClick={() => navigate('/withdraw-funds')}
              style={styles.actionButton}
            >
              Withdraw Funds
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div style={styles.transactionsSection}>
          <h2>Transaction History</h2>
          {transactions.length === 0 ? (
            <p style={styles.noTransactions}>No transactions yet.</p>
          ) : (
            <div style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  style={{ 
                    ...styles.transactionItem,
                    borderLeft: `4px solid ${transaction.type === 'deposit' ? '#4CAF50' : '#ff4444'}` 
                  }}
                >
                  <div style={styles.transactionDetails}>
                    <p style={styles.transactionDescription}>
                      {transaction.description}
                    </p>
                    <p style={styles.transactionDate}>{formatDate(transaction.date)}</p>
                  </div>
                  <p style={styles.transactionAmount}>
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Inline CSS Styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    margin: 0,
  },
  nav: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
  },
  content: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  balanceCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px',
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: '2.5rem',
    color: '#4CAF50',
    margin: '20px 0',
    fontWeight: 'bold',
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginTop: '20px',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  transactionsSection: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  transactionsList: {
    display: 'grid',
    gap: '15px',
  },
  transactionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#fff',
    border: '1px solid #eee',
    borderRadius: '5px',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    margin: 0,
    fontWeight: '500',
  },
  transactionDate: {
    margin: '5px 0 0 0',
    color: '#666',
    fontSize: '14px',
  },
  transactionAmount: {
    fontWeight: 'bold',
    color: '#333',
  },
  noTransactions: {
    textAlign: 'center',
    color: '#666',
    padding: '20px',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '18px',
  },
  errorText: {
    textAlign: 'center',
    marginTop: '50px',
    color: 'red',
    fontSize: '18px',
  },
};

export default Wallet;
