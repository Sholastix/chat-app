import { useDispatch } from 'react-redux';

// Styles.
import styles from './Chat.module.css';

// Functions.
import { signout } from '../auth/authSlice';
import { socket } from '../../socket/socket';

const Chat = () => {
  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  // Sign out user.
  const logOut = () => {
    try {
      dispatch(signout());
    } catch (err) {
      console.error(err);
    };
  };

  return (
    <div className={styles.container}>
      {/* <button type='button' onClick={logOut}>Logout</button> */}
    </div>
  );
};

export default Chat;