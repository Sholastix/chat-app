import { configureStore } from '@reduxjs/toolkit';

// Import REDUCERS from slices.
import { authReducer } from '../features/auth/authSlice';

const store = configureStore({
  // We don't explicitly use 'combineReducers' method because 'configureStore' method doing this for us under the hood.
  reducer: {
    authReducer
  },
});

export default store;