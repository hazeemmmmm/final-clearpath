import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getUserProfile } from '../../utils/api';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = useSelector((state) => state.auth?.token);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError('Please log in to view your profile.');
        setLoading(false);
        return;
      }
      try {
        const response = await getUserProfile();
        setProfile(response.user);
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  return (
    <div className="profile-container">
      <Navbar />
      <main className="content" style={{ marginTop: '100px', minHeight: '60vh', padding: '20px' }}>
        <h1>My Profile</h1>
        {loading ? <p>Loading profile...</p> : error ? <p className="error">{error}</p> : (
          <div className="profile-details">
            <p><strong>Name:</strong> {profile?.firstName} {profile?.lastName}</p>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Phone:</strong> {profile?.phoneNumber}</p>
            <p><strong>Gender:</strong> {profile?.gender}</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
