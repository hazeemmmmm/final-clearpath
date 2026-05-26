import { login as authLogin, register as authRegister, verifyAccount as authVerifyAccount, forgotPassword as authForgotPassword, resetPassword as authResetPassword } from '../../js/api/authApi.js';
import { getAllExperiences, getOneExperience, createExperience as addExp, updateExperience as editExp, deleteExperience as removeExp } from '../../js/api/experienceapi.js';
import { getDestinations as fetchDestinations } from '../../js/api/destinationapi.js';
import { getAllActivities as fetchAllActivities } from '../../js/api/activityapi.js';
import { getAllProviders as fetchAllProviders } from '../../js/api/providerapi.js';
import { getWishlist as fetchWishlist, addToWishlist as addWishlist, removeFromWishlist as removeWishlist } from '../../js/api/wishlistapi.js';
import { BASE_URL, getHeaders, apiCall } from '../../js/api/config.js';
import { createOrder, captureOrder } from '../../js/api/paymentapi.js';
import { getAllUsers as fetchAllUsers, adminDeleteUser as removeUser, updateProfile as fetchUpdateProfile, changePassword as fetchChangePassword } from '../../js/api/userApi.js';
import { getUserBookings as fetchUserBookings, cancelBooking as fetchCancelBooking } from '../../js/api/bookingapi.js';
import { 
  createReview as addReview, 
  getExperienceReviews as fetchReviews, 
  getExperienceStats as fetchStats, 
  getMyReviews as fetchMyReviews, 
  getAllReviews as fetchAllReviews,
  deleteReview as removeReview
} from '../../js/api/reviewapi.js';

export const login = async (credentials) => authLogin(credentials);
export const register = async (userData) => authRegister(userData);
export const verifyAccount = async (data) => authVerifyAccount(data);
export const forgotPassword = async (data) => authForgotPassword(data);
export const resetPassword = async (data) => authResetPassword(data);

export const getActivities = async (query = {}) => fetchAllActivities(query);
export const getProviders = async (query = {}) => fetchAllProviders(query);

export const getUserProfile = async () =>
  apiCall(`${BASE_URL}/user/profile`, { method: 'GET', headers: getHeaders(true) });

export const getTrips = async (query = {}) => getAllExperiences(query);
export const getDayuse = async (query = {}) => getAllExperiences(query);
export const getTripDetails = async (id) => getOneExperience(id);
export const getDayuseDetails = async (id) => getOneExperience(id);

export const createExperience = async (data) => addExp(data);
export const updateExperience = async (id, data) => editExp(id, data);
export const deleteExperience = async (id) => removeExp(id);

export const getDestinations = async () => fetchDestinations();

export const getWishlist = async () => fetchWishlist();
export const addToWishlist = async (experienceId) => addWishlist(experienceId);
export const removeFromWishlist = async (experienceId) => removeWishlist(experienceId);

export const processPayment = async (bookingId, currency = 'EGP') => createOrder(bookingId, currency);
export const confirmPayment = async (orderId) => captureOrder(orderId);

// Reviews API
export const createReview = async (data) => addReview(data);
export const getExperienceReviews = async (experienceId, query) => fetchReviews(experienceId, query);
export const getExperienceStats = async (experienceId) => fetchStats(experienceId);
export const getMyReviews = async () => fetchMyReviews();
export const getAllReviews = async (query) => fetchAllReviews(query);
export const deleteReview = async (id) => removeReview(id);

// Chatbot API Integration
export const getChatHistory = async () =>
  apiCall(`${BASE_URL}/chatbot/history`, { method: 'GET', headers: getHeaders(true) });

export const getChatDetails = async (chatId) =>
  apiCall(`${BASE_URL}/chatbot/session/${chatId}`, { method: 'GET', headers: getHeaders(true) });

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

export const updateProfile = async (updateData) => fetchUpdateProfile(updateData);
export const changePassword = async (passwordData) => fetchChangePassword(passwordData);
export const getUserBookings = async () => fetchUserBookings();
export const cancelBooking = async (bookingId) => fetchCancelBooking(bookingId);

export const adminCreateSupervisor = async (supervisorData) =>
  apiCall(`${BASE_URL}/user/admin/create-supervisor`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(supervisorData)
  });



