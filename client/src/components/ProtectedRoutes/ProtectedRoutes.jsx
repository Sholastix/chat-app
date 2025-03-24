import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// 'useSelector' hook used to get hold of any STATE that is maintained in the Redux STORE.
import { useSelector, useDispatch } from 'react-redux';

// Functions.
import { isUserSignedIn } from '../../features/auth/authSlice';

// 'children' is the component (route's element), which wrapped by 'ProtectedRoute'.
// 'ProtectedRoutes' works as wrapping component, can't work as layout component.
// 'Outlet' renders child route elements if there is any. Works as layout component, can't work as wrapping component.
const ProtectedRoutes = (props) => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(isUserSignedIn());
  }, []);

  if (!authState.loading && !authState.isAuthenticated) {
    return <Navigate to='/signin' replace={true} />;
  };

  // Switching between 'children' and 'Outlet' allows to 'wrap' routes in auth protection individually (with wrapper) or as group (with layout). 
  // Layout can also be used to protect individual route, but that would be a waste of space :)
  return props.children ? props.children : <Outlet />;
};

export default ProtectedRoutes;