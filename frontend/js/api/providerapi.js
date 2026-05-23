import { BASE_URL, getHeaders, apiCall } from './config.js';

export const getAllProviders = async (query = {}) => {
  const queryString = new URLSearchParams(query).toString();
  return apiCall(`${BASE_URL}/provider?${queryString}`, {
    method: 'GET',
    headers: getHeaders(true),
  });
};

export const getProvider = async (id) => {
  return apiCall(`${BASE_URL}/provider/${id}`, {
    method: 'GET',
    headers: getHeaders(true),
  });
};

export const createProvider = async (providerData) => {
  return apiCall(`${BASE_URL}/provider`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(providerData),
  });
};

export const updateProvider = async (id, updateData) => {
  return apiCall(`${BASE_URL}/provider/${id}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(updateData),
  });
};

export const deleteProvider = async (id) => {
  return apiCall(`${BASE_URL}/provider/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
};
