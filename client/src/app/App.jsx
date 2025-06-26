import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import './App.css';

// Components.
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';
import ErrorPage from '../components/ErrorPage/ErrorPage';
import Spinner from '../components/Spinner/Spinner';

// Components (lazy-loaded).
const Chat = lazy(() => import('../features/chat/Chat'));
const PageNotFound = lazy(() => import('../components/PageNotFound/PageNotFound'));
const ProtectedRoutes = lazy(() => import('../components/ProtectedRoutes/ProtectedRoutes'));
const Signin = lazy(() => import('../features/auth/signin/Signin'));
const Signup = lazy(() => import('../features/auth/signup/Signup'));
const UserProfilePage = lazy(() => import('../components/UserProfilePage/UserProfilePage'));

// Constants.
import { ROUTES } from '../constants/routes';

// Functions.
import { isUserSignedIn, signout } from '../features/auth/authSlice';

const App = () => {
  const dispatch = useDispatch();

  const bootstrapAuth = async () => {
    try {
      await dispatch(isUserSignedIn()).unwrap(); // Use unwrap to catch errors.
    } catch (err) {
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
        <Route
          path={ROUTES.CHAT}
          element={
            <ProtectedRoutes>
              <ErrorBoundary fallback={<ErrorPage />}>
                <Suspense fallback={<Spinner />}>
                  <Chat />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoutes>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoutes>
              <ErrorBoundary fallback={<ErrorPage />}>
                <Suspense fallback={<Spinner />}>
                  <UserProfilePage />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoutes>
          }
        />
        <Route
          path={ROUTES.SIGNIN}
          element={
            <ErrorBoundary fallback={<ErrorPage />}>
              <Suspense fallback={<Spinner />}>
                <Signin />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path={ROUTES.SIGNUP}
          element={
            <ErrorBoundary fallback={<ErrorPage />}>
              <Suspense fallback={<Spinner />}>
                <Signup />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path={ROUTES.NOT_FOUND}
          element={
            <ErrorBoundary fallback={<ErrorPage />}>
              <Suspense fallback={<Spinner />}>
                <PageNotFound />
              </Suspense>
            </ErrorBoundary>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
