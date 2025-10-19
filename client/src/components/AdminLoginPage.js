import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './AdminLoginPage.module.css';

const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = location.state?.from || '/admin';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new URLSearchParams();
    formData.append('password', password);

    try {
      const res = await fetch('/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (res.redirected) {
        window.location.href = res.url;
      } else {
        const text = await res.text();
        setError(`Login failed: ${text}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };



  return (
    <div className={styles.loginWrapper}>
      <form onSubmit={handleLogin} className={styles.loginContainer}>
        <h2>Admin Login</h2>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {error && <div className={styles.errorMessage}>{error}</div>}
      </form>
    </div>
  );
};

export default AdminLoginPage;
