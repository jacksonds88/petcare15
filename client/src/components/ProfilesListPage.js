import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import styles from './ProfilesListPage.module.css';
import bubbleStyles from '../styles/Bubbles.module.css';
import defaultThumb from '../assets/images/default.png';

function ProfilesListPage() {
  const [updates, setUpdates] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [contact, setContact] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/updates`)
      .then(res => setUpdates(res.data))
      .catch(err => console.error('Error fetching updates:', err));
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/profiles`)
      .then(response => setProfiles(response.data))
      .catch(error => console.error('Error fetching profiles:', error));
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/contact`)
      .then(response => setContact(response.data))
      .catch(error => console.error('Error fetching contact:', error));
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.profilesListContainer}>

        {/* Announcements */}
        <div className={styles.card}>
          <h2>Announcements</h2>
          <ul className={styles.updateList}>
            {updates.map(item => (
              <li key={item.id}>{item.update}</li>
            ))}
          </ul>
        </div>

        {/* Profiles */}
        <ul className={styles.profileGrid}>
          {profiles.map(profile => (
            <li key={profile.id} className={styles.profileRow}>
              <div className={styles.card}>
                <Link to={`/profiles/${profile.id}`} className={styles.profileLink}>
                  <div className={styles.profileGridLayout}>
                    <img
                      src={profile.profileThumbnail ? `/images/${profile.id}/${profile.profileThumbnail}` : defaultThumb}
                      alt={profile.name}
                      className={styles.profileThumbnail}
                    />
                    <div className={styles.profileDetails}>
                      <h2 className={styles.profileName}>{profile.name}</h2>
                      {profile.indoorServices && (
                        <p className={styles.profileSubtext}>
                          <strong>Indoor:</strong> {profile.indoorServices}
                        </p>
                      )}
                      {profile.outdoorServices && (
                        <p className={styles.profileSubtext}>
                          <strong>Outdoor:</strong> {profile.outdoorServices}
                        </p>
                      )}
                      <div className={`${bubbleStyles.bubbleStyle} ${profile.available ? bubbleStyles.available : bubbleStyles.unavailable}`}>
                        {profile.available ? 'Available Today 🐾' : 'On Vacation 🏖️'}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </li>
          ))}
        </ul>

        {/* Contact */}
        <div className={styles.card}>
          <div className={styles.contactNote}>
            <p>
              To schedule an appointment, please text the following number(s). <strong>New users must register first.</strong>
            </p>
          </div>

          <div className={styles.contactDetails}>
            {contact && contact.phoneNumbers.length > 0 && (
              <div className={styles.phoneRow}>
                {contact.phoneNumbers.map((number, index) => (
                  number.trim() && (
                    <React.Fragment key={index}>
                      <div className={`${bubbleStyles.bubbleStyle} ${bubbleStyles.contactWrapper}`}>
                        <span className={bubbleStyles.contactIcon}>📞</span>
                        <a href={`tel:${number}`} className={bubbleStyles.contactLink}>{number}</a>
                      </div>
                      {index === 0 && contact.phoneNumbers.length > 1 && (
                        <span>or</span>
                      )}
                    </React.Fragment>
                  )
                ))}
              </div>
            )}

            {contact && (
              <div className={`${bubbleStyles.bubbleStyle} ${bubbleStyles.contactWrapper}`}>
                <span className={bubbleStyles.contactIcon}>📍</span>
                <a
                  href={contact.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={bubbleStyles.contactLink}
                >
                  San Jose, California
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProfilesListPage;
