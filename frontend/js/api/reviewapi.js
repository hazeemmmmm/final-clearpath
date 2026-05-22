import { BASE_URL, getHeaders, apiCall } from './config.js';

export const createReview = async (reviewData) => {
  return apiCall(`${BASE_URL}/review`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(reviewData),
  });
};

export const getExperienceReviews = async (experienceId, query = {}) => {
  const queryString = new URLSearchParams(query).toString();
  return apiCall(`${BASE_URL}/review/experience/${experienceId}?${queryString}`, {
    method: 'GET',
    headers: getHeaders(),
  });
};

export const getExperienceStats = async (experienceId) => {
  return apiCall(`${BASE_URL}/review/experience/${experienceId}/stats`, {
    method: 'GET',
    headers: getHeaders(),
  });
};

export const getMyReviews = async () => {
  return apiCall(`${BASE_URL}/review/my-reviews`, {
    method: 'GET',
    headers: getHeaders(true),
  });
};

export const getAllReviews = async (query = {}) => {
  const queryString = new URLSearchParams(query).toString();
  return apiCall(`${BASE_URL}/review?${queryString}`, {
    method: 'GET',
    headers: getHeaders(true),
  });
};

export const deleteReview = async (reviewId) => {
  return apiCall(`${BASE_URL}/review/${reviewId}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
};

