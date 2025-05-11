import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  // Add state to track hover for feature cards
  const [hoveredCard, setHoveredCard] = useState(null);
  
  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome to DeliveryApp</h1>
        <p style={styles.heroSubtitle}>Fast, Reliable, and Secure Delivery Services</p>
        <div style={styles.heroButtons}>
          <Link to="/login" 
            style={styles.button} 
            className="hover-button">Login</Link>
          <Link to="/register" 
            style={styles.button}
            className="hover-button">Sign Up</Link>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.features}>
        <h2 style={styles.sectionTitle}>Why Choose Us?</h2>
        <div style={styles.featuresGrid}>
          <div 
            style={hoveredCard === 0 ? {...styles.featureCard, ...styles.featureCardHover} : styles.featureCard}
            onMouseEnter={() => setHoveredCard(0)}
            onMouseLeave={() => setHoveredCard(null)}
            className="feature-card"
          >
            <div style={styles.iconContainer}>🚚</div>
            <h3 className="feature-card-title">Real-Time Tracking</h3>
            <p className="feature-card-content">Track your orders in real-time with live updates.</p>
          </div>
          <div 
            style={hoveredCard === 1 ? {...styles.featureCard, ...styles.featureCardHover} : styles.featureCard}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
            className="feature-card"
          >
            <div style={styles.iconContainer}>💼</div>
            <h3 className="feature-card-title">Multiple Payment Options</h3>
            <p className="feature-card-content">Pay via cash, wallet, or other secure methods.</p>
          </div>
          <div 
            style={hoveredCard === 2 ? {...styles.featureCard, ...styles.featureCardHover} : styles.featureCard}
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
            className="feature-card"
          >
            <div style={styles.iconContainer}>🔒</div>
            <h3 className="feature-card-title">Verified Drivers</h3>
            <p className="feature-card-content">All drivers are ID-verified for your safety.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2025 DeliveryApp. All rights reserved.</p>
        <div style={styles.socialLinks}>
          <a href="#" 
            style={styles.link}
            className="footer-link">Facebook</a>
          <a href="#" 
            style={styles.link}
            className="footer-link">Twitter</a>
          <a href="#" 
            style={styles.link}
            className="footer-link">Contact Us</a>
        </div>
      </footer>
      
      {/* Add CSS for hover effects */}
      <style>
        {`
          .hover-button:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 30px rgba(248, 181, 0, 0.3);
            filter: brightness(1.05);
          }
          
          .hover-button:active {
            transform: translateY(2px);
            box-shadow: 0 5px 15px rgba(248, 181, 0, 0.2);
          }
          
          .hover-button::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
            opacity: 0;
            transition: opacity 0.3s ease;
            border-radius: 50px;
            z-index: -1;
          }
          
          .hover-button:hover::after {
            opacity: 0.4;
          }
          
          .footer-link:hover {
            background-color: rgba(255, 0, 0, 0.7);
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(255, 0, 0, 0.3);
            border-color: rgba(255, 0, 0, 0.4);
          }
          
          .feature-card-title {
            font-size: 1.5rem;
            margin-bottom: 16px;
            color: #333;
            position: relative;
            padding-bottom: 10px;
          }
          
          .feature-card-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 50px;
            height: 3px;
            background: linear-gradient(90deg, #f8b500, #fceabb);
            border-radius: 3px;
          }
          
          .feature-card-content {
            color: #666;
            line-height: 1.6;
          }
          
          @media (max-width: 768px) {
            .heroTitle {
              font-size: 2.5rem;
            }
            
            .heroSubtitle {
              font-size: 1.2rem;
            }
            
            .heroButtons {
              flex-direction: column;
              gap: 15px;
            }
            
            .featuresGrid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </div>
  );
};

// Inline CSS Styles
const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: '"Poppins", Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    backgroundImage: 'url("/images/delivery3.png")', // Keeping original background image with overlay
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
  },
  hero: {
    background: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: '120px 30px',
    textAlign: 'center',
    borderBottom: '4px solid #f8b500',
  },
  heroTitle: {
    fontSize: '3.5rem',
    marginBottom: '30px',
    fontWeight: 'bold',
    letterSpacing: '2px',
    textShadow: '2px 2px 8px rgba(0, 0, 0, 0.4)',
    animation: 'fadeInDown 1s ease-out',
  },
  heroSubtitle: {
    fontSize: '1.6rem',
    marginBottom: '40px',
    lineHeight: '1.8',
    color: '#f8f9fa',
    maxWidth: '800px',
    margin: '0 auto 40px',
    textShadow: '1px 1px 4px rgba(0, 0, 0, 0.3)',
    animation: 'fadeInUp 1s ease-out 0.3s',
  },
  heroButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    animation: 'fadeIn 1s ease-out 0.6s',
  },
  button: {
    background: 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)',
    color: '#1a1a1a',
    padding: '16px 32px',
    borderRadius: '50px',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    cursor: 'pointer',
    textDecoration: 'none',
    outline: 'none',
    border: 'none',
    transition: 'all 0.4s ease',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
  },
  features: {
    padding: '100px 30px',
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
    position: 'relative',
  },
  sectionTitle: {
    fontSize: '2.8rem',
    marginBottom: '60px',
    color: '#333',
    fontWeight: 'bold',
    position: 'relative',
    paddingBottom: '15px',
    display: 'inline-block',
    letterSpacing: '1px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
    animation: 'slideInUp 1s ease-out',
  },
  featureCard: {
    background: 'linear-gradient(to bottom right,rgb(225, 255, 91),rgb(228, 92, 2))', 
    padding: '40px 30px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    transform: 'scale(1)',
    border: '1px solid rgba(178, 235, 242, 0.5)', // Light border color matching the background
  },
  featureCardHover: {
    transform: 'translateY(-20px) scale(1.05)',
    zIndex: 5,
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(0, 0, 0, 0.6)', // Slightly darker border on hover
  },
  iconContainer: {
    fontSize: '2.5rem',
    marginBottom: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
  },
  footer: {
    backgroundColor: '#1a365d',
    color: 'white',
    textAlign: 'center',
    padding: '40px 30px',
    marginTop: 'auto',
    boxShadow: '0 -5px 15px rgba(0, 0, 0, 0.1)',
  },
  socialLinks: {
    marginTop: '25px',
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    fontSize: '1rem',
    padding: '10px 20px',
    borderRadius: '30px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'inline-block',
  },
  '@keyframes fadeInDown': {
    from: {
      opacity: 0,
      transform: 'translateY(-30px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  '@keyframes fadeInUp': {
    from: {
      opacity: 0,
      transform: 'translateY(30px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  '@keyframes slideInUp': {
    from: {
      opacity: 0,
      transform: 'translateY(60px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
};

export default Home;