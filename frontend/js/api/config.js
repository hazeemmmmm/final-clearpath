// API Configuration
export const BASE_URL = 'http://localhost:3000';

// Common headers
export const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

// Helper function for API calls
export const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    // Handle 204 No Content separately since it has no body to parse
    if (response.status === 204) {
      return null;
    }
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
