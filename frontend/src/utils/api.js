import { BASE_URL, getHeaders, apiCall } from '../../js/api/config.js';
import { login as authLogin, register as authRegister, verifyAccount as authVerifyAccount } from '../../js/api/authApi.js';
import { getAllExperiences, getOneExperience, createExperience as addExp, updateExperience as editExp, deleteExperience as removeExp } from '../../js/api/experienceapi.js';
import { getDestinations as fetchDestinations } from '../../js/api/destinationapi.js';
import { getWishlist as fetchWishlist, addToWishlist as addWishlist, removeFromWishlist as removeWishlist } from '../../js/api/wishlistapi.js';
import { createOrder } from '../../js/api/paymentapi.js';
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

export const processPayment = async (bookingId) => createOrder(bookingId);

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

