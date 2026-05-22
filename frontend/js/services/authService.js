import * as authApi from '../api/authapi.js';

class AuthService {
  async login(credentials) {
    try {
      const response = await authApi.login(credentials);
      // Store token
      localStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await authApi.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await authApi.logout();
      localStorage.removeItem('token');
    } catch (error) {
      throw error;
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }
}

export default new AuthService();
