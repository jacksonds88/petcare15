import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ApplicationsPage.module.css';
import bubbleStyles from '../styles/Bubbles.module.css';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({
    customers: false,
    blacklisted: true,
  });
  const [collapsedCustomers, setCollapsedCustomers] = useState({});
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
    const fetchCustomers = async () => {
      try {
        const res = await fetch('/api/customers');
        const data = await res.json();
        if (Array.isArray(data)) {
          setCustomers(data);
          const collapsed = {};
          data.forEach((cust) => {
            collapsed[cust.id] = true;
          });
          setCollapsedCustomers(collapsed);
        } else {
          console.error('Unexpected response format:', data);
        }
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const toggleSection = (key) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleCustomer = (id) => {
    setCollapsedCustomers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const grouped = {
    customers: [],
    blacklisted: [],
  };

  customers.forEach((cust) => {
    const isBlacklisted = cust.profiles.some((p) => p.blackListed);
    if (isBlacklisted) {
      grouped.blacklisted.push(cust);
    } else {
      grouped.customers.push(cust);
    }
  });

  const renderCustomer = (cust) => {
    const handleBlacklist = async (profileId) => {
        const confirmed = window.confirm('Are you sure you want to blacklist this profile?');
        if (!confirmed) return;

        try {
        const res = await fetch(`/api/customers/${cust.id}/blacklist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profileId }),
        });

        if (res.ok) {
            const updated = await res.json();
            setCustomers((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
            );
        } else {
            console.error('Failed to update blacklist status');
        }
        } catch (err) {
        console.error('Error blacklisting profile:', err);
        }
    };

    return (
        <div key={cust.id} className={styles.applicationCard}>
        <div className={styles.applicationHeader}>
            <h3
            className={`${styles.applicationName} ${bubbleStyles.bubbleStyle} ${bubbleStyles.contactWrapper}`}
            onClick={() => toggleCustomer(cust.id)}
            >
            {cust.name}
            </h3>
        </div>

        {!collapsedCustomers[cust.id] && (
            <>
            <div className={styles.applicationField}>
                <label>Phone Number</label>
                <input type="text" value={cust.phoneNumber} disabled />
            </div>
            <div className={styles.applicationField}>
                <label>Application ID</label>
                <input type="text" value={cust.applicationId} disabled />
            </div>
            <div className={styles.applicationField}>
                <label>Profiles</label>
                <div className={styles.referencesBlock}>
                {cust.profiles.map((profile) => (
                    <div key={profile.profileId} style={{ marginBottom: '1rem' }}>
                    <div>Profile ID: {profile.profileId}</div>
                    <div>Visitor Count: {profile.visitorCount}</div>
                    {profile.positiveExperience && <div>Positive Experience ✅</div>}
                    {profile.charitable && <div>Charitable ✅</div>}
                    {!profile.blackListed && (
                        <button
                        className={`${bubbleStyles.bubbleStyle} ${bubbleStyles.unavailable}`}
                        onClick={() => handleBlacklist(profile.profileId)}
                        >
                        🚫 Blacklist
                        </button>
                    )}
                    </div>
                ))}
                </div>
            </div>
            </>
        )}
        </div>
    );
  };

  const renderSection = (key, label) => (
    <div className={`${styles.applicationSection} ${styles[key]}`}>
      <div className={styles.sectionHeader}>
        <h2
          className={`${styles.sectionTitle} ${bubbleStyles.bubbleStyle} ${bubbleStyles.contactWrapper}`}
          onClick={() => toggleSection(key)}
        >
          {label}
        </h2>
      </div>

      {!collapsedSections[key] && grouped[key].map(renderCustomer)}
    </div>
  );

  return (
    <div className={styles.applicationWrapper}>
      <h1>Customers</h1>
      {loading ? (
        <div>Loading customers...</div>
      ) : (
        <>
          {renderSection('customers', 'Customers')}
          {renderSection('blacklisted', 'Blacklisted')}
        </>
      )}
    </div>
  );
};

export default CustomersPage;
