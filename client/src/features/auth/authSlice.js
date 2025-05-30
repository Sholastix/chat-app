import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Functions.
import setAuthToken from '../../helpers/setAuthToken';

// Initial STATE for 'User'.
const initialState = {
  loading: false,
  error: '',
  isAuthenticated: false,
  token: localStorage.getItem('token'),
  user: null,
};

// This function accepts two arguments: 1st is the ACTION type, 2nd is the callback function that creates the payload (Promise).
// 'createAsyncThunk()' automatically dispatch lifecycle ACTIONS based on the returned Promise. Promise will be 'pending', 'fullfilled' or 'rejected'.
// So, basically, 'createAsyncThunk()' generates 'pending', 'fullfilled' or 'rejected' ACTION types.
// We can listen to this ACTION types with an EXTRA_REDUCER and performes the necessary STATE transitions.
// Auth check.
export const isUserSignedIn = createAsyncThunk('auth/isUserSignedIn', async () => {
  if (localStorage.token) {
    setAuthToken();
  }

  const user = await axios.get('/api/auth');

  return user.data;
});

// Signup.
export const signup = createAsyncThunk('auth/signup', async (props) => {
  const user = await axios.post('/api/signup', {
    username: props.username,
    email: props.email,
    password: props.password,
    confirmPassword: props.confirmPassword,
  });

  return user.data;
});

// Signin.
export const signin = createAsyncThunk('auth/signin', async (props) => {
  const user = await axios.post('/api/signin', {
    email: props.email,
    password: props.password,
  });

  return user.data;
});

// Update user's profile.
export const updateUser = createAsyncThunk('auth/updateUser', async ({ id, picture, username }) => {
  // Updating picture and name from 'user profile' form.
  if (picture && username) {
    const { data } = await axios.put(`/api/user/${id}`, {
      picture: picture,
      username: username,
    });

    return data;
  }
});

// Create slice of the STORE for 'User'.
const authSlice = createSlice({
  // Specify the name of this slice.
  name: 'auth',
  // Specify the initial STATE for this slice.
  initialState,
  // Specify the REDUCER for this slice.
  reducers: {
    // For signin out.
    signout: (state) => {
      // Mutating the STATE directly is possible due to 'redux-toolkit' using npm 'Immer' under the hood.
      state.loading = false;
      state.error = '';
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      // Remove token from local storage.
      localStorage.removeItem('token');
      // Clear axios auth header.
      setAuthToken(null);
    },
  },
  // Specify the EXTRA_REDUCERS.
  extraReducers: (builder) => {
    // -------------------------------   AUTH CHECK   -------------------------------
    builder.addCase(isUserSignedIn.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(isUserSignedIn.fulfilled, (state, action) => {
      state.loading = false;
      state.error = '';
      state.user = action.payload;
      state.isAuthenticated = true;
    });

    builder.addCase(isUserSignedIn.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      // Remove token from local storage.
      localStorage.removeItem('token');
      // Clear axios auth header.
      setAuthToken(null);
    });

    // -------------------------------   SIGNUP   -------------------------------
    builder.addCase(signup.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(signup.fulfilled, (state, action) => {
      state.loading = false;
      state.error = '';
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      // Put token in local storage.
      localStorage.setItem('token', action.payload.token);
      // Set axios auth header.
      setAuthToken();
    });

    builder.addCase(signup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      // Remove token from local storage.
      localStorage.removeItem('token');
      // Clear axios auth header.
      setAuthToken(null);
    });

    // -------------------------------   SIGNIN   -------------------------------
    builder.addCase(signin.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(signin.fulfilled, (state, action) => {
      state.loading = false;
      state.error = '';
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      // Put token in local storage.
      localStorage.setItem('token', action.payload.token);
      // Set axios auth header.
      setAuthToken();
    });

    builder.addCase(signin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      // Remove token from local storage.
      localStorage.removeItem('token');
      // Clear axios auth header.
      setAuthToken(null);
    });

    // -------------------------------   UPDATE USER'S PROFILE   -------------------------------
    builder.addCase(updateUser.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.loading = false;
      state.error = '';
      state.user = action.payload;
    });

    builder.addCase(updateUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
});

export const { signout } = authSlice.actions;
export const authReducer = authSlice.reducer;
