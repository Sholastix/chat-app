import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Functions.
import { signout } from '../features/auth/authSlice';

// This hook mainly for "Edge" (and Chromium-based browsers with 'session resume' features), especially when users have 'Continue where you left off' option enabled in settings.
// The app in "Edge" never fully restarts like in "Chrome"/"Firefox" — page resumes from memory as if it was paused, even React component trees are still 'alive'.
// Basically we looking at a paused version of our React SPA that resumes without reinitializing and that behaviour causes bugs with auth check in our case.

// EXAMPLE:
// 1. User closed the browser window without exiting the application.
// 2. Auth token has expired, but it still exists in the local storage or has already been deleted from the local storage.
// 3. The user reopened the browser window, and at that point an authentication check should have been performed, but "Edge" ignores this due to its "session recovery" feature,
//    where it returns the previously cached React application fragment from the current user's PC's RAM:
//    - JavaScript memory state (like variables, Redux store state, etc.)
//    - DOM
//    - Component hierarchy
//    - React state (if not rehydrated from scratch)
//    Basically, "Edge" does not re-run 'App.js' where auth check must be fired - we just receiving the cached data from RAM.
// 4. As a result, the user sees a chat page with a broken UI (without contacts in our case).

// User can just reload page manually and that's solve the problem, but we can do better and completely remove this bug with this little but very useful hook.

// We mainly test different scenarios of auth token issues. If one of the conditions is true - we forcefully executing 'signout' and redirecting user to "Signin" page.
export const useAuthGuard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Case 1: No token at all.
  const handleNoToken = () => {
    console.warn('No token found — redirecting to \'Signin\' page.');
    dispatch(signout());
    navigate('/signin', { replace: true });
  };

  // Case 2: Token is expired.
  const handleExpiredToken = () => {
    console.warn('Token expired — redirecting to \'Signin\' page.');
    dispatch(signout());
    navigate('/signin', { replace: true });
  };

  // Case 3: Invalid token format.
  const handleInvalidToken = (err) => {
    console.error('Invalid token — redirecting to \'Signin\' page.', err);
    dispatch(signout());
    navigate('/signin', { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      handleNoToken();
      return;
    }

    try {
      const payload = jwtDecode(token);

      // 'payload.exp' value in seconds, 'Date.now()' value in milliseconds, so we need to multiply 'payload.exp' value by 1000.
      if (payload.exp * 1000 < Date.now()) {
        handleExpiredToken();
        return;
      }
    } catch (err) {
      handleInvalidToken(err);
    }
  }, [dispatch, navigate]);
};
