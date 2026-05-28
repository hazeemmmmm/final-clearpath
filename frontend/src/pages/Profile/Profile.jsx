import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getUserProfile, getMyReviews, deleteReview, updateProfile, changePassword } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './Profile.css';

const Profile = () => {
  const { lang } = useContext(LanguageContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tabs and Reviews State
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'reviews'
  const [myReviews, setMyReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const location = useLocation();
  const token = useSelector((state) => state.auth?.token) || localStorage.getItem('token') || localStorage.getItem('clearpath_access_token');

  // Edit Profile Form States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: '',
    nationality: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Change Password Form States
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const reviewsRes = await getMyReviews();
      const reviewsList = reviewsRes.reviews || reviewsRes.data?.reviews || reviewsRes.data || reviewsRes || [];
      setMyReviews(reviewsList);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (profile) {
      setEditForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
        gender: profile.gender || '',
        nationality: profile.nationality || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'reviews') {
      setTimeout(() => setActiveTab('reviews'), 0);
      fetchReviews();
    } else if (tabParam === 'info') {
      setTimeout(() => setActiveTab('info'), 0);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError('Please log in to view your profile.');
        setLoading(false);
        return;
      }
      try {
        const response = await getUserProfile();
        setProfile(response.user || response.data?.user || response.data || response);
        
        // Quietly fetch reviews count
        const reviewsRes = await getMyReviews();
        const reviewsList = reviewsRes.reviews || reviewsRes.data?.reviews || reviewsRes.data || reviewsRes || [];
        setMyReviews(reviewsList);
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);



  const handleDeleteReview = async (reviewId) => {
    const confirmMsg = lang === 'AR'
      ? 'هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء.'
      : 'Are you sure you want to delete this review? This action cannot be undone.';
    if (window.confirm(confirmMsg)) {
      try {
        await deleteReview(reviewId);
        setMyReviews(prev => prev.filter(r => r._id !== reviewId));
      } catch (err) {
        const errorMsg = lang === 'AR' ? 'فشل حذف التقييم.' : (err.message || 'Failed to delete review');
        alert(errorMsg);
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      const response = await updateProfile(editForm);
      const updatedUser = response.user || response.data?.user || response.data || response;
      setProfile(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditSuccess(lang === 'AR' ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setEditError(lang === 'AR' ? 'فشل تحديث الملف الشخصي.' : (err.message || 'Failed to update profile.'));
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(lang === 'AR' ? 'كلمات المرور الجديدة غير متطابقة.' : 'New passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordSuccess(lang === 'AR' ? 'تم تغيير كلمة المرور بنجاح!' : 'Password changed successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(lang === 'AR' ? 'فشل تغيير كلمة المرور. يرجى التأكد من كلمة المرور الحالية.' : (err.message || 'Failed to change password.'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`${i <= rating ? 'fa-solid' : 'fa-regular'} fa-star`}
          style={{ color: i <= rating ? '#FFD700' : '#ddd', marginRight: '3px' }}
        />
      );
    }
    return <div className="stars-container">{stars}</div>;
  };

  return (
    <div className={`profile-page ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <Navbar lang={lang} />
      
      <main className="profile-main-container">
        {loading ? (
          <div className="loading-spinner">
            <i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري تحميل ملفك الشخصي...' : 'Loading profile...'}
          </div>
        ) : error ? (
          <div className="error-card">
            <i className="fa-solid fa-circle-exclamation"></i>
            <p>{lang === 'AR' ? 'يرجى تسجيل الدخول لعرض ملفك الشخصي.' : error}</p>
            <Link to="/login" className="btn-back">{lang === 'AR' ? 'تسجيل الدخول الآن' : 'Log In Now'}</Link>
          </div>
        ) : (
          <div className="profile-layout-grid">
            
            {/* Left Column: Sidebar / Profile Summary */}
            <aside className="profile-summary-sidebar">
              <div className="avatar-large">
                {profile?.firstName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h3>{profile?.firstName} {profile?.lastName}</h3>
              <p className="user-email"><i className="fa-regular fa-envelope"></i> {profile?.email}</p>
              
              {profile?.role && (
                <span className={`role-badge ${profile.role.toLowerCase()}`}>
                  {profile.role === 'admin'
                    ? (lang === 'AR' ? 'مشرف' : 'ADMIN')
                    : profile.role === 'supervisor'
                    ? (lang === 'AR' ? 'مشرف جولات' : 'SUPERVISOR')
                    : (lang === 'AR' ? 'مسافر' : 'USER')}
                </span>
              )}

              <hr className="sidebar-divider" />
              
              <div className="profile-menu-navigation">
                <button 
                  className={`menu-nav-btn ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  <i className="fa-solid fa-address-card"></i> {lang === 'AR' ? 'بياناتي الشخصية' : 'Personal Info'}
                </button>
                <button 
                  className={`menu-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('reviews'); fetchReviews(); }}
                >
                  <i className="fa-solid fa-comment-dots"></i> {lang === 'AR' ? 'تقييماتي' : 'My Reviews'} <span className="count-bubble">{myReviews.length}</span>
                </button>
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="menu-nav-btn admin-link">
                    <i className="fa-solid fa-user-shield"></i> {lang === 'AR' ? 'لوحة التحكم' : 'Admin Dashboard'}
                  </Link>
                )}
              </div>
            </aside>

            {/* Right Column: Tab Content */}
            <section className="profile-tab-content">
              
              {/* Tab 1: Personal Info */}
              {activeTab === 'info' && (
                <div className="tab-card-container">
                  <div className="tab-card info-tab">
                    <div className="tab-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h2>{lang === 'AR' ? 'معلومات الحساب الشخصية' : 'Personal Information'}</h2>
                        <p className="tab-subtitle">{lang === 'AR' ? 'إدارة تفاصيل بياناتك الشخصية وإعدادات حسابك.' : 'Manage your personal details and account configurations.'}</p>
                      </div>
                      {!isEditing && (
                        <button type="button" className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                          <i className="fa-solid fa-pen"></i> {lang === 'AR' ? 'تعديل الملف الشخصي' : 'Edit Profile'}
                        </button>
                      )}
                    </div>

                    {editSuccess && <div className="profile-alert success-alert" style={{ background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fa-solid fa-circle-check"></i> {editSuccess}</div>}
                    {editError && <div className="profile-alert error-alert" style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fa-solid fa-triangle-exclamation"></i> {editError}</div>}

                    {isEditing ? (
                      <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                        <div className="info-grid">
                          <div className="info-item">
                            <label>{lang === 'AR' ? 'الاسم الأول' : 'First Name'}</label>
                            <input
                              type="text"
                              value={editForm.firstName}
                              onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                              required
                            />
                          </div>
                          <div className="info-item">
                            <label>{lang === 'AR' ? 'الاسم الأخير' : 'Last Name'}</label>
                            <input
                              type="text"
                              value={editForm.lastName}
                              onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                              required
                            />
                          </div>
                          <div className="info-item">
                            <label>{lang === 'AR' ? 'البريد الإلكتروني (لا يمكن تغييره)' : 'Email Address (Cannot change)'}</label>
                            <div className="value-box disabled" style={{ opacity: 0.6 }}>{profile?.email || '—'}</div>
                          </div>
                          <div className="info-item">
                            <label>{lang === 'AR' ? 'رقم الهاتف' : 'Phone Number'}</label>
                            <input
                              type="text"
                              value={editForm.phoneNumber}
                              onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                            />
                          </div>
                          <div className="info-item">
                            <label>{lang === 'AR' ? 'الجنس' : 'Gender'}</label>
                            <select
                              value={editForm.gender}
                              onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                            >
                              <option value="">{lang === 'AR' ? 'اختر الجنس' : 'Select Gender'}</option>
                              <option value="male">{lang === 'AR' ? 'ذكر' : 'Male'}</option>
                              <option value="female">{lang === 'AR' ? 'أنثى' : 'Female'}</option>
                            </select>
                          </div>
                          <div className="info-item">
                            <label>{lang === 'AR' ? 'الجنسية' : 'Nationality'}</label>
                            <input
                              type="text"
                              value={editForm.nationality}
                              onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="form-actions-row" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                          <button type="submit" className="btn-save-profile" disabled={editLoading} style={{ background: 'var(--brand-color)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                            {editLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري الحفظ...' : 'Saving...'}</> : (lang === 'AR' ? 'حفظ التعديلات' : 'Save Changes')}
                          </button>
                          <button type="button" className="btn-cancel-profile" onClick={() => { setIsEditing(false); setEditError(''); setEditSuccess(''); }} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                            {lang === 'AR' ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="info-grid">
                        <div className="info-item">
                          <label>{lang === 'AR' ? 'الاسم الأول' : 'First Name'}</label>
                          <div className="value-box">{profile?.firstName || '—'}</div>
                        </div>
                        <div className="info-item">
                          <label>{lang === 'AR' ? 'الاسم الأخير' : 'Last Name'}</label>
                          <div className="value-box">{profile?.lastName || '—'}</div>
                        </div>
                        <div className="info-item">
                          <label>{lang === 'AR' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                          <div className="value-box">{profile?.email || '—'}</div>
                        </div>
                        <div className="info-item">
                          <label>{lang === 'AR' ? 'رقم الهاتف' : 'Phone Number'}</label>
                          <div className="value-box">{profile?.phoneNumber || '—'}</div>
                        </div>
                        <div className="info-item">
                          <label>{lang === 'AR' ? 'الجنس' : 'Gender'}</label>
                          <div className="value-box">{profile?.gender === 'male' ? (lang === 'AR' ? 'ذكر' : 'Male') : profile?.gender === 'female' ? (lang === 'AR' ? 'أنثى' : 'Female') : (profile?.gender || '—')}</div>
                        </div>
                        <div className="info-item">
                          <label>{lang === 'AR' ? 'الجنسية' : 'Nationality'}</label>
                          <div className="value-box">{profile?.nationality || '—'}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Change Password Card */}
                  <div className="tab-card password-tab" style={{ marginTop: '30px' }}>
                    <h2>{lang === 'AR' ? 'الأمان وكلمة المرور' : 'Security & Password'}</h2>
                    <p className="tab-subtitle">{lang === 'AR' ? 'حافظ على أمان حسابك عن طريق تغيير كلمة المرور بشكل دوري.' : 'Keep your account secure by changing your password periodically.'}</p>

                    {passwordSuccess && <div className="profile-alert success-alert" style={{ background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fa-solid fa-circle-check"></i> {passwordSuccess}</div>}
                    {passwordError && <div className="profile-alert error-alert" style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fa-solid fa-triangle-exclamation"></i> {passwordError}</div>}

                    <form onSubmit={handleChangePassword} className="password-change-form">
                      <div className="password-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                        <div className="info-item">
                          <label>{lang === 'AR' ? 'كلمة المرور الحالية' : 'Current Password'}</label>
                          <input
                            type="password"
                            placeholder={lang === 'AR' ? 'أدخل كلمة المرور الحالية' : "Enter current password"}
                            value={passwordForm.oldPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                            required
                            style={{ width: '90%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                          />
                        </div>
                        <div className="info-item">
                          <label>{lang === 'AR' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                          <input
                            type="password"
                            placeholder={lang === 'AR' ? 'أدخل كلمة المرور الجديدة' : "Enter new password"}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            required
                            style={{ width: '90%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                          />
                        </div>
                        <div className="info-item">
                          <label>{lang === 'AR' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</label>
                          <input
                            type="password"
                            placeholder={lang === 'AR' ? 'تأكيد كلمة المرور الجديدة' : "Confirm new password"}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            required
                            style={{ width: '90%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                          />
                        </div>
                      </div>
                      <div className="form-actions-row" style={{ marginTop: '20px' }}>
                        <button type="submit" className="btn-save-profile" disabled={passwordLoading} style={{ background: 'var(--brand-color)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                          {passwordLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري التحديث...' : 'Updating...'}</> : (lang === 'AR' ? 'تحديث كلمة المرور' : 'Update Password')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab 2: Reviews Management */}
              {activeTab === 'reviews' && (
                <div className="tab-card reviews-tab">
                  <h2>{lang === 'AR' ? 'تقييماتي المنشورة' : 'My Submitted Reviews'}</h2>
                  <p className="tab-subtitle">{lang === 'AR' ? 'جميع الآراء، التعليقات والتقييمات التي قمت بمشاركتها مع بقية المسافرين.' : 'All opinions, feedback, and reviews you have posted on packages.'}</p>

                  {loadingReviews ? (
                    <div className="loading-reviews">
                      <i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري جلب تقييماتك...' : 'Fetching your reviews...'}
                    </div>
                  ) : myReviews.length === 0 ? (
                    <div className="empty-reviews-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <i className="fa-regular fa-message" style={{ fontSize: '3rem', color: 'var(--brand-color)', marginBottom: '15px' }}></i>
                      <h4>{lang === 'AR' ? 'لم تقم بكتابة أي تقييم بعد' : 'No reviews submitted yet'}</h4>
                      <p>{lang === 'AR' ? 'أنت لم تقم بتقييم أي رحلات أو باقات سياحية حتى الآن. احجز رحلة وأخبرنا برأيك!' : 'You haven\'t reviewed any trips or packages. Book a journey and tell us what you think!'}</p>
                      <Link to="/experiences" className="btn-explore" style={{ display: 'inline-block', marginTop: '15px', padding: '10px 24px', background: 'var(--brand-color)', color: '#fff', borderRadius: '30px', textDecoration: 'none' }}>{lang === 'AR' ? 'استكشف الباقات' : 'Explore Packages'}</Link>
                    </div>
                  ) : (
                    <div className="my-reviews-list">
                      {myReviews.map((rev) => {
                        const packageTitle = rev.experience?.name || (lang === 'AR' ? 'رحلة سياحية مثيرة في مصر' : 'Exciting Egypt Trip');
                        const pkgId = rev.experience?._id || rev.experience;
                        const reviewDate = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        }) : 'Recent';

                        return (
                          <div key={rev._id} className="user-review-item-card">
                            
                            {/* Card Header */}
                            <div className="review-item-header">
                              <div>
                                <h4>
                                  {pkgId ? (
                                    <Link to={`/package-details/${pkgId}`} className="pkg-link">
                                      {packageTitle}
                                    </Link>
                                  ) : packageTitle}
                                </h4>
                                <span className="review-item-date">{reviewDate}</span>
                              </div>
                              <button 
                                className="btn-delete-review"
                                onClick={() => handleDeleteReview(rev._id)}
                                title={lang === 'AR' ? 'حذف هذا التقييم' : "Delete this review"}
                              >
                                <i className="fa-solid fa-trash-can"></i> {lang === 'AR' ? 'حذف' : 'Delete'}
                              </button>
                            </div>

                            {/* Stars Rating */}
                            <div className="review-item-stars-row">
                              {renderStars(rev.rating)}
                              {rev.isVerifiedBooking && (
                                <span className="verified-booking-tag">
                                  <i className="fa-solid fa-circle-check"></i> {lang === 'AR' ? 'حجز مؤكد' : 'Verified Booking'}
                                </span>
                              )}
                            </div>

                            {/* Review Content */}
                            <p className="review-item-text">
                              {rev.comment || (lang === 'AR' ? 'قمت بتقييم هذه التجربة بدون كتابة أي تعليقات.' : 'You rated this experience without typing any comments.')}
                            </p>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </section>

          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
