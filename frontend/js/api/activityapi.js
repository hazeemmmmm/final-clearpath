import { BASE_URL, getHeaders, apiCall } from './config.js';

export const getAllActivities = async (query = {}) => {
  const queryString = new URLSearchParams(query).toString();
  return apiCall(`${BASE_URL}/activity?${queryString}`, {
    method: 'GET',
    headers: getHeaders(),
  });
};

export const getOneActivity = async (id) => {
  return apiCall(`${BASE_URL}/activity/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });
};

export const createActivity = async (activityData) => {
  return apiCall(`${BASE_URL}/activity`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(activityData),
  });
};

export const updateActivity = async (id, updateData) => {
  return apiCall(`${BASE_URL}/activity/${id}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(updateData),
  });
};

export const deleteActivity = async (id) => {
  return apiCall(`${BASE_URL}/activity/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
};
