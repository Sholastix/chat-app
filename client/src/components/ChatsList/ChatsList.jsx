import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import styles from './ChatsList.module.css';

const ChatsList = () => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const chatState = useSelector((state) => {
    return state.chatReducer;
  });

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  return (
    <div className={styles.container}>ChatsList</div>
  );
};

export default ChatsList;