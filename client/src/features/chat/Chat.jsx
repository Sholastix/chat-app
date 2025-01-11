import { useDispatch } from 'react-redux';

// Styles.
import styles from './Chat.module.css';

// Components.
import ChatBox from '../../components/ChatBox/ChatBox';
import ChatsList from '../../components/ChatsList/ChatsList';
import Header from '../../components/Header/Header';
import SideModal from '../../components/ModalWindows/SideModal/SideModal';

// Functions.
import { signout } from '../auth/authSlice';
import { socket } from '../../socket/socket';

const Chat = () => {
  // // This constant will be used to dispatch ACTIONS when we need it.
  // const dispatch = useDispatch();

  // // Sign out user.
  // const logOut = () => {
  //   try {
  //     dispatch(signout());
  //   } catch (err) {
  //     console.error(err);
  //   };
  // };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.chatContainer}>
        <SideModal />
        <ChatBox />
        <ChatsList />
      </div>
    </div>
  );
};

export default Chat;