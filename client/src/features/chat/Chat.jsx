import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
// 'useSelector' hook used to get hold of any STATE that is maintained in the Redux STORE.
import { useSelector, useDispatch } from 'react-redux';

// Styles.
import styles from './Chat.module.css';

import { isUserSignedIn } from '../auth/authSlice';

const Chat = () => {
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

  return (
    <div className={styles.container}>Chat</div>
  );
};

export default Chat;