import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';

// Components.
import SingleChat from '../SingleChat/SingleChat';

const ChatBox = (props) => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const chatState = useSelector((state) => {
    return state.chatReducer;
  });

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        display: { xs: chatState.selectedChat ? 'flex' : 'none', md: 'flex' },
        fontSize: '3rem',
        padding: '1rem',
        width: { xs: '100%', md: '74%' },
      }}
    >
      <SingleChat
        fetchAgain={props.fetchAgain}
        setFetchAgain={props.setFetchAgain}
      />
    </Box>
  );
};

export default ChatBox;