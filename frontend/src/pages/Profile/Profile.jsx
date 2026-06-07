import React, { useState, useEffect, useContext } from 'react';
import { toast } from '../../utils/toast';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  getUserProfile, getMyReviews, deleteReview, updateReview,
  updateProfile, changePassword, deleteAccount,
  getUserBookings
} from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './Profile.css';

const Profile = () => {
  const { lang } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tabs: 'info' | 'reviews' | 'bookings'
  const [activeTab, setActiveTab] = useState('info');
  const [myReviews, setMyReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Edit Review state
  const [editingReview, setEditingReview] = useState(null); // { id, rating, comment }

  const location = useLocation();
  const token = useSelector((state) => state.auth?.token) || localStorage.getItem('token') || localStorage.getItem('clearpath_access_token');

  // Edit Profile Form States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phoneNumber: '', gender: '', nationality: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Change Password Form States
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Delete Account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const reviewsRes = await getMyReviews();
      const reviewsList = reviewsRes.reviews || reviewsRes.data?.reviews || reviewsRes.data || reviewsRes || [];
      setMyReviews(reviewsList);
    } catch (err) { console.error('Failed to load reviews', err); }
    finally { setLoadingReviews(false); }
  };

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await getUserBookings();
      const list = res.bookings || res.data?.bookings || res.data || res || [];
      setMyBookings(Array.isArray(list) ? list : []);
    } catch (err) { console.error('Failed to load bookings', err); }
    finally { setLoadingBookings(false); }
  };

  useEffect(() => {
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
    if (tabParam === 'reviews') { setTimeout(() => setActiveTab('reviews'), 0); fetchReviews(); }
    else if (tabParam === 'bookings') { setTimeout(() => setActiveTab('bookings'), 0); fetchBookings(); }
    else if (tabParam === 'info') { setTimeout(() => setActiveTab('info'), 0); }
  }, [location.search]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) { setError('Please log in to view your profile.'); setLoading(false); return; }
      try {
        const response = await getUserProfile();
        setProfile(response.user || response.data?.user || response.data || response);
        const reviewsRes = await getMyReviews();
        const reviewsList = reviewsRes.reviews || reviewsRes.data?.reviews || reviewsRes.data || reviewsRes || [];
        setMyReviews(reviewsList);
      } catch (err) { setError('Failed to load profile.'); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [token]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm(lang === 'AR' ? 'هل أنت متأكد من حذف هذا التقييم؟' : 'Delete this review? This cannot be undone.')) return;
    try {
      await deleteReview(reviewId);
      setMyReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (err) { toast(err.message || 'Failed to delete review'); }
  };

  const handleEditReview = async () => {
    if (!editingReview) return;
    try {
      await updateReview(editingReview.id, { rating: editingReview.rating, comment: editingReview.comment });
      setMyReviews(prev => prev.map(r => r._id === editingReview.id ? { ...r, rating: editingReview.rating, comment: editingReview.comment } : r));
      setEditingReview(null);
    } catch (err) { toast(err.message || 'Failed to update review'); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true); setEditError(''); setEditSuccess('');
    try {
      const response = await updateProfile(editForm);
      const updatedUser = response.user || response.data?.user || response.data || response;
      setProfile(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditSuccess(lang === 'AR' ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profile updated successfully!');
      setIsEditing(false);
    } catch (err) { setEditError(lang === 'AR' ? 'فشل تحديث الملف الشخصي.' : (err.message || 'Failed to update profile.')); }
    finally { setEditLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(lang === 'AR' ? 'كلمات المرور الجديدة غير متطابقة.' : 'New passwords do not match.'); return;
    }
    setPasswordLoading(true); setPasswordError(''); setPasswordSuccess('');
    try {
      await changePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword });
      setPasswordSuccess(lang === 'AR' ? 'تم تغيير كلمة المرور بنجاح!' : 'Password changed successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { setPasswordError(lang === 'AR' ? 'فشل تغيير كلمة المرور.' : (err.message || 'Failed to change password.')); }
    finally { setPasswordLoading(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount();
      localStorage.clear();
      navigate('/');
    } catch (err) { toast(err.message || 'Failed to delete account. Please try again.'); }
    finally { setDeleteLoading(false); setShowDeleteConfirm(false); }
  };

  const statusColors = { Confirmed: '#10b981', Pending: '#f59e0b', Cancelled: '#ef4444', completed: '#3b82f6' };

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
            <h2 className="tw-text-2xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-4">{lang === 'AR' ? 'يرجى تسجيل الدخول لعرض ملفك الشخصي.' : error}</h2>
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
                    {profile.role === 'admin' ? (lang === 'AR' ? 'مشرف' : 'ADMIN') : profile.role === 'supervisor' ? (lang === 'AR' ? 'مشرف جولات' : 'SUPERVISOR') : (lang === 'AR' ? 'مسافر' : 'USER')}
                  </span>
                )}

                <div className="tw-w-full tw-h-px tw-bg-slate-200 dark:tw-bg-slate-800 tw-mb-6"></div>
                
                <div className="tw-w-full tw-flex tw-flex-col tw-gap-2">
                  {[
                    { key: 'info', icon: 'fa-address-card', labelAR: 'بياناتي الشخصية', labelEN: 'Personal Info' },
                    { key: 'reviews', icon: 'fa-comment-dots', labelAR: 'تقييماتي', labelEN: 'My Reviews', badge: myReviews.length },
                    { key: 'bookings', icon: 'fa-calendar-check', labelAR: 'سجل الحجوزات', labelEN: 'Booking History' },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      className={`tw-w-full tw-flex tw-items-center tw-justify-between tw-text-${lang === 'AR' ? 'right' : 'left'} tw-px-5 tw-py-3.5 tw-rounded-xl tw-font-semibold tw-transition-all ${activeTab === tab.key ? 'tw-bg-[#dcae44] tw-text-black tw-shadow-md' : 'tw-text-slate-600 dark:tw-text-slate-400 hover:tw-bg-slate-100 dark:hover:tw-bg-white/5 hover:tw-text-slate-900 dark:hover:tw-text-white'}`}
                      onClick={() => {
                        setActiveTab(tab.key);
                        if (tab.key === 'reviews') fetchReviews();
                        if (tab.key === 'bookings') fetchBookings();
                      }}
                    >
                      <div className="tw-flex tw-items-center">
                        <i className={`fa-solid ${tab.icon} tw-w-6 ${lang === 'AR' ? 'tw-ml-2' : 'tw-mr-2'}`}></i>
                        {lang === 'AR' ? tab.labelAR : tab.labelEN}
                      </div>
                      {tab.badge !== undefined && (
                        <span className={`tw-text-xs tw-px-2 tw-py-1 tw-rounded-full tw-font-bold ${activeTab === tab.key ? 'tw-bg-black/20' : 'tw-bg-slate-200 dark:tw-bg-slate-800'}`}>{tab.badge}</span>
                      )}
                    </button>
                  ))}
                  {(profile?.role === 'admin' || profile?.role === 'supervisor' || profile?.role === 'provider') && (
                    <Link to={profile.role === 'admin' ? "/admin" : "/supervisor"} className="tw-w-full tw-flex tw-items-center tw-text-rose-600 dark:tw-text-rose-400 tw-px-5 tw-py-3.5 tw-rounded-xl tw-font-semibold hover:tw-bg-rose-50 dark:hover:tw-bg-rose-500/10 tw-transition-all">
                      <i className={`fa-solid fa-user-shield tw-w-6 ${lang === 'AR' ? 'tw-ml-2' : 'tw-mr-2'}`}></i>
                      {lang === 'AR' ? 'لوحة التحكم' : (profile.role === 'admin' ? 'Admin Dashboard' : 'Supervisor Dashboard')}
                    </Link>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <section className="tw-col-span-1 lg:tw-col-span-3 tw-space-y-8">
              
              {/* ───── TAB: Personal Info ───── */}
              {activeTab === 'info' && (
                <>
                  <div className="tw-bg-white dark:tw-bg-[#15171a] tw-rounded-3xl tw-p-8 sm:tw-p-10 tw-shadow-sm tw-border tw-border-slate-200/50 dark:tw-border-slate-800/50">
                    <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-mb-8 tw-gap-4">
                      <div>
                        <h2 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-1">{lang === 'AR' ? 'معلومات الحساب' : 'Personal Information'}</h2>
                        <p className="tw-text-slate-500 dark:tw-text-slate-400 tw-text-sm">{lang === 'AR' ? 'إدارة تفاصيل بياناتك الشخصية.' : 'Manage your personal details and account configurations.'}</p>
                      </div>
                      {!isEditing && (
                        <button className="tw-flex tw-items-center tw-gap-2 tw-text-[#dcae44] tw-font-semibold hover:tw-text-[#c39e2a] tw-transition-colors tw-bg-[#dcae44]/10 tw-px-4 tw-py-2 tw-rounded-full" onClick={() => setIsEditing(true)}>
                          <i className="fa-solid fa-pen tw-text-sm"></i> {lang === 'AR' ? 'تعديل' : 'Edit Profile'}
                        </button>
                      )}
                    </div>

                    {editSuccess && <div className="tw-w-full tw-bg-emerald-500/10 tw-border tw-border-emerald-500/20 tw-text-emerald-500 tw-px-4 tw-py-3 tw-rounded-xl tw-mb-8 tw-flex tw-items-center tw-gap-3"><i className="fa-solid fa-circle-check"></i> {editSuccess}</div>}
                    {editError && <div className="tw-w-full tw-bg-rose-500/10 tw-border tw-border-rose-500/20 tw-text-rose-500 tw-px-4 tw-py-3 tw-rounded-xl tw-mb-8 tw-flex tw-items-center tw-gap-3"><i className="fa-solid fa-triangle-exclamation"></i> {editError}</div>}

                    {isEditing ? (
                      <form onSubmit={handleUpdateProfile}>
                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                          {[
                            { key: 'firstName', labelAR: 'الاسم الأول', labelEN: 'First Name', type: 'text', required: true },
                            { key: 'lastName', labelAR: 'الاسم الأخير', labelEN: 'Last Name', type: 'text', required: true },
                            { key: 'phoneNumber', labelAR: 'رقم الهاتف', labelEN: 'Phone Number', type: 'text', required: false },
                            { key: 'nationality', labelAR: 'الجنسية', labelEN: 'Nationality', type: 'text', required: false },
                          ].map(field => (
                            <div key={field.key} className="tw-flex tw-flex-col">
                              <label className="tw-text-[11px] tw-font-bold tw-text-slate-500 dark:tw-text-slate-400 tw-tracking-widest tw-uppercase tw-mb-2">{lang === 'AR' ? field.labelAR : field.labelEN}</label>
                              <input type={field.type} value={editForm[field.key]} onChange={e => setEditForm({ ...editForm, [field.key]: e.target.value })} required={field.required} className="tw-w-full tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl tw-px-4 tw-py-3 tw-text-slate-900 dark:tw-text-white focus:tw-outline-none focus:tw-border-[#dcae44] focus:tw-ring-1 focus:tw-ring-[#dcae44] tw-transition-all" />
                            </div>
                          ))}
                          <div className="tw-flex tw-flex-col">
                            <label className="tw-text-[11px] tw-font-bold tw-text-slate-500 dark:tw-text-slate-400 tw-tracking-widest tw-uppercase tw-mb-2">{lang === 'AR' ? 'الجنس' : 'Gender'}</label>
                            <select value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })} className="tw-w-full tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl tw-px-4 tw-py-3 tw-text-slate-900 dark:tw-text-white focus:tw-outline-none focus:tw-border-[#dcae44] focus:tw-ring-1 focus:tw-ring-[#dcae44] tw-transition-all tw-appearance-none">
                              <option value="">{lang === 'AR' ? 'اختر الجنس' : 'Select Gender'}</option>
                              <option value="male">{lang === 'AR' ? 'ذكر' : 'Male'}</option>
                              <option value="female">{lang === 'AR' ? 'أنثى' : 'Female'}</option>
                            </select>
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
                        {[
                          { label: lang === 'AR' ? 'الاسم الأول' : 'First Name', value: profile?.firstName },
                          { label: lang === 'AR' ? 'الاسم الأخير' : 'Last Name', value: profile?.lastName },
                          { label: lang === 'AR' ? 'البريد الإلكتروني' : 'Email Address', value: profile?.email },
                          { label: lang === 'AR' ? 'رقم الهاتف' : 'Phone Number', value: profile?.phoneNumber },
                          { label: lang === 'AR' ? 'الجنس' : 'Gender', value: profile?.gender === 'male' ? (lang === 'AR' ? 'ذكر' : 'Male') : profile?.gender === 'female' ? (lang === 'AR' ? 'أنثى' : 'Female') : profile?.gender },
                          { label: lang === 'AR' ? 'الجنسية' : 'Nationality', value: profile?.nationality },
                        ].map((f, i) => (
                          <div key={i}>
                            <p className="tw-text-xs tw-font-bold tw-text-slate-400 dark:tw-text-slate-500 tw-tracking-widest tw-uppercase tw-mb-1">{f.label}</p>
                            <p className="tw-text-base tw-font-semibold tw-text-slate-900 dark:tw-text-white">{f.value || '—'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Password Card */}
                  <div className="tw-bg-white dark:tw-bg-[#15171a] tw-rounded-3xl tw-p-8 sm:tw-p-10 tw-shadow-sm tw-border tw-border-slate-200/50 dark:tw-border-slate-800/50">
                    <div className="tw-mb-8">
                      <h2 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-1">{lang === 'AR' ? 'الأمان وكلمة المرور' : 'Security & Password'}</h2>
                      <p className="tw-text-slate-500 dark:tw-text-slate-400 tw-text-sm">{lang === 'AR' ? 'حافظ على أمان حسابك عن طريق تغيير كلمة المرور.' : 'Keep your account secure by changing your password periodically.'}</p>
                    </div>
                    {passwordSuccess && <div className="tw-w-full tw-bg-emerald-500/10 tw-border tw-border-emerald-500/20 tw-text-emerald-500 tw-px-4 tw-py-3 tw-rounded-xl tw-mb-8 tw-flex tw-items-center tw-gap-3"><i className="fa-solid fa-circle-check"></i> {passwordSuccess}</div>}
                    {passwordError && <div className="tw-w-full tw-bg-rose-500/10 tw-border tw-border-rose-500/20 tw-text-rose-500 tw-px-4 tw-py-3 tw-rounded-xl tw-mb-8 tw-flex tw-items-center tw-gap-3"><i className="fa-solid fa-triangle-exclamation"></i> {passwordError}</div>}
                    <form onSubmit={handleChangePassword}>
                      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6">
                        {[
                          { key: 'oldPassword', labelAR: 'كلمة المرور الحالية', labelEN: 'Current Password' },
                          { key: 'newPassword', labelAR: 'كلمة المرور الجديدة', labelEN: 'New Password' },
                          { key: 'confirmPassword', labelAR: 'تأكيد كلمة المرور', labelEN: 'Confirm Password' },
                        ].map(f => (
                          <div key={f.key} className="tw-flex tw-flex-col">
                            <label className="tw-text-[11px] tw-font-bold tw-text-slate-500 dark:tw-text-slate-400 tw-tracking-widest tw-uppercase tw-mb-2">{lang === 'AR' ? f.labelAR : f.labelEN}</label>
                            <input type="password" value={passwordForm[f.key]} onChange={e => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })} required className="tw-w-full tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl tw-px-4 tw-py-3 tw-text-slate-900 dark:tw-text-white focus:tw-outline-none focus:tw-border-[#dcae44] tw-transition-all" placeholder="••••••••" />
                          </div>
                        ))}
                      </div>
                      <div className="tw-mt-8">
                        <button type="submit" disabled={passwordLoading} className="tw-bg-slate-900 dark:tw-bg-white hover:tw-bg-slate-800 dark:hover:tw-bg-slate-200 tw-text-white dark:tw-text-slate-900 tw-font-bold tw-px-8 tw-py-3 tw-rounded-xl tw-transition-all disabled:tw-opacity-50">
                          {passwordLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري التحديث...' : 'Updating...'}</> : (lang === 'AR' ? 'تحديث كلمة المرور' : 'Update Password')}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Danger Zone - Admin only */}
                  {profile?.role === 'admin' && <div className="tw-bg-rose-50 dark:tw-bg-rose-950/20 tw-rounded-3xl tw-p-8 tw-border tw-border-rose-200 dark:tw-border-rose-900/50">
                    <h2 className="tw-text-xl tw-font-bold tw-text-rose-600 dark:tw-text-rose-400 tw-mb-2 tw-flex tw-items-center tw-gap-2">
                      <i className="fa-solid fa-triangle-exclamation"></i> {lang === 'AR' ? 'منطقة الخطر' : 'Danger Zone'}
                    </h2>
                    <p className="tw-text-rose-600/70 dark:tw-text-rose-400/70 tw-text-sm tw-mb-5">{lang === 'AR' ? 'حذف حسابك نهائياً سيؤدي إلى فقدان كل بياناتك ولا يمكن التراجع عنه.' : 'Permanently deleting your account will erase all your data and cannot be undone.'}</p>
                    {!showDeleteConfirm ? (
                      <button onClick={() => setShowDeleteConfirm(true)} className="tw-bg-rose-600 hover:tw-bg-rose-700 tw-text-white tw-font-bold tw-px-6 tw-py-2.5 tw-rounded-xl tw-transition-all tw-flex tw-items-center tw-gap-2">
                        <i className="fa-solid fa-trash-can"></i> {lang === 'AR' ? 'حذف الحساب' : 'Delete My Account'}
                      </button>
                    ) : (
                      <div className="tw-flex tw-flex-col tw-gap-4">
                        <p className="tw-font-bold tw-text-rose-600 dark:tw-text-rose-400">{lang === 'AR' ? 'هل أنت متأكد تماماً؟ هذا الإجراء لا يمكن التراجع عنه!' : 'Are you absolutely sure? This action is IRREVERSIBLE!'}</p>
                        <div className="tw-flex tw-gap-3">
                          <button onClick={handleDeleteAccount} disabled={deleteLoading} className="tw-bg-rose-600 hover:tw-bg-rose-700 tw-text-white tw-font-bold tw-px-6 tw-py-2.5 tw-rounded-xl tw-transition-all disabled:tw-opacity-50">
                            {deleteLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري الحذف...' : 'Deleting...'}</> : (lang === 'AR' ? 'نعم، احذف حسابي' : 'Yes, Delete My Account')}
                          </button>
                          <button onClick={() => setShowDeleteConfirm(false)} className="tw-bg-slate-200 dark:tw-bg-slate-800 tw-text-slate-700 dark:tw-text-slate-300 tw-font-bold tw-px-6 tw-py-2.5 tw-rounded-xl tw-transition-all">
                            {lang === 'AR' ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>}
                </>
              )}

              {/* ───── TAB: Reviews ───── */}
              {activeTab === 'reviews' && (
                <div className="tw-bg-white dark:tw-bg-[#15171a] tw-rounded-3xl tw-p-8 sm:tw-p-10 tw-shadow-sm tw-border tw-border-slate-200/50 dark:tw-border-slate-800/50">
                  <h2 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-1">{lang === 'AR' ? 'تقييماتي المنشورة' : 'My Submitted Reviews'}</h2>
                  <p className="tw-text-slate-500 dark:tw-text-slate-400 tw-text-sm tw-mb-8">{lang === 'AR' ? 'جميع تقييماتك يمكنك تعديلها أو حذفها.' : 'All your reviews. You can edit or delete them.'}</p>

                  {loadingReviews ? (
                    <div className="tw-flex tw-justify-center tw-py-12 tw-text-slate-400"><i className="fa-solid fa-spinner fa-spin tw-text-2xl tw-mr-2"></i> {lang === 'AR' ? 'جاري جلب التقييمات...' : 'Loading reviews...'}</div>
                  ) : myReviews.length === 0 ? (
                    <div className="tw-text-center tw-py-16">
                      <div className="tw-w-24 tw-h-24 tw-bg-[#dcae44]/10 tw-text-[#dcae44] tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-6 tw-text-4xl"><i className="fa-regular fa-message"></i></div>
                      <h4 className="tw-text-xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-2">{lang === 'AR' ? 'لم تقم بكتابة أي تقييم بعد' : 'No reviews submitted yet'}</h4>
                      <Link to="/experiences" className="tw-bg-[#dcae44] hover:tw-bg-[#e5c35b] tw-text-black tw-font-bold tw-px-8 tw-py-3 tw-rounded-full tw-transition-all">{lang === 'AR' ? 'استكشف الباقات' : 'Explore Packages'}</Link>
                    </div>
                  ) : (
                    <div className="tw-flex tw-flex-col tw-gap-6">
                      {myReviews.map((rev) => {
                        const pkgId = rev.experience?._id || rev.experience;
                        const isEditing = editingReview?.id === rev._id;
                        return (
                          <div key={rev._id} className="tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-2xl tw-p-6">
                            <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-mb-4 tw-gap-4">
                              <h4 className="tw-text-lg tw-font-bold tw-text-slate-900 dark:tw-text-white">
                                {pkgId ? <Link to={`/package-details/${pkgId}`} className="hover:tw-text-[#dcae44] tw-transition-colors">{rev.experience?.name || 'Package'}</Link> : (rev.experience?.name || 'Package')}
                              </h4>
                              <div className="tw-flex tw-gap-2">
                                <button className="tw-flex tw-items-center tw-gap-1 tw-text-blue-500 hover:tw-bg-blue-500/10 tw-px-3 tw-py-1.5 tw-rounded-lg tw-transition-colors tw-text-sm tw-font-semibold" onClick={() => setEditingReview(isEditing ? null : { id: rev._id, rating: rev.rating, comment: rev.comment })}>
                                  <i className={`fa-solid ${isEditing ? 'fa-xmark' : 'fa-pen'}`}></i> {isEditing ? (lang === 'AR' ? 'إلغاء' : 'Cancel') : (lang === 'AR' ? 'تعديل' : 'Edit')}
                                </button>
                                <button className="tw-flex tw-items-center tw-gap-1 tw-text-rose-500 hover:tw-bg-rose-500/10 tw-px-3 tw-py-1.5 tw-rounded-lg tw-transition-colors tw-text-sm tw-font-semibold" onClick={() => handleDeleteReview(rev._id)}>
                                  <i className="fa-solid fa-trash-can"></i> {lang === 'AR' ? 'حذف' : 'Delete'}
                                </button>
                              </div>
                            </div>

                            {isEditing ? (
                              <div className="tw-flex tw-flex-col tw-gap-3">
                                <div className="tw-flex tw-gap-2 tw-text-2xl">
                                  {[1,2,3,4,5].map(s => (
                                    <i key={s} onClick={() => setEditingReview(prev => ({ ...prev, rating: s }))} className={`${s <= editingReview.rating ? 'fa-solid' : 'fa-regular'} fa-star tw-cursor-pointer tw-text-[#dcae44]`}></i>
                                  ))}
                                </div>
                                <textarea className="tw-w-full tw-bg-white dark:tw-bg-[#15171a] tw-border tw-border-slate-200 dark:tw-border-slate-700 tw-rounded-xl tw-px-4 tw-py-3 tw-text-slate-900 dark:tw-text-white tw-resize-none" rows="3" value={editingReview.comment} onChange={e => setEditingReview(prev => ({ ...prev, comment: e.target.value }))} />
                                <button onClick={handleEditReview} className="tw-self-start tw-bg-[#dcae44] tw-text-black tw-font-bold tw-px-5 tw-py-2 tw-rounded-xl tw-transition-all">
                                  {lang === 'AR' ? 'حفظ التعديل' : 'Save Changes'}
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="tw-flex tw-text-[#dcae44] tw-text-sm tw-mb-3">
                                  {Array.from({ length: 5 }).map((_, i) => (<i key={i} className={`${i < rev.rating ? 'fa-solid' : 'fa-regular'} fa-star tw-mr-1`}></i>))}
                                </div>
                                <p className="tw-text-slate-700 dark:tw-text-slate-300 tw-leading-relaxed">{rev.comment || '—'}</p>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ───── TAB: Booking History ───── */}
              {activeTab === 'bookings' && (
                <div className="tw-bg-white dark:tw-bg-[#15171a] tw-rounded-3xl tw-p-8 sm:tw-p-10 tw-shadow-sm tw-border tw-border-slate-200/50 dark:tw-border-slate-800/50">
                  <h2 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-1">{lang === 'AR' ? 'سجل الحجوزات والمدفوعات' : 'Booking & Payment History'}</h2>
                  <p className="tw-text-slate-500 dark:tw-text-slate-400 tw-text-sm tw-mb-8">{lang === 'AR' ? 'جميع حجوزاتك السابقة والحالية.' : 'All your past and current bookings.'}</p>

                  {loadingBookings ? (
                    <div className="tw-flex tw-justify-center tw-py-12 tw-text-slate-400"><i className="fa-solid fa-spinner fa-spin tw-text-2xl tw-mr-2"></i> {lang === 'AR' ? 'جاري تحميل الحجوزات...' : 'Loading bookings...'}</div>
                  ) : myBookings.length === 0 ? (
                    <div className="tw-text-center tw-py-16">
                      <div className="tw-w-24 tw-h-24 tw-bg-[#dcae44]/10 tw-text-[#dcae44] tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-6 tw-text-4xl"><i className="fa-solid fa-calendar-xmark"></i></div>
                      <h4 className="tw-text-xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-2">{lang === 'AR' ? 'لا توجد حجوزات حتى الآن' : 'No bookings yet'}</h4>
                      <Link to="/trips" className="tw-bg-[#dcae44] hover:tw-bg-[#e5c35b] tw-text-black tw-font-bold tw-px-8 tw-py-3 tw-rounded-full tw-transition-all">{lang === 'AR' ? 'احجز رحلة الآن' : 'Book a Trip'}</Link>
                    </div>
                  ) : (
                    <div className="tw-flex tw-flex-col tw-gap-4">
                      {myBookings.map(b => (
                        <div key={b._id} className="tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-2xl tw-p-5 tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-4">
                          <div>
                            <h4 className="tw-font-bold tw-text-slate-900 dark:tw-text-white tw-text-base">{b.experience?.name || b.customTrip?.experience?.name || (lang === 'AR' ? 'باقة سياحية' : 'Travel Package')}</h4>
                            <p className="tw-text-xs tw-text-slate-500 dark:tw-text-slate-400 tw-mt-1">#{b._id?.slice(-8).toUpperCase()} · {b.booking_date ? new Date(b.booking_date).toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</p>
                          </div>
                          <div className="tw-flex tw-items-center tw-gap-4">
                            <span className="tw-font-bold tw-text-lg tw-text-slate-900 dark:tw-text-white">{b.total_amount?.toLocaleString()} EGP</span>
                            <span style={{ background: `${statusColors[b.status] || '#64748b'}20`, color: statusColors[b.status] || '#64748b' }} className="tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-bold tw-uppercase">{b.status}</span>
                          </div>
                        </div>
                      ))}
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
