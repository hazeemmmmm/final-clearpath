import { BASE_URL, getHeaders, apiCall } from './config.js';

export const getWishlist = async () => {
  return apiCall(`${BASE_URL}/wishlist`, {
    method: 'GET',
    headers: getHeaders(true),
  });
};

export const addToWishlist = async (experienceId) => {
  return apiCall(`${BASE_URL}/wishlist`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ experienceId }),
  });
};

export const removeFromWishlist = async (experienceId) => {
  return apiCall(`${BASE_URL}/wishlist/${experienceId}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
};
