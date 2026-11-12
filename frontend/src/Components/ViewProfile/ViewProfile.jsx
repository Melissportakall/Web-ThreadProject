import React, { useEffect, useState } from 'react';
import Navbar from '../NavBar/Navbar';
import { apiRequest } from '../../api';

const ViewProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Profile';
    apiRequest('/auth/me')
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #dfe8ff 0%, #edf4ff 100%)', padding: '28px 20px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', background: 'rgba(255,255,255,0.8)', borderRadius: '24px', padding: '28px', boxShadow: '0 20px 42px rgba(32, 50, 94, 0.12)' }}>
          <h1 style={{ margin: '0 0 16px', color: '#101827' }}>Profile</h1>
          {loading ? (
            <p>Loading profile...</p>
          ) : !profile ? (
            <p>Unable to load your profile.</p>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={rowStyle}><strong>Username</strong><span>{profile.username}</span></div>
              <div style={rowStyle}><strong>Role</strong><span>{profile.role}</span></div>
              <div style={rowStyle}><strong>Customer type</strong><span>{profile.customer_type}</span></div>
              <div style={rowStyle}><strong>Budget</strong><span>${profile.budget}.00</span></div>
              <div style={rowStyle}><strong>Total spent</strong><span>${profile.total_spent}.00</span></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px 14px',
  borderRadius: '12px',
  background: '#f8faff',
  border: '1px solid #e2e8f0',
  color: '#1f2937',
};

export default ViewProfile;
