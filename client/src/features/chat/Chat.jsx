import { useState, Fragment } from 'react';
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
  const [fetchAgain, setFetchAgain] = useState(false);

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
              <ChatsList fetchAgain={fetchAgain} />
              <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
            </div>
          </div>
          :
          <Spinner />
      }
    </Fragment>
  );
};

export default Chat;