import { BASE_URL, getHeaders, apiCall } from './config.js';

export const getProfile = async () => {
  return apiCall(`${BASE_URL}/user/profile`, {
    method: 'GET',
    headers: getHeaders(true),
  });
};

export const updateProfile = async (updateData) => {
  return apiCall(`${BASE_URL}/user/update-profile`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(updateData),
  });
};

export const changePassword = async (passwordData) => {
  return apiCall(`${BASE_URL}/user/change-password`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(passwordData),
  });
};

export const deleteAccount = async () => {
  return apiCall(`${BASE_URL}/user/delete-account`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
};

// Admin functions (if needed)
export const getAllUsers = async () => {
  return apiCall(`${BASE_URL}/user/admin/all`, {
    method: 'GET',
    headers: getHeaders(true),
  });
};

export const adminDeleteUser = async (userId) => {
  return apiCall(`${BASE_URL}/user/admin/delete/${userId}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
};
