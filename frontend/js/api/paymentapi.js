import { BASE_URL, getHeaders, apiCall } from './config.js';

export const createOrder = async (bookingId) => {
  return apiCall(`${BASE_URL}/payment/create-order`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ bookingId }),
  });
};

export const captureOrder = async (orderId) => {
  return apiCall(`${BASE_URL}/payment/capture/${orderId}`, {
    method: 'POST',
    headers: getHeaders(true),
  });
};

export const getPaymentHistory = async () => {
  return apiCall(`${BASE_URL}/payment/history`, {
    method: 'GET',
    headers: getHeaders(true),
  });
};
