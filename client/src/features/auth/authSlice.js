import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import setAuthToken from '../../helpers/setAuthToken';

// Initial STATE for 'User'.
const initialState = {
  // loading: false, // 'false' as initial value if we use extra_reducer with 'pending' case.
  loading: true, // 'true' as initial value if we use extra_reducer without 'pending' case.
  error: '',
  isAuthenticated: false,
  token: localStorage.getItem('token'),
  user: null
};

// This function accepts two arguments: 1st is the ACTION type, 2nd is the callback function that creates the payload (Promise).
// 'createAsyncThunk()' automatically dispatch lifecycle ACTIONS based on the returned Promise. Promise will be 'pending', 'fullfilled' or 'rejected'.
// So, basically, 'createAsyncThunk()' generates 'pending', 'fullfilled' or 'rejected' ACTION types.
// We can listen to this ACTION types with an EXTRA_REDUCER and performes the necessary STATE transitions.
export const isUserSignedIn = createAsyncThunk('auth/isUserSignedIn', async () => {
  if (localStorage.token) {
    setAuthToken();
  };

  const user = await axios.get('http://localhost:5000/api/auth');

  return user.data;
});

// Create slice of the STORE for 'User'.
const authSlice = createSlice({
  // Specify the name of this slice.
  name: 'auth',
  // Specify the initial STATE for this slice.
  initialState,
  // Specify the EXTRA_REDUCERS.
  extraReducers: (builder) => {
    // // Commented because we set initial STATE value of 'loading' to 'true'.
    // builder.addCase(isUserSignedIn.pending, (state, action) => {
    //   state.loading = true
    // });

    builder.addCase(isUserSignedIn.fulfilled, (state, action) => {
      state.loading = false,
        state.error = '',
        state.user = action.payload,
        state.isAuthenticated = true
    });

    builder.addCase(isUserSignedIn.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message,
        state.user = null,
        state.isAuthenticated = false,
        state.token = null,
        // Remove token from local storage.
        localStorage.removeItem('token')
    });
  },
});

export const authReducer = authSlice.reducer;