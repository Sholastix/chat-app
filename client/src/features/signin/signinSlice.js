import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Initial STATE for 'User'.
const initialState = {
  loading: false,
  error: '',
  isAuthenticated: false,
  token: localStorage.getItem('token'),
  user: null
};

// This function accepts two arguments: 1st is the ACTION type, 2nd is the callback function that creates the payload (Promise).
// 'createAsyncThunk()' automatically dispatch lifecycle ACTIONS based on the returned Promise. Promise will be 'pending', 'fullfilled' or 'rejected'.
// So, basically, 'createAsyncThunk()' generates 'pending', 'fullfilled' or 'rejected' ACTION types.
// We can listen to this ACTION types with an EXTRA_REDUCER and performes the necessary STATE transitions.
export const loginUser = createAsyncThunk('signin/loginUser', async (props) => {
  const user = await axios.post('http://localhost:5000/api/signin', {
    email: props.email,
    password: props.password
  });

  return user.data;
});

// Create slice of the STORE for 'User'.
const signinSlice = createSlice({
  // Specify the name of this slice.
  name: 'signin',
  // Specify the initial STATE for this slice.
  initialState,
  // Specify the EXTRA_REDUCERS.
  extraReducers: (builder) => {
    builder.addCase(loginUser.pending, (state, action) => {
      state.loading = true
    });

    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false,
      state.error = '',
      state.user = action.payload,
      state.isAuthenticated = true,
      state.token = action.payload.token,
      // Put token in local storage.
      localStorage.setItem('token', action.payload.token)
    });

    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message,
      state.user = null,
      state.isAuthenticated = false,
      state.token = null
      // Remove token from local storage.
      localStorage.removeItem('token')
    });
  },
});

export const signinReducer = signinSlice.reducer;