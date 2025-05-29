import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// 'children' is the component (route's element), which wrapped by 'ProtectedRoute'.
// 'ProtectedRoutes' works as wrapping component, can't work as layout component.
// 'Outlet' renders child route elements if there is any. Works as layout component, can't work as wrapping component.
const ProtectedRoutes = (props) => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => state.authReducer);

  if (!authState.loading && !authState.isAuthenticated) {
    return <Navigate to='/signin' replace={true} />;
  }

  // Switching between 'children' and 'Outlet' allows to 'wrap' routes in auth protection individually (with wrapper) or as group (with layout).
  // Layout can also be used to protect individual route, but that would be a waste of space :)
  return props.children ? props.children : <Outlet />;
};

export default ProtectedRoutes;
