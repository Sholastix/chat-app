import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Initial STATE for 'User'.
const initialState = {
  loading: false,
  error: {},
  user: {}
};

// This function accepts two arguments: 1st is the ACTION type, 2nd is the callback function that creates the payload (Promise).
// 'createAsyncThunk()' automatically dispatch lifecycle ACTIONS based on the returned Promise. Promise will be 'pending', 'fullfilled' or 'rejected'.
// So, basically, 'createAsyncThunk()' generates 'pending', 'fullfilled' or 'rejected' ACTION types.
// We can listen to this ACTION types with an EXTRA_REDUCER and performes the necessary STATE transitions.
export const registerUser = createAsyncThunk('signup/registerUser', async (props) => {
  const user = await axios.post('http://localhost:5000/api/signup', {
    username: props.username,
    email: props.email,
    password: props.password,
    confirmPassword: props.confirmPassword
  });

  return user.data;
});

// Create slice of the STORE for 'User'.
const signupSlice = createSlice({
  // Specify the name of this slice.
  name: 'signup',
  // Specify the initial STATE for this slice.
  initialState,
  // Specify the EXTRA_REDUCERS.
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending, (state, action) => {
      state.loading = true
    });

    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false,
      state.error = {},
      state.user = action.payload
    });

    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message,
      state.user = {}
    });
  },
});

export const signupReducer = signupSlice.reducer;