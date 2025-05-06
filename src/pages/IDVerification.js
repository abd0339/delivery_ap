import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // For making API requests

const IDVerification = () => {
  const navigate = useNavigate();
  const [documentType, setDocumentType] = useState('id_card');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
      // Create a FormData object for file upload
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('file', selectedFile);

      // Submit the document for verification
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
    <div style={styles.container}>
      <div style={styles.formContainer}>
        {/* Back Link */}
        <div style={styles.backLink}>
          <Link to="/driver-dashboard" style={styles.link}>← Back to Dashboard</Link>
        </div>

        <h2 style={styles.title}>ID Verification</h2>
        
        {/* Status Message */}
        {isVerified && (
          <p style={styles.successMessage}>✅ Document verified successfully!</p>
        )}

        {/* Error Message */}
        {error && <p style={styles.error}>{error}</p>}

        {/* Verification Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Document Type */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              style={styles.select}
            >
              <option value="id_card">National ID Card</option>
              <option value="passport">Passport</option>
            </select>
          </div>

          {/* File Upload */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Upload Document</label>
            <div style={styles.fileUpload}>
              <input
                type="file"
                onChange={handleFileUpload}
                style={styles.fileInput}
                accept=".jpg,.jpeg,.png,.pdf"
              />
              <div style={styles.filePreview}>
                {selectedFile ? (
                  <p style={styles.fileName}>{selectedFile.name}</p>
                ) : (
                  <p style={styles.placeholder}>Click to upload (JPG, PNG, PDF - max 5MB)</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            style={styles.submitButton}
            disabled={isSubmitting || isVerified}
          >
            {isSubmitting ? 'Submitting...' : (isVerified ? 'Verified!' : 'Submit for Verification')}
          </button>
        </form>
      </div>
    </div>
  );
};

// Inline CSS Styles (consistent with previous pages)
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
    maxWidth: '600px',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    color: '#666',
    fontSize: '14px',
  },
  select: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    backgroundColor: 'white',
  },
  fileUpload: {
    border: '2px dashed #ddd',
    borderRadius: '5px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  fileInput: {
    display: 'none',
  },
  filePreview: {
    marginTop: '10px',
  },
  fileName: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  placeholder: {
    color: '#999',
  },
  submitButton: {
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
    margin: '10px 0',
  },
  successMessage: {
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: 'bold',
  },
};

export default IDVerification;
