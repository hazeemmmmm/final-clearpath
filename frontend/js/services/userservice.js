import * as userApi from '../api/userapi.js';

class UserService {
  async getProfile() {
    try {
      const response = await userApi.getProfile();
      return response.user;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(updateData) {
    try {
      const response = await userApi.updateProfile(updateData);
      return response.updated;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(passwordData) {
    try {
      await userApi.changePassword(passwordData);
    } catch (error) {
      throw error;
    }
  }

  async deleteAccount() {
    try {
      await userApi.deleteAccount();
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();
