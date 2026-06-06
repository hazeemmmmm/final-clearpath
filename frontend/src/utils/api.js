import { login as authLogin, register as authRegister, verifyAccount as authVerifyAccount, forgotPassword as authForgotPassword, resetPassword as authResetPassword } from '../../js/api/authApi.js';
import { getAllExperiences, getOneExperience, createExperience as addExp, updateExperience as editExp, deleteExperience as removeExp } from '../../js/api/experienceapi.js';
import { getDestinations as fetchDestinations } from '../../js/api/destinationapi.js';
import { getAllActivities as fetchAllActivities } from '../../js/api/activityapi.js';
import { getAllProviders as fetchAllProviders } from '../../js/api/providerapi.js';
import { getWishlist as fetchWishlist, addToWishlist as addWishlist, removeFromWishlist as removeWishlist } from '../../js/api/wishlistapi.js';
import { BASE_URL, getHeaders, apiCall } from '../../js/api/config.js';
import { createOrder, captureOrder } from '../../js/api/paymentapi.js';
import { getAllUsers as fetchAllUsers, adminDeleteUser as removeUser, updateProfile as fetchUpdateProfile, changePassword as fetchChangePassword, deleteAccount as fetchDeleteAccount } from '../../js/api/userApi.js';
import { getUserBookings as fetchUserBookings, cancelBooking as fetchCancelBooking } from '../../js/api/bookingapi.js';
import { 
  createReview as addReview, 
  getExperienceReviews as fetchReviews, 
  getExperienceStats as fetchStats, 
  getMyReviews as fetchMyReviews, 
  getAllReviews as fetchAllReviews,
  deleteReview as removeReview,
  updateReview as patchReview
} from '../../js/api/reviewapi.js';
import {
  getPackingGuideForExperience as fetchPackingGuide,
  getAllPackingGuides as fetchAllPackingGuides,
  getOnePackingGuide as fetchOnePackingGuide,
  createPackingGuide as addPackingGuide,
  updatePackingGuide as editPackingGuide,
  deletePackingGuide as removePackingGuide,
} from '../../js/api/packingguideapi.js';

export const login = async (credentials) => authLogin(credentials);
export const register = async (userData) => authRegister(userData);
export const verifyAccount = async (data) => authVerifyAccount(data);
export const forgotPassword = async (data) => authForgotPassword(data);
export const resetPassword = async (data) => authResetPassword(data);

export const getActivities = async (query = {}) => fetchAllActivities(query);
export const createActivity = async (data) =>
  apiCall(`${BASE_URL}/activity`, { method: 'POST', headers: getHeaders(true), body: JSON.stringify(data) });
export const updateActivity = async (id, data) =>
  apiCall(`${BASE_URL}/activity/${id}/update`, { method: 'PATCH', headers: getHeaders(true), body: JSON.stringify(data) });
export const deleteActivity = async (id) =>
  apiCall(`${BASE_URL}/activity/${id}/delete`, { method: 'DELETE', headers: getHeaders(true) });
export const getProviders = async (query = {}) => fetchAllProviders(query);

export const getUserProfile = async () =>
  apiCall(`${BASE_URL}/user/profile`, { method: 'GET', headers: getHeaders(true) });

export const getTrips = async (query = {}) => getAllExperiences(query);
export const getFilterOptions = async () =>
  apiCall(`${BASE_URL}/experience/filter-options`, { method: 'GET', headers: getHeaders(true) });

export const getDayuse = async (query = {}) => getAllExperiences(query);
export const getTripDetails = async (id) => getOneExperience(id);
export const getDayuseDetails = async (id) => getOneExperience(id);

export const createExperience = async (data) => addExp(data);
export const updateExperience = async (id, data) => editExp(id, data);
export const duplicateExperience = async (id) =>
  apiCall(`${BASE_URL}/experience/${id}/duplicate`, { method: 'POST', headers: getHeaders(true) });
export const deleteExperience = async (id) => removeExp(id);
export const getProvidersMatch = async (id) =>
  apiCall(`${BASE_URL}/experience/${id}/providers-match`, { method: 'GET', headers: getHeaders(true) });
export const assignGuide = async (id, providerId) =>
  apiCall(`${BASE_URL}/experience/${id}/assign-guide`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify({ providerId })
  });

export const getDestinations = async () => fetchDestinations();

export const getWishlist = async () => fetchWishlist();
export const addToWishlist = async (experienceId) => addWishlist(experienceId);
export const removeFromWishlist = async (experienceId) => removeWishlist(experienceId);

export const processPayment = async (bookingId, currency = 'EGP') => createOrder(bookingId, currency);
export const confirmPayment = async (orderId) => captureOrder(orderId);
export const getPaymentHistory = async () =>
  apiCall(`${BASE_URL}/payment/history`, { method: 'GET', headers: getHeaders(true) });

// Reviews API
export const createReview = async (data) => addReview(data);
export const getExperienceReviews = async (experienceId, query) => fetchReviews(experienceId, query);
export const getExperienceStats = async (experienceId) => fetchStats(experienceId);
export const getMyReviews = async () => fetchMyReviews();
export const getAllReviews = async (query) => fetchAllReviews(query);
export const deleteReview = async (id) => removeReview(id);
export const updateReview = async (id, data) => patchReview(id, data);

// Chatbot API Integration
export const getChatHistory = async () =>
  apiCall(`${BASE_URL}/chatbot/history`, { method: 'GET', headers: getHeaders(true) });

export const getChatDetails = async (chatId) =>
  apiCall(`${BASE_URL}/chatbot/session/${chatId}`, { method: 'GET', headers: getHeaders(true) });



export const applyCoupon = async (bookingId, code) =>
  apiCall(`${BASE_URL}/booking/${bookingId}/apply-coupon`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ code }),
  });

export const sendChatMessage = async (message, chatId) =>
  apiCall(`${BASE_URL}/chatbot/message`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ message, chatId })
  });

export const deleteChatSession = async (chatId) =>
  apiCall(`${BASE_URL}/chatbot/session/${chatId}`, { method: 'DELETE', headers: getHeaders(true) });

// Admin Dashboard Extends
export const getAllUsersAdmin = async () => fetchAllUsers();
export const adminDeleteUser = async (userId) => removeUser(userId);

export const getAllBookingsAdmin = async () =>
  apiCall(`${BASE_URL}/booking/admin/all`, { method: 'GET', headers: getHeaders(true) });

export const getSupervisorTrips = async () =>
  apiCall(`${BASE_URL}/experience/supervisor/me`, { method: 'GET', headers: getHeaders(true) });

export const updateBookingStatusAdmin = async (bookingId, status) =>
  apiCall(`${BASE_URL}/booking/admin/status/${bookingId}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify({ status })
  });

// Custom Trips API
export const getFinalTrip = async (experienceId) =>
  apiCall(`${BASE_URL}/customTrip/view/${experienceId}`, { method: 'GET', headers: getHeaders(true) });

export const createCustomTrip = async (experienceId) =>
  apiCall(`${BASE_URL}/customTrip`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ experienceId })
  });

export const addDayToCustomTrip = async (tripId, dayObj) =>
  apiCall(`${BASE_URL}/customTrip/${tripId}/add-day`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(dayObj)
  });

export const addActivityToCustomTrip = async (tripId, day_number, activityObj) =>
  apiCall(`${BASE_URL}/customTrip/${tripId}/add-activity`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify({ day_number, ...activityObj })
  });

export const removeActivityFromCustomTrip = async (tripId, day_number, activityId) =>
  apiCall(`${BASE_URL}/customTrip/${tripId}/remove-activity`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify({ day_number, activityId })
  });

export const removeDayFromCustomTrip = async (tripId, day_number) =>
  apiCall(`${BASE_URL}/customTrip/${tripId}/remove-day`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify({ day_number })
  });

export const addExtraActivityToCustomTrip = async (tripId, activityObj) =>
  apiCall(`${BASE_URL}/customTrip/${tripId}/add-extra`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(activityObj)
  });

export const removeExtraActivityFromCustomTrip = async (tripId, activityId) =>
  apiCall(`${BASE_URL}/customTrip/${tripId}/remove-extra`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify({ activityId })
  });

// Booking API
export const createBooking = async (bookingData) =>
  apiCall(`${BASE_URL}/booking`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(bookingData)
  });

export const getBookingDetails = async (bookingId) =>
  apiCall(`${BASE_URL}/booking/${bookingId}`, {
    method: 'GET',
    headers: getHeaders(true)
  });

export const calculateBookingPrice = async (calcData) =>
  apiCall(`${BASE_URL}/booking/calculate`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(calcData)
  });


export const updateProfile = async (updateData) => fetchUpdateProfile(updateData);
export const changePassword = async (passwordData) => fetchChangePassword(passwordData);
export const deleteAccount = async () => fetchDeleteAccount();
export const getUserBookings = async () => fetchUserBookings();
export const cancelBooking = async (bookingId) => fetchCancelBooking(bookingId);

// Destinations & Providers Admin CRUD
export const createDestination = async (data) =>
  apiCall(`${BASE_URL}/destination`, { method: 'POST', headers: getHeaders(true), body: JSON.stringify(data) });
export const updateDestination = async (id, data) =>
  apiCall(`${BASE_URL}/destination/${id}`, { method: 'PATCH', headers: getHeaders(true), body: JSON.stringify(data) });
export const deleteDestination = async (id) =>
  apiCall(`${BASE_URL}/destination/${id}`, { method: 'DELETE', headers: getHeaders(true) });
export const createProvider = async (data) =>
  apiCall(`${BASE_URL}/provider`, { method: 'POST', headers: getHeaders(true), body: JSON.stringify(data) });
export const updateProvider = async (id, data) =>
  apiCall(`${BASE_URL}/provider/${id}`, { method: 'PATCH', headers: getHeaders(true), body: JSON.stringify(data) });
export const deleteProvider = async (id) =>
  apiCall(`${BASE_URL}/provider/${id}`, { method: 'DELETE', headers: getHeaders(true) });

// My Custom Trips
export const getMyCustomTrips = async () =>
  apiCall(`${BASE_URL}/customTrip/my`, { method: 'GET', headers: getHeaders(true) });
export const combineDestination = async (customTripId, targetPackageId) =>
  apiCall(`${BASE_URL}/customTrip/${customTripId}/combine`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ targetPackageId })
  });

export const adminCreateSupervisor = async (supervisorData) =>
  apiCall(`${BASE_URL}/user/admin/create-supervisor`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(supervisorData)
  });

// Packing Guide API
export const getPackingGuideForExperience = async (experienceId) => fetchPackingGuide(experienceId);
export const getAllPackingGuides   = async (query)  => fetchAllPackingGuides(query);
export const getOnePackingGuide    = async (id)     => fetchOnePackingGuide(id);
export const createPackingGuide    = async (data)   => addPackingGuide(data);
export const updatePackingGuide    = async (id, data) => editPackingGuide(id, data);
export const deletePackingGuide    = async (id)     => removePackingGuide(id);

export const trackInteraction = async (data) =>
  apiCall(`${BASE_URL}/analytics/track`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data)
  });
export const getIntelligenceDashboard = async (isDemo = false) =>
  apiCall(`${BASE_URL}/admin/intelligence?demo=${isDemo}`, { method: 'GET', headers: getHeaders(true) });

export const flagUser = async (userId) =>
  apiCall(`${BASE_URL}/admin/flag-user/${userId}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify({ reason: "Restricted due to anomalous high cancellation rate / تم تقييد الحساب بسبب معدل إلغاء مرتفع وغير طبيعي." })
  });

export const unflagUser = async (userId) =>
  apiCall(`${BASE_URL}/admin/unflag-user/${userId}`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });

export const getPriceOptimization = async (id, month = '') =>
  apiCall(`${BASE_URL}/experience/${id}/optimize-price?month=${month}`, {
    method: 'GET',
    headers: getHeaders(true)
  });

export const applyPriceOptimization = async (id, price) =>
  apiCall(`${BASE_URL}/experience/${id}/apply-optimized-price`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify({ price })
  });

export const autoAssignGuide = async (id) =>
  apiCall(`${BASE_URL}/experience/${id}/auto-assign-guide`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });

export const recommendSupervisors = async (payload) =>
  apiCall(`${BASE_URL}/supervisors/recommend`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  });

export const matchSupervisorByBio = async (packageLocation) =>
  apiCall(`${BASE_URL}/supervisors/ai-match`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ packageLocation })
  });

export const getTripExtensions = async (currentTripEndDate) =>
  apiCall(`${BASE_URL}/experience/extensions?currentTripEndDate=${currentTripEndDate}`, {
    method: 'GET',
    headers: getHeaders(true)
  });

export const getUserPreferenceAnalytics = async (demo = false) =>
  apiCall(`${BASE_URL}/admin/analytics/preferences?demo=${demo}`, {
    method: 'GET',
    headers: getHeaders(true)
  });

export const getNearbyExperiences = async ({ lat, lng, radiusKm = 50 }) =>
  apiCall(`${BASE_URL}/experience/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`, {
    method: 'GET',
    headers: getHeaders(),
  });
