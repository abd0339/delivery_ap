import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const IDVerification = () => {
  const navigate = useNavigate();
  const [documentType, setDocumentType] = useState('id_card');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [isHoveringBack, setIsHoveringBack] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        return;
      }
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        setError('Invalid file type (allowed: JPG, PNG, PDF)');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('file', selectedFile);

      const response = await axios.post('http://localhost:3000/verify-id', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setIsVerified(true);
        setTimeout(() => navigate('/driver-dashboard'), 2000);
      } else {
        setError(response.data.message || 'Failed to submit document');
      }
    } catch (err) {
      setError('An error occurred while submitting the document');
      console.error('Verification error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.cardContainer}>
        {/* Back Link */}
        <Link 
          to="/driver-dashboard" 
          style={isHoveringBack ? styles.backLinkHover : styles.backLink}
          onMouseEnter={() => setIsHoveringBack(true)}
          onMouseLeave={() => setIsHoveringBack(false)}
        >
          <span style={styles.backArrow}>←</span> Back to Dashboard
          <span style={isHoveringBack ? styles.linkHoverEffect : {}}></span>
        </Link>

        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>ID Verification</h2>
          <div style={styles.headerDecoration}></div>
        </div>
        
        {/* Status Messages */}
        {isVerified && (
          <div style={styles.successMessage}>
            <span style={styles.successIcon}>✓</span>
            Document verified successfully!
          </div>
        )}

        {error && (
          <div style={styles.error}>
            <span style={styles.errorIcon}>!</span>
            {error}
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Document Type */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Document Type</label>
            <div style={styles.selectContainer}>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                style={styles.select}
                disabled={isVerified}
              >
                <option value="id_card">National ID Card</option>
                <option value="passport">Passport</option>
              </select>
              <span style={styles.selectArrow}>▼</span>
            </div>
          </div>

          {/* File Upload */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Upload Document</label>
            <label 
              htmlFor="file-upload" 
              style={selectedFile ? styles.fileUploadActive : styles.fileUpload}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedFile ? '#f0f8ff' : 'white'}
            >
              <input
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
                style={styles.fileInput}
                accept=".jpg,.jpeg,.png,.pdf"
                disabled={isVerified}
              />
              <div style={styles.filePreview}>
                {selectedFile ? (
                  <>
                    <span style={styles.fileIcon}>📄</span>
                    <p style={styles.fileName}>{selectedFile.name}</p>
                    <p style={styles.fileSize}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <span style={styles.uploadIcon}>↑</span>
                    <p style={styles.placeholder}>Click to upload document</p>
                    <p style={styles.fileTypes}>(JPG, PNG, PDF - max 5MB)</p>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            style={
              isVerified ? styles.verifiedButton : 
              isSubmitting ? styles.submittingButton : 
              isHoveringSubmit ? styles.submitButtonHover : styles.submitButton
            }
            disabled={isSubmitting || isVerified}
            onMouseEnter={() => setIsHoveringSubmit(true)}
            onMouseLeave={() => setIsHoveringSubmit(false)}
          >
            {isSubmitting ? (
              <>
                Submitting...
                <span style={styles.spinner}></span>
              </>
            ) : isVerified ? (
              'Verified!'
            ) : (
              <>
                Submit for Verification
                {isHoveringSubmit && <span style={styles.buttonHoverEffect}></span>}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%)',
    padding: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    backgroundImage: 'url("/images/idVerification.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    position: 'relative',

  },
  cardContainer: {
    background: 'rgba(202, 183, 183, 0.82)',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '600px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12)',
    }
  },
  header: {
    position: 'relative',
    marginBottom: '30px',
    textAlign: 'center',
  },
  title: {
    color: '#2c3e50',
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '15px',
    background: 'linear-gradient(to right, #3498db, #2c3e50)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  headerDecoration: {
    height: '4px',
    width: '80px',
    background: 'linear-gradient(to right, #3498db, #2c3e50)',
    margin: '0 auto',
    borderRadius: '2px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#3498db',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    marginBottom: '25px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    padding: '8px 12px',
    borderRadius: '8px',
  },
  backLinkHover: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#3498db',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    marginBottom: '25px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: '#f0f8ff',
  },
  backArrow: {
    marginRight: '8px',
    fontSize: '18px',
    transition: 'transform 0.3s ease',
  },
  linkHoverEffect: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '100%',
    height: '2px',
    backgroundColor: '#3498db',
    transform: 'scaleX(0)',
    transformOrigin: 'right',
    animation: 'linkUnderline 0.3s ease forwards',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  label: {
    color: '#4a5568',
    fontSize: '15px',
    fontWeight: '500',
  },
  selectContainer: {
    position: 'relative',
  },
  select: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '15px',
    backgroundColor: '#f8fafc',
    appearance: 'none',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    ':focus': {
      borderColor: '#3498db',
      boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)',
      outline: 'none',
    },
    ':hover': {
      borderColor: '#cbd5e0',
    }
  },
  selectArrow: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: '#718096',
  },
  fileUpload: {
    border: '2px dashed #e2e8f0',
    borderRadius: '12px',
    padding: '30px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: 'white',
    position: 'relative',
    overflow: 'hidden',
    ':hover': {
      borderColor: '#3498db',
      backgroundColor: '#f8fafc',
    }
  },
  fileUploadActive: {
    border: '2px dashed #3498db',
    borderRadius: '12px',
    padding: '30px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#f0f8ff',
    position: 'relative',
    overflow: 'hidden',
  },
  fileInput: {
    display: 'none',
  },
  filePreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  uploadIcon: {
    fontSize: '32px',
    color: '#3498db',
    marginBottom: '10px',
    transition: 'transform 0.3s ease',
  },
  fileIcon: {
    fontSize: '32px',
    color: '#3498db',
    marginBottom: '10px',
  },
  placeholder: {
    color: '#4a5568',
    fontWeight: '500',
    fontSize: '16px',
    margin: '0',
  },
  fileTypes: {
    color: '#718096',
    fontSize: '14px',
    margin: '0',
  },
  fileName: {
    color: '#2d3748',
    fontWeight: '600',
    fontSize: '15px',
    margin: '0',
    wordBreak: 'break-all',
    textAlign: 'center',
  },
  fileSize: {
    color: '#718096',
    fontSize: '13px',
    margin: '0',
  },
  submitButton: {
    position: 'relative',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '16px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(52, 152, 219, 0.3)',
    ':hover': {
      backgroundColor: '#2980b9',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(52, 152, 219, 0.4)',
    },
    ':active': {
      transform: 'translateY(0)',
    }
  },
  submitButtonHover: {
    position: 'relative',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '16px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(52, 152, 219, 0.3)',
    transform: 'translateY(-2px)',
    backgroundColor: '#2980b9',
    boxShadow: '0 6px 12px rgba(52, 152, 219, 0.4)',
  },
  submittingButton: {
    backgroundColor: '#a0aec0',
    color: 'white',
    border: 'none',
    padding: '16px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  verifiedButton: {
    backgroundColor: '#38a169',
    color: 'white',
    border: 'none',
    padding: '16px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'default',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 6px rgba(56, 161, 105, 0.3)',
  },
  buttonHoverEffect: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)',
    animation: 'shine 1.5s infinite',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    borderTopColor: 'white',
    animation: 'spin 1s linear infinite',
  },
  error: {
    backgroundColor: '#fff5f5',
    color: '#e53e3e',
    padding: '15px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '15px',
    fontWeight: '500',
    borderLeft: '4px solid #e53e3e',
  },
  errorIcon: {
    backgroundColor: '#e53e3e',
    color: 'white',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  successMessage: {
    backgroundColor: '#f0fff4',
    color: '#38a169',
    padding: '15px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '15px',
    fontWeight: '500',
    borderLeft: '4px solid #38a169',
  },
  successIcon: {
    backgroundColor: '#38a169',
    color: 'white',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  },
  '@keyframes shine': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' }
  },
  '@keyframes linkUnderline': {
    '0%': { transform: 'scaleX(0)' },
    '100%': { transform: 'scaleX(1)' }
  }
};

export default IDVerification;

