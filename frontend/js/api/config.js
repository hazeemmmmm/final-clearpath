// API Configuration
export const BASE_URL = 'http://localhost:3000';

// Common headers
export const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = localStorage.getItem('clearpath_access_token') || localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// Parse backend error messages into clean, readable strings
const parseErrorMessage = (message) => {
  if (!message) return 'Something went wrong. Please try again.';

  // Already a plain string
  if (typeof message === 'string') {
    // Check if it's a JSON-encoded validation array e.g. [{"path":"x","message":"y"}]
    const trimmed = message.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(e => e.message || e.msg || String(e)).join('. ');
        }
        if (parsed && parsed.message) return parsed.message;
      } catch {}
    }
    return message;
  }

  // Already an array
  if (Array.isArray(message)) {
    return message.map(e => e.message || e.msg || String(e)).join('. ');
  }

  return String(message);
};

// Helper function for API calls
export const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) return null;

    const data = await response.json();
    if (!response.ok) {
      throw new Error(parseErrorMessage(data.message || data.error || 'API call failed'));
    }
    return data;
  } catch (error) {
    // Re-parse in case the error was thrown elsewhere
    if (error instanceof Error && error.message) {
      error.message = parseErrorMessage(error.message);
    }
    throw error;
  }
};
