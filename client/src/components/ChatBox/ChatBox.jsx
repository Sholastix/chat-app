import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Button,
  Stack,
  Typography
} from '@mui/material';

// Components.
import SingleChat from '../SingleChat/SingleChat';

const ChatBox = (props) => {
  const chatState = useSelector((state) => {
    return state.chatReducer;
  });

  const selectedChat = chatState.selectedChat;

  console.log('SELECTED_CHAT: ', selectedChat);

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        display: { xs: chatState.selectedChat ? 'flex' : 'none', md: 'flex' },
        // display: 'flex',
        fontSize: '3rem',
        padding: '1rem',
        width: { xs: '100%', md: '74%' },
        // width: '74%'
      }}
    >
      <SingleChat fetchAgain={props.fetchAgain} setFetchAgain={props.setFetchAgain} />
    </Box>
  );
};

export default ChatBox;