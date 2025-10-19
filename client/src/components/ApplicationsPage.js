import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ApplicationStatus } from '../constants';
import styles from './ApplicationsPage.module.css';
import bubbleStyles from '../styles/Bubbles.module.css';

const ApplicationsPage = () => {
  const [Applications, setApplications] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({
    [ApplicationStatus.PENDING]: false,
    [ApplicationStatus.REJECTED]: true,
    [ApplicationStatus.APPROVED]: true,
  });
  const [collapsedApplications, setCollapsedApplications] = useState({});
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/admin-check').then(res => {
      if (res.status !== 200) {
        navigate('/admin-login', { state: { from: location.pathname } });
      }
    });
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/Applications');
        const data = await res.json();
        if (Array.isArray(data)) {
          setApplications(data);
          const collapsed = {};
          data.forEach((app) => {
            collapsed[app.id] = true;
          });
          setCollapsedApplications(collapsed);
        } else {
          console.error('Unexpected response format:', data);
        }
      } catch (err) {
        console.error('Failed to fetch Applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const toggleSection = (status) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const toggleApplication = (id) => {
    setCollapsedApplications((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const approveApplication = async (applicationId) => {
    try {
      const res = await fetch('/api/approve-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId }),
      });

      if (res.status === 200) {
        updateApplicationStatus(applicationId, ApplicationStatus.APPROVED);
      } else {
        console.error('Failed to approve application');
      }
    } catch (err) {
      console.error('Error approving application:', err);
    }
  };

  const rejectApplication = async (applicationId) => {
    try {
      const res = await fetch('/api/reject-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId }),
      });

      if (res.status === 200) {
        updateApplicationStatus(applicationId, ApplicationStatus.REJECTED);
      } else {
        console.error('Failed to reject application');
      }
    } catch (err) {
      console.error('Error rejecting application:', err);
    }
  };

  const updateApplicationStatus = (id, newStatus) => {
    const updated = Applications.map((app) =>
      app.id === id ? { ...app, status: newStatus } : app
    );
    setApplications(updated);
  };

  const grouped = {
    [ApplicationStatus.PENDING]: [],
    [ApplicationStatus.REJECTED]: [],
    [ApplicationStatus.APPROVED]: [],
  };

  if (Array.isArray(Applications)) {
    Applications.forEach((app) => {
      grouped[app.status]?.push(app);
    });
  }

  const renderApplication = (Application) => (
    <div key={Application.id} className={styles.applicationCard}>
      <div className={styles.applicationHeader}>
        <h3
          className={`${styles.ApplicationName} ${bubbleStyles.bubbleStyle} ${bubbleStyles.contactWrapper}`}
          onClick={() => toggleApplication(Application.id)}
        >
          {Application.name}
        </h3>
      </div>

      {!collapsedApplications[Application.id] && (
        <>
          <div className={styles.applicationField}>
            <label>Phone Number</label>
            <input type="text" value={Application.phoneNumber} disabled />
          </div>
          <div className={styles.applicationField}>
            <label>Email</label>
            <input type="text" value={Application.email} disabled />
          </div>
          <div className={styles.applicationField}>
            <label>Selfie Image</label>
            <input type="text" value={Application.selfieImage} disabled />
          </div>
          <div className={styles.applicationField}>
            <label>Driver License Image</label>
            <input type="text" value={Application.driverLicenseImage} disabled />
          </div>
          <div className={styles.applicationField}>
            <label>References</label>
            <div className={styles.referencesBlock}>
              <div>Company 1: {Application.references.companyName1}</div>
              <div>Phone 1: {Application.references.companyPhoneNumber1}</div>
              <div>
                <label>Company 1 Confirmed</label>
                <input
                  type="checkbox"
                  checked={Boolean(Application.references.companyName1Confirmed)}
                  disabled
                />
              </div>
              <div>Company 2: {Application.references.companyName2}</div>
              <div>Phone 2: {Application.references.companyPhoneNumber2}</div>
              <div>
                <label>Company 2 Confirmed</label>
                <input
                  type="checkbox"
                  checked={Boolean(Application.references.companyName2Confirmed)}
                  disabled
                />
              </div>
            </div>
          </div>

          {Application.note && (
            <div className={styles.applicationField}>
              <label>Note</label>
              <textarea rows={3} value={Application.note} disabled />
            </div>
          )}

        <div className={styles.bubbleRow}>
          {Application.status === ApplicationStatus.REJECTED && (
            <div className={`${bubbleStyles.bubbleStyle} ${bubbleStyles.unavailable}`}>
              Rejected ❌
            </div>
          )}
          {Application.status === ApplicationStatus.APPROVED && (
            <div className={`${bubbleStyles.bubbleStyle} ${bubbleStyles.contactWrapper}`}>
              Approved ✅
            </div>
          )}
        </div>

        <div className={styles.statusActionRow}>
          {Application.status === ApplicationStatus.PENDING && (
            <button
              className={`${styles.statusButton} ${styles.approve}`}
              onClick={() => approveApplication(Application.id)}
            >
              ✅ Approve
            </button>
          )}
          {Application.status === ApplicationStatus.REJECTED && (
            <button
              className={`${styles.statusButton} ${styles.unreject}`}
              onClick={() => updateApplicationStatus(Application.id, ApplicationStatus.PENDING)}
            >
              🔄 Unreject
            </button>
          )}
          </div>
        </>
      )}
    </div>
  );

  const renderSection = (status, label) => (
    <div className={`${styles.applicationSection} ${styles[label.split(' ')[0].toLowerCase()]}`}>
      <div className={styles.sectionHeader}>
        <h2
          className={`${styles.sectionTitle} ${bubbleStyles.bubbleStyle} ${bubbleStyles.contactWrapper}`}
          onClick={() => toggleSection(status)}
        >
          {label}
        </h2>
      </div>

      {!collapsedSections[status] && grouped[status].map(renderApplication)}
    </div>
  );

  return (
    <div className={styles.applicationWrapper}>
      <h1>Applications</h1>
      {loading ? (
        <div>Loading applications...</div>
      ) : (
        <>
          {renderSection(ApplicationStatus.PENDING, 'Pending Applications')}
          {renderSection(ApplicationStatus.REJECTED, 'Rejected Applications')}
          {renderSection(ApplicationStatus.APPROVED, 'Approved Applications')}
        </>
      )}
    </div>
  );
};

export default ApplicationsPage;