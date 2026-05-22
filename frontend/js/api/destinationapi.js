import { BASE_URL, getHeaders, apiCall } from './config.js';

export const getDestinations = async () => {
  return apiCall(`${BASE_URL}/destination`, {
    method: 'GET',
    headers: getHeaders(),
  });
};

export const getOneDestination = async (destinationId) => {
  return apiCall(`${BASE_URL}/destination/${destinationId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
};

export const addDestination = async (destinationData) => {
  return apiCall(`${BASE_URL}/destination`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(destinationData),
  });
};

export const updateDestination = async (destinationId, updateData) => {
  return apiCall(`${BASE_URL}/destination/${destinationId}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(updateData),
  });
};

export const removeDestination = async (destinationId) => {
  return apiCall(`${BASE_URL}/destination/${destinationId}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
};
