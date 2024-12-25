import { Fragment } from 'react';
import { useDispatch } from 'react-redux';

// Styles.
import styles from './Chat.module.css';

// Functions.
import { signout } from '../auth/authSlice';
import { socket } from '../../socket/socket';

const Chat = () => {
  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  const logOut = () => {
    try {
      dispatch(signout());
    } catch (err) {
      console.error(err);
    };
  };

  return (
    <Fragment>
      <div className={styles.container}>Chat</div>
      <button type='button' onClick={logOut}>Logout</button>
    </Fragment>
  );
};

export default Chat;