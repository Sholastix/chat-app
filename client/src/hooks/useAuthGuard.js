import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';

// Functions.
import { signout } from '../features/auth/authSlice';

// This hook mainly for "Edge" (and Chromium-based browsers with 'session resume' features), especially when users have 'Continue where you left off' option enabled in settings.
// The app in "Edge" never fully restarts like in "Chrome"/"Firefox" — it resumes mid-execution, like you never left.
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

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Case 1: No token at all.
    if (!token) {
      console.warn('No token found — redirecting to signin.');
      
      dispatch(signout());
      navigate('/signin', { replace: true });
      return;
    }

    // try {
    //   const payload = jwtDecode(token);

    //   // Case 2: Token is expired.
    //   // 'payload.exp' value in milliseconds, 'Date.now()' value in seconds, so we need to multiply 'payload.exp' value by 1000.
    //   if (payload.exp * 1000 < Date.now()) {
    //     console.warn('Token expired — redirecting to signin.');

    //     dispatch(signout());
    //     navigate('/signin', { replace: true });
    //   }
    // } catch (err) {
    //   // Case 3: Invalid token format.
    //   console.warn('Invalid token — redirecting to signin.');

    //   dispatch(signout());
    //   navigate('/signin', { replace: true });
    // }
  }, [dispatch, navigate]);
};
