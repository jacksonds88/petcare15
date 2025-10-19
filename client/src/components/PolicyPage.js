import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import styles from './PolicyPage.module.css';

function PolicyPage() {
  const [contact, setContact] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/contact`)
      .then(response => setContact(response.data))
      .catch(error => console.error('Error fetching contact:', error));
  }, []);

  return (
    <div>
      {/* Policy Section */}
      <div className={styles.policyContainer}>
        <h1 className={styles.policyTitle}>Policies</h1>
        <div className={styles.policyContent}>
          <ul>
            <li>🕒 Don't keep the pets waiting. Animals also deserve our respect and time.</li>
            <li>🚫 Cancel responsibly and ahead of time.</li>
            <li>📸 Every pet in our care is a super model. They love to be photographed.</li>
            <li>🐶 Most importantly, play nice and have fun!</li>
          </ul>
        </div>
      </div>

      {/* Contact Section */}
      <div className={styles.contactContainer}>
        <div className={styles.contactMessage}>
          Contact us for any concerns regarding quality of service, or suggestions to help us improve.
        </div>

        {contact && (
          <div className={styles.contactDetails}>
            <div>
              💌 <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PolicyPage;
