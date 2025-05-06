import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome to DeliveryApp</h1>
        <p style={styles.heroSubtitle}>Fast, Reliable, and Secure Delivery Services</p>
        <div style={styles.heroButtons}>
          <Link to="/login" style={styles.button}>Login</Link>
          <Link to="/register" style={styles.button}>Sign Up</Link>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.features}>
        <h2 style={styles.sectionTitle}>Why Choose Us?</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <h3>🚚 Real-Time Tracking</h3>
            <p>Track your orders in real-time with live updates.</p>
          </div>
          <div style={styles.featureCard}>
            <h3>💼 Multiple Payment Options</h3>
            <p>Pay via cash, wallet, or other secure methods.</p>
          </div>
          <div style={styles.featureCard}>
            <h3>🔒 Verified Drivers</h3>
            <p>All drivers are ID-verified for your safety.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2024 DeliveryApp. All rights reserved.</p>
        <div style={styles.socialLinks}>
          <a href="#" style={styles.link}>Facebook</a>
          <a href="#" style={styles.link}>Twitter</a>
          <a href="#" style={styles.link}>Contact Us</a>
        </div>
      </footer>
    </div>
  );
};

// Inline CSS Styles
const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  hero: {
    backgroundColor: '#4CAF50',
    color: 'white',
    textAlign: 'center',
    padding: '100px 20px',
    flex: 1,
  },
  heroTitle: {
    fontSize: '2.5rem',
    marginBottom: '20px',
    
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    marginBottom: '30px',
  },
  heroButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  },
  button: {
    backgroundColor: 'white',
    color: '#4CAF50',
    padding: '10px 20px',
    borderRadius: '5px',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'background-color 0.3s, color 0.3s',
  },
  features: {
    padding: '50px 20px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  sectionTitle: {
    fontSize: '2rem',
    marginBottom: '40px',
    color: '#333',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featureCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  featureCardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  footer: {
    backgroundColor: '#333',
    color: 'white',
    textAlign: 'center',
    padding: '20px',
    marginTop: 'auto',
  },
  socialLinks: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    transition: 'color 0.3s',
  },
  linkHover: {
    color: '#4CAF50',
  },
};

export default Home;