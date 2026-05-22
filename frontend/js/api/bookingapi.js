import { BASE_URL, getHeaders, apiCall } from './config.js';

export const createBooking = async (bookingData) => {
  return apiCall(`${BASE_URL}/booking`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(bookingData),
  });
};

export const getUserBookings = async () => {
  return apiCall(`${BASE_URL}/booking`, {
    method: 'GET',
    headers: getHeaders(true),
  });
};

export const getOneBooking = async (bookingId) => {
  return apiCall(`${BASE_URL}/booking/${bookingId}`, {
    method: 'GET',
    headers: getHeaders(true),
  });
};

export const cancelBooking = async (bookingId) => {
  return apiCall(`${BASE_URL}/booking/${bookingId}/cancel`, {
    method: 'PATCH',
    headers: getHeaders(true),
  });
};

export const deleteBooking = async (bookingId) => {
  return apiCall(`${BASE_URL}/booking/${bookingId}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
};
