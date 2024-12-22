import React from 'react';
import { io } from 'socket.io-client';

// Styles.
import styles from './Chat.module.css';

const URL = import.meta.env.VITE_HOST;

io(URL);

const Chat = () => {
  return (
    <div className={styles.container}>Chat</div>
  );
};

export default Chat;