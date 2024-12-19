import { configureStore } from '@reduxjs/toolkit';

// Import REDUCERS from slices.
import { authReducer } from '../features/auth/authSlice';
import { signinReducer } from '../features/signin/signinSlice';
import { signupReducer } from '../features/signup/signupSlice';

const store = configureStore({
  // We don't explicitly use 'combineReducers' method because 'configureStore' method doing this for us under the hood.
  reducer: {
    authReducer,
    signinReducer,
    signupReducer
  },
});

export default store;