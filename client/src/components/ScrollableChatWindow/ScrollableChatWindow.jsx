import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';

// Styles.
import styles from './ScrollableChatWindow.module.css';

const ScrollableChatWindow = ({ messages }) => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  return (
    <Box
      component='div'
      sx={{
        borderRadius: '0.5rem',
        height: '100%',
        overflowY: 'scroll',
        padding: '1rem',
        scrollbarWidth: 'none',
      }}
    >
      {
        messages.map((message) => (
          // <Box
          //   component='div'
          //   key={message._id}
          //   sx={{
          //     alignSelf: 'flex-end',
          //     backgroundColor: 'rgb(200, 240, 200)',
          //     borderRadius: '1rem 1rem 0rem 1rem',
          //     fontSize: '1.6rem',
          //     marginBottom: '1rem',
          //     overflowWrap: 'break-word',
          //     padding: '1rem',
          //     maxWidth: '50%',
          //     width: 'fit-content'
          //   }}
          // >
          //   {message.content}
          // </Box>

          <div
            key={message._id}
            className={styles.message}
          >
            <div
              className={authState.user._id === message.sender._id ? styles.messageContentMe : styles.messageContentOther}
            >
              {message.content}
            </div>
          </div>
        ))
      }
    </Box>
  );
};

export default ScrollableChatWindow;