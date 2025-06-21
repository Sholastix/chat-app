import { useEffect, useCallback, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import './App.css';

// Components (lazy-loaded).
import Spinner from '../components/Spinner/Spinner';
const Chat = lazy(() => import('../features/chat/Chat'));
const ErrorPage = lazy(() => import('../components/ErrorPage/ErrorPage'));
const ProtectedRoutes = lazy(() => import('../components/ProtectedRoutes/ProtectedRoutes'));
const Signin = lazy(() => import('../features/auth/signin/Signin'));
const Signup = lazy(() => import('../features/auth/signup/Signup'));
const UserProfilePage = lazy(() => import('../components/UserProfilePage/UserProfilePage'));

// Functions.
import { isUserSignedIn, signout } from '../features/auth/authSlice';

const App = () => {
  const dispatch = useDispatch();

  const bootstrapAuth = useCallback(async () => {
    try {
      await dispatch(isUserSignedIn()).unwrap();
    } catch (error) {
      console.warn('Auto sign-in failed. Clearing token and resetting auth.');
      dispatch(signout());
    }
  }, [dispatch]);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path='/' element={<Navigate replace to='/signin' />} />
          <Route element={<ProtectedRoutes />}>
            <Route path='/chat' element={<Chat />} />
            <Route path='/profile' element={<UserProfilePage />} />
          </Route>
          <Route path='/signin' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='*' element={<ErrorPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
