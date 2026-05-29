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
    <div className={`tw-min-h-screen tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-transition-colors tw-duration-300 ${lang === 'AR' ? 'tw-text-right' : 'tw-text-left'} tw-font-sans`}>
      <Navbar lang={lang} isScrolled={true} />
      
      <main className="tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-pt-32 tw-pb-16">
        {loading ? (
          <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-32 tw-text-slate-400">
            <i className="fa-solid fa-spinner fa-spin tw-text-4xl tw-text-[#dcae44] tw-mb-4"></i>
            <p className="tw-text-lg">{lang === 'AR' ? 'جاري تحميل ملفك الشخصي...' : 'Loading profile...'}</p>
          </div>
        ) : error ? (
          <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-32 tw-text-center">
            <div className="tw-w-20 tw-h-20 tw-bg-rose-500/10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mb-6">
              <i className="fa-solid fa-circle-exclamation tw-text-3xl tw-text-rose-500"></i>
            </div>
            <h2 className="tw-text-2xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-4">
              {lang === 'AR' ? 'يرجى تسجيل الدخول لعرض ملفك الشخصي.' : error}
            </h2>
            <Link to="/login" className="tw-bg-[#dcae44] hover:tw-bg-[#e5c35b] tw-text-black tw-font-bold tw-px-8 tw-py-3 tw-rounded-full tw-transition-all">
              {lang === 'AR' ? 'تسجيل الدخول الآن' : 'Log In Now'}
            </Link>
          </div>
        ) : (
          <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-4 tw-gap-8">
            
            {/* Sidebar */}
            <aside className="tw-col-span-1">
              <div className="tw-bg-white dark:tw-bg-[#15171a] tw-rounded-3xl tw-p-8 tw-shadow-sm tw-border tw-border-slate-200/50 dark:tw-border-slate-800/50 tw-flex tw-flex-col tw-items-center tw-sticky tw-top-32">
                <div className="tw-w-28 tw-h-28 tw-rounded-full tw-bg-gradient-to-br tw-from-[#dcae44] tw-to-[#c39e2a] tw-flex tw-justify-center tw-items-center tw-text-4xl tw-font-bold tw-text-white tw-shadow-lg tw-mb-5">
                  {profile?.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h3 className="tw-text-xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-1">{profile?.firstName} {profile?.lastName}</h3>
                <p className="tw-text-sm tw-text-slate-500 dark:tw-text-slate-400 tw-mb-5 tw-flex tw-items-center tw-gap-2">
                  <i className="fa-regular fa-envelope"></i> {profile?.email}
                </p>
                
                {profile?.role && (
                  <span className="tw-px-4 tw-py-1.5 tw-rounded-full tw-bg-amber-500/10 tw-text-amber-600 dark:tw-text-[#dcae44] tw-text-xs tw-font-bold tw-tracking-wider tw-uppercase tw-mb-6">
                    {profile.role === 'admin'
                      ? (lang === 'AR' ? 'مشرف' : 'ADMIN')
                      : profile.role === 'supervisor'
                      ? (lang === 'AR' ? 'مشرف جولات' : 'SUPERVISOR')
                      : (lang === 'AR' ? 'مسافر' : 'USER')}
                  </span>
                )}

                <div className="tw-w-full tw-h-px tw-bg-slate-200 dark:tw-bg-slate-800 tw-mb-6"></div>
                
                <div className="tw-w-full tw-flex tw-flex-col tw-gap-2">
                  <button 
                    className={`tw-w-full tw-flex tw-items-center tw-text-${lang === 'AR' ? 'right' : 'left'} tw-px-5 tw-py-3.5 tw-rounded-xl tw-font-semibold tw-transition-all ${activeTab === 'info' ? 'tw-bg-[#dcae44] tw-text-black tw-shadow-md' : 'tw-text-slate-600 dark:tw-text-slate-400 hover:tw-bg-slate-100 dark:hover:tw-bg-white/5 hover:tw-text-slate-900 dark:hover:tw-text-white'}`}
                    onClick={() => setActiveTab('info')}
                  >
                    <i className={`fa-solid fa-address-card tw-w-6 ${lang === 'AR' ? 'tw-ml-2' : 'tw-mr-2'}`}></i> 
                    {lang === 'AR' ? 'بياناتي الشخصية' : 'Personal Info'}
                  </button>
                  <button 
                    className={`tw-w-full tw-flex tw-items-center tw-justify-between tw-text-${lang === 'AR' ? 'right' : 'left'} tw-px-5 tw-py-3.5 tw-rounded-xl tw-font-semibold tw-transition-all ${activeTab === 'reviews' ? 'tw-bg-[#dcae44] tw-text-black tw-shadow-md' : 'tw-text-slate-600 dark:tw-text-slate-400 hover:tw-bg-slate-100 dark:hover:tw-bg-white/5 hover:tw-text-slate-900 dark:hover:tw-text-white'}`}
                    onClick={() => { setActiveTab('reviews'); fetchReviews(); }}
                  >
                    <div className="tw-flex tw-items-center">
                      <i className={`fa-solid fa-comment-dots tw-w-6 ${lang === 'AR' ? 'tw-ml-2' : 'tw-mr-2'}`}></i> 
                      {lang === 'AR' ? 'تقييماتي' : 'My Reviews'}
                    </div>
                    <span className={`tw-text-xs tw-px-2 tw-py-1 tw-rounded-full tw-font-bold ${activeTab === 'reviews' ? 'tw-bg-black/20' : 'tw-bg-slate-200 dark:tw-bg-slate-800'}`}>
                      {myReviews.length}
                    </span>
                  </button>
                  {profile?.role === 'admin' && (
                    <Link to="/admin" className="tw-w-full tw-flex tw-items-center tw-text-rose-600 dark:tw-text-rose-400 tw-px-5 tw-py-3.5 tw-rounded-xl tw-font-semibold hover:tw-bg-rose-50 dark:hover:tw-bg-rose-500/10 tw-transition-all">
                      <i className={`fa-solid fa-user-shield tw-w-6 ${lang === 'AR' ? 'tw-ml-2' : 'tw-mr-2'}`}></i> 
                      {lang === 'AR' ? 'لوحة التحكم' : 'Admin Dashboard'}
                    </Link>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <section className="tw-col-span-1 lg:tw-col-span-3 tw-space-y-8">
              
              {/* Tab 1: Personal Info */}
              {activeTab === 'info' && (
                <>
                  {/* Info Card */}
                  <div className="tw-bg-white dark:tw-bg-[#15171a] tw-rounded-3xl tw-p-8 sm:tw-p-10 tw-shadow-sm tw-border tw-border-slate-200/50 dark:tw-border-slate-800/50">
                    <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-mb-8 tw-gap-4">
                      <div>
                        <h2 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-1">{lang === 'AR' ? 'معلومات الحساب' : 'Personal Information'}</h2>
                        <p className="tw-text-slate-500 dark:tw-text-slate-400 tw-text-sm">{lang === 'AR' ? 'إدارة تفاصيل بياناتك الشخصية.' : 'Manage your personal details and account configurations.'}</p>
                      </div>
                      {!isEditing && (
                        <button 
                          className="tw-flex tw-items-center tw-gap-2 tw-text-[#dcae44] tw-font-semibold hover:tw-text-[#c39e2a] tw-transition-colors tw-bg-[#dcae44]/10 tw-px-4 tw-py-2 tw-rounded-full"
                          onClick={() => setIsEditing(true)}
                        >
                          <i className="fa-solid fa-pen tw-text-sm"></i> {lang === 'AR' ? 'تعديل' : 'Edit Profile'}
                        </button>
                      )}
                    </div>

                    {editSuccess && (
                      <div className="tw-w-full tw-bg-emerald-500/10 tw-border tw-border-emerald-500/20 tw-text-emerald-500 tw-px-4 tw-py-3 tw-rounded-xl tw-mb-8 tw-flex tw-items-center tw-gap-3">
                        <i className="fa-solid fa-circle-check"></i> {editSuccess}
                      </div>
                    )}
                    {editError && (
                      <div className="tw-w-full tw-bg-rose-500/10 tw-border tw-border-rose-500/20 tw-text-rose-500 tw-px-4 tw-py-3 tw-rounded-xl tw-mb-8 tw-flex tw-items-center tw-gap-3">
                        <i className="fa-solid fa-triangle-exclamation"></i> {editError}
                      </div>
                    )}

                    {isEditing ? (
                      <form onSubmit={handleUpdateProfile}>
                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                          <div className="tw-flex tw-flex-col">
                            <label className="tw-text-[11px] tw-font-bold tw-text-slate-500 dark:tw-text-slate-400 tw-tracking-widest tw-uppercase tw-mb-2">{lang === 'AR' ? 'الاسم الأول' : 'First Name'}</label>
                            <input
                              type="text"
                              value={editForm.firstName}
                              onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                              required
                              className="tw-w-full tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl tw-px-4 tw-py-3 tw-text-slate-900 dark:tw-text-white focus:tw-outline-none focus:tw-border-[#dcae44] focus:tw-ring-1 focus:tw-ring-[#dcae44] tw-transition-all"
                            />
                          </div>
                          <div className="tw-flex tw-flex-col">
                            <label className="tw-text-[11px] tw-font-bold tw-text-slate-500 dark:tw-text-slate-400 tw-tracking-widest tw-uppercase tw-mb-2">{lang === 'AR' ? 'الاسم الأخير' : 'Last Name'}</label>
                            <input
                              type="text"
                              value={editForm.lastName}
                              onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                              required
                              className="tw-w-full tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl tw-px-4 tw-py-3 tw-text-slate-900 dark:tw-text-white focus:tw-outline-none focus:tw-border-[#dcae44] focus:tw-ring-1 focus:tw-ring-[#dcae44] tw-transition-all"
                            />
                          </div>
                          <div className="tw-flex tw-flex-col">
                            <label className="tw-text-[11px] tw-font-bold tw-text-slate-500 dark:tw-text-slate-400 tw-tracking-widest tw-uppercase tw-mb-2">{lang === 'AR' ? 'البريد الإلكتروني (ثابت)' : 'Email (Cannot change)'}</label>
                            <div className="tw-w-full tw-bg-slate-100 dark:tw-bg-[#0a0b0d]/50 tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl tw-px-4 tw-py-3 tw-text-slate-500 dark:tw-text-slate-500 tw-cursor-not-allowed">
                              {profile?.email || '—'}
                            </div>
                          </div>
                          <div className="tw-flex tw-flex-col">
                            <label className="tw-text-[11px] tw-font-bold tw-text-slate-500 dark:tw-text-slate-400 tw-tracking-widest tw-uppercase tw-mb-2">{lang === 'AR' ? 'رقم الهاتف' : 'Phone Number'}</label>
                            <input
                              type="text"
                              value={editForm.phoneNumber}
                              onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                              className="tw-w-full tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl tw-px-4 tw-py-3 tw-text-slate-900 dark:tw-text-white focus:tw-outline-none focus:tw-border-[#dcae44] focus:tw-ring-1 focus:tw-ring-[#dcae44] tw-transition-all"
                            />
                          </div>
                          <div className="tw-flex tw-flex-col">
                            <label className="tw-text-[11px] tw-font-bold tw-text-slate-500 dark:tw-text-slate-400 tw-tracking-widest tw-uppercase tw-mb-2">{lang === 'AR' ? 'الجنس' : 'Gender'}</label>
                            <select
                              value={editForm.gender}
                              onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                              className="tw-w-full tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl tw-px-4 tw-py-3 tw-text-slate-900 dark:tw-text-white focus:tw-outline-none focus:tw-border-[#dcae44] focus:tw-ring-1 focus:tw-ring-[#dcae44] tw-transition-all tw-appearance-none"
                            >
                              <option value="">{lang === 'AR' ? 'اختر الجنس' : 'Select Gender'}</option>
                              <option value="male">{lang === 'AR' ? 'ذكر' : 'Male'}</option>
                              <option value="female">{lang === 'AR' ? 'أنثى' : 'Female'}</option>
                            </select>
                          </div>
                          <div className="tw-flex tw-flex-col">
                            <label className="tw-text-[11px] tw-font-bold tw-text-slate-500 dark:tw-text-slate-400 tw-tracking-widest tw-uppercase tw-mb-2">{lang === 'AR' ? 'الجنسية' : 'Nationality'}</label>
                            <input
                              type="text"
                              value={editForm.nationality}
                              onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                              className="tw-w-full tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl tw-px-4 tw-py-3 tw-text-slate-900 dark:tw-text-white focus:tw-outline-none focus:tw-border-[#dcae44] focus:tw-ring-1 focus:tw-ring-[#dcae44] tw-transition-all"
                            />
                          </div>
                        </div>
                        <div className="tw-flex tw-gap-4 tw-mt-8">
                          <button type="submit" disabled={editLoading} className="tw-bg-[#dcae44] hover:tw-bg-[#e5c35b] tw-text-black tw-font-bold tw-px-8 tw-py-3 tw-rounded-xl tw-transition-all disabled:tw-opacity-50">
                            {editLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري الحفظ...' : 'Saving...'}</> : (lang === 'AR' ? 'حفظ التعديلات' : 'Save Changes')}
                          </button>
                          <button type="button" onClick={() => { setIsEditing(false); setEditError(''); setEditSuccess(''); }} className="tw-bg-slate-200 dark:tw-bg-slate-800 hover:tw-bg-slate-300 dark:hover:tw-bg-slate-700 tw-text-slate-700 dark:tw-text-slate-300 tw-font-bold tw-px-8 tw-py-3 tw-rounded-xl tw-transition-all">
                            {lang === 'AR' ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8">
                        <div>
                          <p className="tw-text-xs tw-font-bold tw-text-slate-400 dark:tw-text-slate-500 tw-tracking-widest tw-uppercase tw-mb-1">{lang === 'AR' ? 'الاسم الأول' : 'First Name'}</p>
                          <p className="tw-text-base tw-font-semibold tw-text-slate-900 dark:tw-text-white">{profile?.firstName || '—'}</p>
                        </div>
                        <div>
                          <p className="tw-text-xs tw-font-bold tw-text-slate-400 dark:tw-text-slate-500 tw-tracking-widest tw-uppercase tw-mb-1">{lang === 'AR' ? 'الاسم الأخير' : 'Last Name'}</p>
                          <p className="tw-text-base tw-font-semibold tw-text-slate-900 dark:tw-text-white">{profile?.lastName || '—'}</p>
                        </div>
                        <div>
                          <p className="tw-text-xs tw-font-bold tw-text-slate-400 dark:tw-text-slate-500 tw-tracking-widest tw-uppercase tw-mb-1">{lang === 'AR' ? 'البريد الإلكتروني' : 'Email Address'}</p>
                          <p className="tw-text-base tw-font-semibold tw-text-slate-900 dark:tw-text-white">{profile?.email || '—'}</p>
                        </div>
                        <div>
                          <p className="tw-text-xs tw-font-bold tw-text-slate-400 dark:tw-text-slate-500 tw-tracking-widest tw-uppercase tw-mb-1">{lang === 'AR' ? 'رقم الهاتف' : 'Phone Number'}</p>
                          <p className="tw-text-base tw-font-semibold tw-text-slate-900 dark:tw-text-white">{profile?.phoneNumber || '—'}</p>
                        </div>
                        <div>
                          <p className="tw-text-xs tw-font-bold tw-text-slate-400 dark:tw-text-slate-500 tw-tracking-widest tw-uppercase tw-mb-1">{lang === 'AR' ? 'الجنس' : 'Gender'}</p>
                          <p className="tw-text-base tw-font-semibold tw-text-slate-900 dark:tw-text-white">
                            {profile?.gender === 'male' ? (lang === 'AR' ? 'ذكر' : 'Male') : profile?.gender === 'female' ? (lang === 'AR' ? 'أنثى' : 'Female') : (profile?.gender || '—')}
                          </p>
                        </div>
                        <div>
                          <p className="tw-text-xs tw-font-bold tw-text-slate-400 dark:tw-text-slate-500 tw-tracking-widest tw-uppercase tw-mb-1">{lang === 'AR' ? 'الجنسية' : 'Nationality'}</p>
                          <p className="tw-text-base tw-font-semibold tw-text-slate-900 dark:tw-text-white">{profile?.nationality || '—'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Password Card */}
                  <div className="tw-bg-white dark:tw-bg-[#15171a] tw-rounded-3xl tw-p-8 sm:tw-p-10 tw-shadow-sm tw-border tw-border-slate-200/50 dark:tw-border-slate-800/50">
                    <div className="tw-mb-8">
                      <h2 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-1">{lang === 'AR' ? 'الأمان وكلمة المرور' : 'Security & Password'}</h2>
                      <p className="tw-text-slate-500 dark:tw-text-slate-400 tw-text-sm">{lang === 'AR' ? 'حافظ على أمان حسابك عن طريق تغيير كلمة المرور بشكل دوري.' : 'Keep your account secure by changing your password periodically.'}</p>
                    </div>

                    {passwordSuccess && (
                      <div className="tw-w-full tw-bg-emerald-500/10 tw-border tw-border-emerald-500/20 tw-text-emerald-500 tw-px-4 tw-py-3 tw-rounded-xl tw-mb-8 tw-flex tw-items-center tw-gap-3">
                        <i className="fa-solid fa-circle-check"></i> {passwordSuccess}
                      </div>
                    )}
                    {passwordError && (
                      <div className="tw-w-full tw-bg-rose-500/10 tw-border tw-border-rose-500/20 tw-text-rose-500 tw-px-4 tw-py-3 tw-rounded-xl tw-mb-8 tw-flex tw-items-center tw-gap-3">
                        <i className="fa-solid fa-triangle-exclamation"></i> {passwordError}
                      </div>
                    )}

                    <form onSubmit={handleChangePassword}>
                      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6">
                        <div className="tw-flex tw-flex-col">
                          <label className="tw-text-[11px] tw-font-bold tw-text-slate-500 dark:tw-text-slate-400 tw-tracking-widest tw-uppercase tw-mb-2">{lang === 'AR' ? 'كلمة المرور الحالية' : 'Current Password'}</label>
                          <input
                            type="password"
                            value={passwordForm.oldPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                            required
                            className="tw-w-full tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl tw-px-4 tw-py-3 tw-text-slate-900 dark:tw-text-white focus:tw-outline-none focus:tw-border-[#dcae44] focus:tw-ring-1 focus:tw-ring-[#dcae44] tw-transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="tw-flex tw-flex-col">
                          <label className="tw-text-[11px] tw-font-bold tw-text-slate-500 dark:tw-text-slate-400 tw-tracking-widest tw-uppercase tw-mb-2">{lang === 'AR' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            required
                            className="tw-w-full tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl tw-px-4 tw-py-3 tw-text-slate-900 dark:tw-text-white focus:tw-outline-none focus:tw-border-[#dcae44] focus:tw-ring-1 focus:tw-ring-[#dcae44] tw-transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="tw-flex tw-flex-col">
                          <label className="tw-text-[11px] tw-font-bold tw-text-slate-500 dark:tw-text-slate-400 tw-tracking-widest tw-uppercase tw-mb-2">{lang === 'AR' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            required
                            className="tw-w-full tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl tw-px-4 tw-py-3 tw-text-slate-900 dark:tw-text-white focus:tw-outline-none focus:tw-border-[#dcae44] focus:tw-ring-1 focus:tw-ring-[#dcae44] tw-transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <div className="tw-mt-8">
                        <button type="submit" disabled={passwordLoading} className="tw-bg-slate-900 dark:tw-bg-white hover:tw-bg-slate-800 dark:hover:tw-bg-slate-200 tw-text-white dark:tw-text-slate-900 tw-font-bold tw-px-8 tw-py-3 tw-rounded-xl tw-transition-all disabled:tw-opacity-50">
                          {passwordLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري التحديث...' : 'Updating...'}</> : (lang === 'AR' ? 'تحديث كلمة المرور' : 'Update Password')}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}

              {/* Tab 2: Reviews Management */}
              {activeTab === 'reviews' && (
                <div className="tw-bg-white dark:tw-bg-[#15171a] tw-rounded-3xl tw-p-8 sm:tw-p-10 tw-shadow-sm tw-border tw-border-slate-200/50 dark:tw-border-slate-800/50">
                  <div className="tw-mb-8">
                    <h2 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-1">{lang === 'AR' ? 'تقييماتي المنشورة' : 'My Submitted Reviews'}</h2>
                    <p className="tw-text-slate-500 dark:tw-text-slate-400 tw-text-sm">{lang === 'AR' ? 'جميع الآراء، التعليقات والتقييمات التي قمت بمشاركتها مع بقية المسافرين.' : 'All opinions, feedback, and reviews you have posted on packages.'}</p>
                  </div>

                  {loadingReviews ? (
                    <div className="tw-flex tw-justify-center tw-py-12 tw-text-slate-400">
                      <i className="fa-solid fa-spinner fa-spin tw-text-2xl tw-mr-2"></i> {lang === 'AR' ? 'جاري جلب تقييماتك...' : 'Fetching your reviews...'}
                    </div>
                  ) : myReviews.length === 0 ? (
                    <div className="tw-text-center tw-py-16">
                      <div className="tw-w-24 tw-h-24 tw-bg-[#dcae44]/10 tw-text-[#dcae44] tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-6 tw-text-4xl">
                        <i className="fa-regular fa-message"></i>
                      </div>
                      <h4 className="tw-text-xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-2">{lang === 'AR' ? 'لم تقم بكتابة أي تقييم بعد' : 'No reviews submitted yet'}</h4>
                      <p className="tw-text-slate-500 dark:tw-text-slate-400 tw-max-w-md tw-mx-auto tw-mb-8">{lang === 'AR' ? 'أنت لم تقم بتقييم أي رحلات أو باقات سياحية حتى الآن. احجز رحلة وأخبرنا برأيك!' : 'You haven\'t reviewed any trips or packages. Book a journey and tell us what you think!'}</p>
                      <Link to="/experiences" className="tw-bg-[#dcae44] hover:tw-bg-[#e5c35b] tw-text-black tw-font-bold tw-px-8 tw-py-3 tw-rounded-full tw-transition-all">
                        {lang === 'AR' ? 'استكشف الباقات' : 'Explore Packages'}
                      </Link>
                    </div>
                  ) : (
                    <div className="tw-flex tw-flex-col tw-gap-6">
                      {myReviews.map((rev) => {
                        const packageTitle = rev.experience?.name || (lang === 'AR' ? 'رحلة سياحية مثيرة في مصر' : 'Exciting Egypt Trip');
                        const pkgId = rev.experience?._id || rev.experience;
                        const reviewDate = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        }) : 'Recent';

                        return (
                          <div key={rev._id} className="tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-2xl tw-p-6">
                            
                            <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-mb-4 tw-gap-4">
                              <div>
                                <h4 className="tw-text-lg tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-1">
                                  {pkgId ? (
                                    <Link to={`/package-details/${pkgId}`} className="hover:tw-text-[#dcae44] tw-transition-colors">
                                      {packageTitle}
                                    </Link>
                                  ) : packageTitle}
                                </h4>
                                <span className="tw-text-xs tw-text-slate-500 dark:tw-text-slate-400">{reviewDate}</span>
                              </div>
                              <button 
                                className="tw-flex tw-items-center tw-gap-2 tw-text-rose-500 hover:tw-bg-rose-500/10 tw-px-3 tw-py-1.5 tw-rounded-lg tw-transition-colors tw-text-sm tw-font-semibold"
                                onClick={() => handleDeleteReview(rev._id)}
                              >
                                <i className="fa-solid fa-trash-can"></i> {lang === 'AR' ? 'حذف' : 'Delete'}
                              </button>
                            </div>

                            <div className="tw-flex tw-items-center tw-gap-4 tw-mb-4">
                              <div className="tw-flex tw-text-[#dcae44] tw-text-sm">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <i key={i} className={`${i < rev.rating ? 'fa-solid' : 'fa-regular'} fa-star tw-mr-1`}></i>
                                ))}
                              </div>
                              {rev.isVerifiedBooking && (
                                <span className="tw-text-xs tw-font-bold tw-bg-emerald-500/10 tw-text-emerald-500 tw-px-2 tw-py-1 tw-rounded-md tw-flex tw-items-center tw-gap-1">
                                  <i className="fa-solid fa-circle-check"></i> {lang === 'AR' ? 'حجز مؤكد' : 'Verified Booking'}
                                </span>
                              )}
                            </div>

                            <p className="tw-text-slate-700 dark:tw-text-slate-300 tw-leading-relaxed">
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
