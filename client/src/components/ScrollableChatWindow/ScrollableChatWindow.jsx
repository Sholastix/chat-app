import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';

// Styles.
import styles from './ScrollableChatWindow.module.css';

const ScrollableChatWindow = ({ messages }) => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  // const [scrollbarPosition, setScrollbarPosition] = useState(0);

  const chatEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // // Calculate the scrollbar position in percentage.
  // const handleScroll = (event) => {
  //   const { scrollTop, scrollHeight, clientHeight } = event.target;
  //   const position = Math.ceil((scrollTop / (scrollHeight - clientHeight)) * 100);
  //   // console.log('POSITION: ', position);
  //   setScrollbarPosition(position);
  // };

  // Auto-scrolling chat to the end.
  const scrollToBottom = () => {
    try {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    };
  };

  return (
    <Box
      component='div'
      sx={{
        borderRadius: '0.5rem',
        height: '100%',
        overflowY: 'scroll',
        padding: '1rem',
        scrollbarWidth: 'thin',
      }}
      // onScroll={handleScroll}
    >
      {
        messages.map((message) => (
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

      <Box component='div' ref={chatEndRef} />
    </Box>
  );
};

export default ScrollableChatWindow;