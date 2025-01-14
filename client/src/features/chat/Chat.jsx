import { Fragment } from 'react';
import { useSelector } from 'react-redux';

// Styles.
import styles from './Chat.module.css';

// Components.
import ChatBox from '../../components/ChatBox/ChatBox';
import ChatsList from '../../components/ChatsList/ChatsList';
import Header from '../../components/Header/Header';
import Spinner from '../../components/Spinner/Spinner';

// Functions.
import { socket } from '../../socket/socket';

const Chat = () => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  return (
    <Fragment>
      {
        !authState.loading && authState.user
          ?
          <div className={styles.container}>
            <Header />
            <div className={styles.chatContainer}>
              <ChatBox />
              <ChatsList />
            </div>
          </div>
          :
          <Spinner />
      }
    </Fragment>
  );
};

export default Chat;