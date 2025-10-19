import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css'; // Scoped styles
import '../styles/global.css'; // Global styles
import dogLogo from '../assets/images/petcare15logo.png';

function LandingPage() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleAgreeChange = (e) => {
    setAgreed(e.target.checked);
  };

  const handleProceedClick = () => {
    navigate('/profiles');
  };

  return (
    <div className={styles.landingPageContainer}>
      <div className={styles.titleWrapper}>
        <img src={dogLogo} alt="Pet Logo" className={styles.logoImage} />
        <div className={styles.titleBox}>
          <h1 className={styles.titleText}>Welcome to Petcare 15!</h1>
        </div>
      </div>

      <div className={styles.contentBackdropWrapper}>
        <div className={styles.agreementPrompt}>
          <p>
            This site contains animals.
            In order to enter, you must agree with the following conditions:<br /><br />
            1. Like animals<br /><br />
            2. Be nice to animals<br /><br />
            3. Acknowledge animals are angels
          </p>

          <div className={styles.checkboxButtonGroup}>
            <label className={styles.agreementLabel}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={handleAgreeChange}
              />
              I have read and agree to the terms.
            </label>

            <button
              type="button"
              className={styles.agreeButton}
              onClick={handleProceedClick}
              disabled={!agreed}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
