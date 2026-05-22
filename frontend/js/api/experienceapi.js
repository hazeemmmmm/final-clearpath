import { BASE_URL, getHeaders, apiCall } from './config.js';

export const getAllExperiences = async (query = {}) => {
  const queryString = new URLSearchParams(query).toString();
  return apiCall(`${BASE_URL}/experience?${queryString}`, {
    method: 'GET',
    headers: getHeaders(),
  });
};

export const getOneExperience = async (id) => {
  return apiCall(`${BASE_URL}/experience/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });
};

export const createExperience = async (experienceData) => {
  return apiCall(`${BASE_URL}/experience`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(experienceData),
  });
};

export const updateExperience = async (id, updateData) => {
  return apiCall(`${BASE_URL}/experience/${id}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(updateData),
  });
};

export const deleteExperience = async (id) => {
  return apiCall(`${BASE_URL}/experience/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
};
