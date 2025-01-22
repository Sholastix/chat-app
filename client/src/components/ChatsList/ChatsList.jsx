import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography
} from '@mui/material';

// MUI Icons.
import AddIcon from '@mui/icons-material/Add';

// Components.
import UserSearchLoading from '../UserSearchLoading/UserSearchLoading';
import Spinner from '../Spinner/Spinner';

// Functions.
import { fetchChats } from '../../features/chat/chatSlice';
import { getSender } from '../../helpers/chatLogic';

const ChatsList = () => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  const chatState = useSelector((state) => {
    return state.chatReducer;
  });

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  const getAllChats = () => {
    try {
      dispatch(fetchChats());
    } catch (err) {
      console.error(err);
    };
  };

  useEffect(() => {
    getAllChats();
  }, []);

  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 0.5rem 1rem 0 rgba(0, 0, 0, 0.3)',
        // display: { xs: chatState.selectedChat ? 'none' : 'flex', md: 'flex' },
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        width: '20%'
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          height: '5rem',
          padding: '1rem',
          width: '100%'
        }}
      >
        <Typography
          sx={{
            fontSize: '2rem'
          }}
        >
          ChatsList
        </Typography>

        <Button
          endIcon={<AddIcon sx={{ color: 'black' }} />}
          sx={{
            backgroundColor: 'rgb(235, 235, 235)',
            borderRadius: '0.5rem',
          }}
        >
          <Typography
            sx={{
              color: 'black',
              fontSize: '1.5rem',
              textTransform: 'none',
            }}
          >
            New Group Chat
          </Typography>
        </Button>
      </Box>

      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          // overflowY: 'auto',
          marginTop: '1rem',
          padding: '1rem',
          width: '100%'
        }}
      >
        {/* {chatState.loading && <Spinner />} */}
        <Stack
          sx={{
            overflowY: 'auto',
            width: '100%'
          }}
        >
          {
            chatState.chats.map((chat) => (
              <Box
                component='div'
                key={chat._id}
                sx={{
                  // backgroundColor: 'white',
                  border: '0.1rem solid lightgray',
                  borderRadius: '0.5rem',
                  color: 'black',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  padding: '2rem 3rem',
                  // width: '100%'
                  ':hover': { boxShadow: '0 0.2rem 1rem 0 rgba(0, 0, 0, 0.3)' },
                  ':focus': { backgroundColor: 'red' }
                }}
                // Later we must add here an action which will set 'selectedChat' property from chat STATE to current mapped chat (ex.: 'onClick={() => setSelectedChat(chat)}').
                onClick={() => console.log('Hello, World')}
              >
                <Typography
                  sx={{
                    fontSize: '1.4rem',
                    fontWeight: '500'
                  }}
                >
                  {!chat.isGroupChat ? getSender(authState.user, chat.users) : (chat.chatName)}
                </Typography>
              </Box>
            ))
          }
        </Stack>
      </Box>
    </Box>
  );
};

export default ChatsList;