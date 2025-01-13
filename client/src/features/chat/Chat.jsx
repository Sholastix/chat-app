// Styles.
import styles from './Chat.module.css';

// Components.
import ChatBox from '../../components/ChatBox/ChatBox';
import ChatsList from '../../components/ChatsList/ChatsList';
import Header from '../../components/Header/Header';
import LeftDrawer from '../../components/ModalWindows/LeftDrawer/LeftDrawer';

// Functions.
import { socket } from '../../socket/socket';

const Chat = () => {
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.chatContainer}>
        <LeftDrawer />
        <ChatBox />
        <ChatsList />
      </div>
    </div>
  );
};

export default Chat;