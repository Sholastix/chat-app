import { useEffect, Fragment } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import './App.css';

// Components.
import Chat from '../features/chat/Chat';
import ErrorPage from '../components/ErrorPage/ErrorPage';
import ProtectedRoutes from '../components/ProtectedRoutes/ProtectedRoutes';
import Signin from '../features/auth/signin/Signin';
import Signup from '../features/auth/signup/Signup';
import UserProfilePage from '../components/UserProfilePage/UserProfilePage';

// Functions.
import { isUserSignedIn, signout } from '../features/auth/authSlice';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        await dispatch(isUserSignedIn())
          .unwrap(); // Use unwrap to catch errors.
      } catch (error) {
        console.warn('Auto sign-in failed. Clearing token and resetting auth.');
        dispatch(signout()); // Clean up bad token.
      }
    };

    bootstrapAuth();
  }, [dispatch]);

  return (
    <Fragment>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate replace to="/chat" />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<UserProfilePage />} />
          </Route>
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </Fragment>
  );
};

export default App;
