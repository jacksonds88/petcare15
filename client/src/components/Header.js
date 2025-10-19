import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import petcareLogo from '../assets/images/welcometitle_petcare15.png';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const showNavbar = location.pathname !== '/';
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    fetch('/admin-check', { credentials: 'include' })
      .then(res => {
        if (res.status === 200) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleLogout = () => {
    fetch('/admin-logout', { method: 'POST', credentials: 'include' }).then(() => {
      navigate('/');
    });
  };

  return (
    <div className={styles.siteHeader}>
      {showNavbar && (
        <>
          <div className={styles.siteTitle}>
            <img src={petcareLogo} alt="PetCare15 Logo" className={styles.siteLogo} />
          </div>

          <div className={styles.navWrapper}>
            {/* Main nav row */}
            <div className={styles.navLinks}>
              <Link to="/" className={location.pathname === '/' ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                Welcome Page
              </Link>
              <Link to="/profiles" className={location.pathname === '/profiles' ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                Profiles
              </Link>
              <Link to="/newuser" className={location.pathname === '/newuser' ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                New User
              </Link>
              <Link to="/policy" className={location.pathname === '/policy' ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                Policy
              </Link>
            </div>

            {/* Admin nav row */}
            {isLoggedIn && (
              <div className={styles.adminLinks}>
                <Link to="/admin" className={location.pathname === '/admin' ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                  Admin
                </Link>
                <Link to="/admin/applications" className={location.pathname === '/admin/applications' ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                  Applications
                </Link>
                <Link to="/admin/customers" className={location.pathname === '/admin/customers' ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                  Customers
                </Link>
              </div>
            )}
          </div>

          {/* Logout button only on /admin */}
          {isAdminRoute && (
            <div className={styles.logoutWrapper}>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Header;