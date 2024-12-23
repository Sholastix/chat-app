import { createSlice } from '@reduxjs/toolkit';

// Initial STATE for 'User'.
const initialState = {
  loading: false,
  error: '',
  isAuthenticated: false,
  token: localStorage.getItem('token'),
  user: null
};

// Create slice of the STORE for signout.
const signoutSlice = createSlice({
  // Specify the name of this slice.
  name: 'signout',
  // Specify the initial STATE for this slice.
  initialState,
  // Specify the REDUCER for this slice.
  reducers: {
    // For signin out.
    logoutUser: (state, action) => {
      // Mutating the STATE directly is possible due to 'redux-toolkit' using npm 'Immer' under the hood.
      state.loading = false;
      state.error = '',
      state.user = null,
      state.isAuthenticated = false,
      state.token = null
      // Remove token from local storage.
      localStorage.removeItem('token')
    }
  }
});

export const { logoutUser } = signoutSlice.actions;
export const signoutReducer = signoutSlice.reducer;