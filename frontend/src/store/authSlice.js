import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: localStorage.getItem('user') && localStorage.getItem('user') !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
  isChatOpen: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      if (action.payload.user) {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      } else {
        localStorage.removeItem('user');
      }
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      if (action.payload.user) {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      } else {
        localStorage.removeItem('user');
      }
    },
    registerFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.error = null;
      state.isChatOpen = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    toggleChat: (state) => {
      state.isChatOpen = !state.isChatOpen;
    },
    setChatOpen: (state, action) => {
      state.isChatOpen = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  clearError,
  toggleChat,
  setChatOpen,
} = authSlice.actions;

export default authSlice.reducer;
