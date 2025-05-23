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
  const navigate = useNavigate();

  // Used to refresh the form status for account number and password
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
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

  // display the login form
  return (
    <div className={styles.loginContainer}>
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
      </form>
    </div>
  );
};

export default Login;
