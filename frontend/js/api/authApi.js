import { BASE_URL, getHeaders, apiCall } from './config.js';

export const register = async (userData) => {
  return apiCall(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });
};

export const login = async (credentials) => {
  return apiCall(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials),
  });
};

export const loginWithGoogle = async (googleData) => {
  return apiCall(`${BASE_URL}/auth/google`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(googleData),
  });
};

export const verifyAccount = async (verificationData) => {
  return apiCall(`${BASE_URL}/auth/verify`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(verificationData),
  });
};

export const forgotPassword = async (emailData) => {
  return apiCall(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(emailData),
  });
};

export const resetPassword = async (resetData) => {
  return apiCall(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(resetData),
  });
};

export const logout = async () => {
  return apiCall(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getHeaders(true),
  });
};
