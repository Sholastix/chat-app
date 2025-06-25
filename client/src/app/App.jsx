import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import './App.css';

// Components.
import Chat from '../features/chat/Chat';
import PageNotFound from '../components/PageNotFound/PageNotFound';
import ProtectedRoutes from '../components/ProtectedRoutes/ProtectedRoutes';
import Signin from '../features/auth/signin/Signin';
import Signup from '../features/auth/signup/Signup';
import UserProfilePage from '../components/UserProfilePage/UserProfilePage';

// Constants.
import { ROUTES } from '../constants/routes';

// Functions.
import { isUserSignedIn, signout } from '../features/auth/authSlice';

const App = () => {
  const dispatch = useDispatch();

  const bootstrapAuth = async () => {
    try {
      await dispatch(isUserSignedIn()).unwrap(); // Use unwrap to catch errors.
    } catch (error) {
      console.warn('Auto sign-in failed. Clearing token and resetting auth.');
      dispatch(signout()); // Clean up bad token.
    }
  };

  useEffect(() => {
    bootstrapAuth();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.ROOT} element={<Navigate replace to={ROUTES.SIGNIN} />} />
        <Route element={<ProtectedRoutes />}>
          <Route path={ROUTES.CHAT} element={<Chat />} />
          <Route path={ROUTES.PROFILE} element={<UserProfilePage />} />
        </Route>
        <Route path={ROUTES.SIGNIN} element={<Signin />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />
        <Route path={ROUTES.NOT_FOUND} element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
