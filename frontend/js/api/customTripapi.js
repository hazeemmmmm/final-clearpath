import { BASE_URL, getHeaders, apiCall } from './config.js';

export const createCustomTrip = async (experienceId) => {
  return apiCall(`${BASE_URL}/customTrip`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ experienceId }),
  });
};

export const getUserTrips = async () => {
  return apiCall(`${BASE_URL}/customTrip`, {
    method: 'GET',
    headers: getHeaders(true),
  });
};

export const getOneTrip = async (id) => {
  return apiCall(`${BASE_URL}/customTrip/${id}`, {
    method: 'GET',
    headers: getHeaders(true),
  });
};

export const getFinalTrip = async (experienceId) => {
  return apiCall(`${BASE_URL}/customTrip/view/${experienceId}`, {
    method: 'GET',
    headers: getHeaders(true),
  });
};

export const previewTrip = async (id) => {
  return apiCall(`${BASE_URL}/customTrip/preview/${id}`, {
    method: 'GET',
    headers: getHeaders(true),
  });
};

// Assuming there are update and delete, but not read in router, perhaps add if needed
export const updateTrip = async (id, updateData) => {
  return apiCall(`${BASE_URL}/customTrip/${id}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(updateData),
  });
};

export const deleteTrip = async (id) => {
  return apiCall(`${BASE_URL}/customTrip/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
};
