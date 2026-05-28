import { BASE_URL, getHeaders, apiCall } from './config.js';

// ── PUBLIC ──────────────────────────────────────────────────
// Get the best packing guide for a given experience (smart lookup)
export const getPackingGuideForExperience = async (experienceId) => {
  return apiCall(`${BASE_URL}/packing-guide/for/${experienceId}`, {
    method: 'GET',
    headers: getHeaders(false),
  });
};

// ── ADMIN ────────────────────────────────────────────────────
// Get all packing guides
export const getAllPackingGuides = async (query = {}) => {
  const params = new URLSearchParams(query).toString();
  return apiCall(`${BASE_URL}/packing-guide${params ? '?' + params : ''}`, {
    method: 'GET',
    headers: getHeaders(true),
  });
};

// Get one packing guide by ID
export const getOnePackingGuide = async (id) => {
  return apiCall(`${BASE_URL}/packing-guide/${id}`, {
    method: 'GET',
    headers: getHeaders(true),
  });
};

// Create a new packing guide
export const createPackingGuide = async (data) => {
  return apiCall(`${BASE_URL}/packing-guide`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
};

// Update a packing guide
export const updatePackingGuide = async (id, data) => {
  return apiCall(`${BASE_URL}/packing-guide/${id}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
};

// Delete a packing guide
export const deletePackingGuide = async (id) => {
  return apiCall(`${BASE_URL}/packing-guide/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
};
