import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import styles from './ProfileDetailPage.module.css';
import bubbleStyles from '../styles/Bubbles.module.css';

// Import each image you need from its location in src/assets/images/
import defaultThumb from '../assets/images/default.png';

function ProfileDetailPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [contact, setContact] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);
  const imagePath = profile ? `/images/${profile.id}` : '';

  const handleMediaClick = (src) => {
    const extension = src.split('.').pop().toLowerCase();
    const type = ['jpg', 'jpeg', 'png', 'gif'].includes(extension) ? 'image' : 'video';
    const index = profile?.gallery?.findIndex(f => `${imagePath}/${f}` === src);

    setSelectedMedia({ src, type });
    setSelectedMediaIndex(index);
  };

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/contact`)
      .then(response => setContact(response.data))
      .catch(error => console.error('Error fetching contact:', error));
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/profiles/${id}`)
      .then(response => setProfile(response.data))
      .catch(error => console.error('Error fetching profile:', error));
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedMedia || !profile?.gallery) return;

      if (e.key === 'Escape') {
        setSelectedMedia(null);
        setSelectedMediaIndex(null);
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const total = profile.gallery.length;
        let newIndex = selectedMediaIndex;

        if (e.key === 'ArrowLeft') {
          newIndex = (selectedMediaIndex - 1 + total) % total;
        } else if (e.key === 'ArrowRight') {
          newIndex = (selectedMediaIndex + 1) % total;
        }

        const newSrc = `${imagePath}/${profile.gallery[newIndex]}`;
        const extension = profile.gallery[newIndex].split('.').pop().toLowerCase();
        const type = ['jpg', 'jpeg', 'png', 'gif'].includes(extension) ? 'image' : 'video';

        setSelectedMedia({ src: newSrc, type });
        setSelectedMediaIndex(newIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMedia, selectedMediaIndex, profile]);

  if (!profile) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
<>
<div className={styles.pageWrapper}>
  <div className={styles.profileCard}>
    <div className={styles.headerSection}>
      <div className={styles.profileImageWrapper}>
        <img
          src={profile.profileFullImage ? `${imagePath}/${profile.profileFullImage}` : defaultThumb}
          alt={`${profile.name}'s profile`}
          className={styles.profileImage}
        />
      </div>

      <div className={styles.headerDetails}>
        <h1 className={styles.profileName}>{profile.name}</h1>

        <div className={`${bubbleStyles.bubbleStyle} ${profile.available ? bubbleStyles.available : bubbleStyles.unavailable}`}>
          {profile.available ? 'Available Today 🐾' : 'On Vacation 🏖️'}
        </div>

        <div className={styles.statsBlock}>
          {profile.highlights && (
            <p className={styles.highlightLine}>
              <strong>Highlights:</strong> {profile.highlights}
            </p>
          )}
          <p><strong>Breed:</strong> {profile.breed}</p>
          <p><strong>Height:</strong> {profile.heightCm} cm</p>
          {profile.weightKg != null && profile.weightKg > 0 && (
            <p><strong>Weight:</strong> {profile.weightKg} kg</p>
          )}
          {profile.harness_size && (
            <p><strong>Harness Size:</strong> {profile.harnessSize}</p>
          )}
        </div>
      </div>
    </div>

    <div className={styles.services}>
      {(profile.indoorServices || profile.outdoorServices) && (
        <div className={styles.serviceBlock}>
          {profile.indoorServices && (
            <p>
              <span className={styles.servicesLabel}>🏠 Indoor Services:</span>{' '}
              <span className={styles.servicesValue}>{profile.indoorServices}</span>
            </p>
          )}
          {profile.outdoorServices && (
            <p>
              <span className={styles.servicesLabel}>🚗 Outdoor Services:</span>{' '}
              <span className={styles.servicesValue}>{profile.outdoorServices}</span>
            </p>
          )}
        </div>
      )}
    </div>

    {profile.aboutMe && (
      <div className={styles.aboutMe}>
        <p><strong>About Me:</strong> {profile.aboutMe}</p>
      </div>
    )}

    {profile.review.link && (
      <div className={styles.reviewLinkWrapper}>
        <a
          href={profile.review.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`${bubbleStyles.bubbleStyle} ${styles.reviewLink}`}
        >
          Reviews: {profile.review.link}
        </a>
      </div>
    )}
        
    {(profile.profileFullImage || profile.gallery?.length > 0) && (
      <div className={`${styles.gallery} ${selectedMedia ? styles.galleryDimmed : ''}`}>
        <div className={styles.sectionHeader}>
          <hr className={styles.sectionLine} />
          <span className={styles.sectionTitle}>Gallery</span>
          <hr className={styles.sectionLine} />
        </div>

        <div className={styles.galleryGrid}>
          {(profile.profileFullImage
            ? [profile.profileFullImage, ...profile.gallery.filter(f => f !== profile.profileFullImage)]
            : profile.gallery
          ).map((fileName, index) => {
            const isVideo = fileName.endsWith('.mp4') || fileName.endsWith('.mov');
            return isVideo ? (
              <video
                key={index}
                src={`/videos/${fileName}`}
                className={styles.galleryVideo}
                muted
                autoPlay
                loop
                preload="metadata"
                onClick={() => handleMediaClick(`/videos/${fileName}`)}
              />
            ) : (
              <img
                key={index}
                src={`${imagePath}/${fileName}`}
                alt={`Gallery image ${index + 1}`}
                className={styles.galleryImage}
                onClick={() => handleMediaClick(`${imagePath}/${fileName}`)}
              />
            );
          })}
        </div>
      </div>
    )}

    {profile.specialGallery?.gallery?.length > 0 && (
      <div className={`${styles.gallery} ${selectedMedia ? styles.galleryDimmed : ''}`}>
        <div className={styles.sectionHeader}>
          <hr className={styles.sectionLine} />
          <span className={styles.sectionTitle}>{profile.specialGallery.description}</span>
          <hr className={styles.sectionLine} />
        </div>
        <div className={styles.galleryGrid}>
          {profile.specialGallery.gallery.map((fileName, index) => {
            const isVideo = fileName.endsWith('.mp4') || fileName.endsWith('.mov');
            return isVideo ? (
              <video
                key={index}
                src={`/videos/${fileName}`}
                className={styles.galleryVideo}
                muted
                autoPlay
                loop
                preload="metadata"
                onClick={() => handleMediaClick(`/videos/${fileName}`)}
              />
            ) : (
              <img
                key={index}
                src={`${imagePath}/${fileName}`}
                alt={`Special gallery image ${index + 1}`}
                className={styles.galleryImage}
                onClick={() => handleMediaClick(`${imagePath}/${fileName}`)}
              />
            );
          })}
        </div>
      </div>
    )}

    {Array.isArray(profile.review.samples) && profile.review.samples.length > 0 && (
      <div className={styles.reviewBlock}>
        <div className={styles.sectionHeader}>
          <hr className={styles.sectionLine} />
          <span className={styles.sectionTitle}>Review Samples</span>
          <hr className={styles.sectionLine} />
        </div>

        <div className={styles.reviewSection}>
          {profile.review.samples.map((review, index) => (
            <div key={index} className={`${bubbleStyles.bubbleStyle} ${bubbleStyles.available} ${styles.reviewBubble}`}>
              <p className={styles.reviewText}>“{review.text}”</p>
              {review.link && (
                <a
                  href={review.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.reviewLink}
                >
                  View Full Review ↗
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>

  {/* 🔍 Modal */}
  {selectedMedia && (
    <div className={styles.modalOverlay} onClick={() => setSelectedMedia(null)}>
      <div className={styles.modalContent}>
        {selectedMedia.type === 'image' ? (
          <img src={selectedMedia.src} alt="Selected" className={styles.modalImage} />
        ) : selectedMedia.type === 'video' ? (
          <video
            key={selectedMedia.src}
            src={selectedMedia.src}
            controls
            controlsList="nodownload"
            autoPlay
            className={styles.modalVideo}
          />
        ) : (
          <div>Unsupported media type</div>
        )}
      </div>
    </div>
  )}

{/* 📞 Contact Section */}
<div className={styles.sectionBox}>
  <div className={styles.contactBox}>
    <div className={styles.contactNote}>
      <p>
        To schedule an appointment, please text the following number(s).{' '}
        <strong>New users must register first.</strong>
      </p>
    </div>

    <div className={styles.contactDetails}>
      {contact?.phoneNumbers?.length > 0 && (
        <div className={styles.phoneRow}>
          {contact.phoneNumbers.map((number, index) => (
            number.trim() && (
              <React.Fragment key={index}>
                <div className={`${bubbleStyles.bubbleStyle} ${bubbleStyles.contactWrapper}`}>
                  <span className={styles.contactIcon}>📞</span>
                  <a href={`tel:${number}`} className={styles.contactLink}>{number}</a>
                </div>
                {index === 0 && contact.phoneNumbers.length > 1 && <span>or</span>}
              </React.Fragment>
            )
          ))}
        </div>
      )}

      <div className={`${bubbleStyles.bubbleStyle} ${bubbleStyles.contactWrapper}`}>
        <span className={styles.contactIcon}>📍</span>
        <a
          href="https://www.google.com/maps/search/?api=1&query=San+Jose,+CA"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactLink}
        >
          San Jose, California
        </a>
      </div>
    </div>
  </div>
</div>

</div>
</>

  );
}

export default ProfileDetailPage;