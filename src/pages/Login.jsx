// src/pages/Login.jsx
import React, { useState } from 'react';
// to handle routing
import { useNavigate } from 'react-router-dom';
import { Auth } from '../services/api';
import styles from '../styles/Login.module.css';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetData, setResetData] = useState({
    accountNumber: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const navigate = useNavigate();

  // Used to refresh the form status for account number and password
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Used to refresh the form status for Reset password
  const handleResetInputChange = (e) => {
    const { id, value } = e.target;
    setResetData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // used to send info to the api, use the Auth function
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Account number and password are required');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const user = await Auth.login({
        username: formData.username.trim(),
        password: formData.password,
      });

      if (!user) {
        throw new Error('No user data returned');
      }

      setUser(user);
      navigate('/dashboard', { replace: true }); // always route to dashboard
    } catch (err) {
      let errorMessage = 'Authentication failed. Please try again.';

      if (err.response) {
        if (err.response.status === 422) {
          errorMessage = Object.entries(err.response.data.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('\n');
        } else if (err.response.status === 401) {
          errorMessage = 'Invalid Account number or password';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  // used to handle reset password
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    // Validate reset form
    if (!resetData.accountNumber.trim()) {
      setResetError('Account number is required');
      return;
    }

    if (!resetData.newPassword || !resetData.confirmPassword) {
      setResetError('Both password fields are required');
      return;
    }

    if (resetData.newPassword.length < 8) {
      setResetError('Password must be at least 8 characters long');
      return;
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Call API to reset password
      const response = await Auth.resetPassword({
        username: resetData.accountNumber.trim(),
        password: resetData.newPassword,
      });

      if (response.success) {
        setResetSuccess('Your password has been changed successfully');
        setResetData({
          accountNumber: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => {
          setShowResetForm(false);
          setResetSuccess('');
        }, 3000);
      } else {
        setResetError(response.message || 'Failed to reset password');
      }
    } catch (err) {
      let errorMessage = 'Password reset failed. Please try again.';
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Invalid account number';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      setResetError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // display the login form
  return (
    <div className={styles.loginContainer}>
      {!showResetForm ? (
        <form onSubmit={handleLoginSubmit} className={styles.loginForm}>
          <h2>Admin Login</h2>

          {error && (
            <div className={styles.error}>
              {error.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="username">Account number:</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              autoComplete="username"
              placeholder="Enter your Account number"
              aria-label="Account number"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              minLength="6"
              aria-label="Password"
            />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading}
            aria-busy={isLoading}
            aria-label={isLoading ? 'Logging in...' : 'Login'}
          >
            {isLoading ? (
              <span className={styles.spinner} aria-hidden="true"></span>
            ) : (
              'Login'
            )}
          </button>

          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowResetForm(true)}
          >
            ?Forgot your password
          </button>
        </form>
      ) : (
        <form onSubmit={handlePasswordReset} className={styles.loginForm}>
          <h2>Reset Password</h2>

          {resetError && <div className={styles.error}>{resetError}</div>}
          {resetSuccess && <div className={styles.success}>{resetSuccess}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="accountNumber">Account number:</label>
            <input
              type="text"
              id="accountNumber"
              value={resetData.accountNumber}
              onChange={handleResetInputChange}
              required
              placeholder="Enter your Account number"
              aria-label="Account number"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={resetData.newPassword}
              onChange={handleResetInputChange}
              required
              minLength="8"
              placeholder="Enter new password (min 8 characters)"
              aria-label="New Password"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={resetData.confirmPassword}
              onChange={handleResetInputChange}
              required
              minLength="8"
              placeholder="Confirm your new password"
              aria-label="Confirm Password"
            />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className={styles.spinner} aria-hidden="true"></span>
            ) : (
              'Reset Password'
            )}
          </button>

          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => {
              setShowResetForm(false);
              setResetError('');
              setResetSuccess('');
            }}
            disabled={isLoading}
          >
            Back to Login
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;
