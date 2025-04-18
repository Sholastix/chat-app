import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Avatar,
  Box,
  Button,
  Stack,
  Typography
} from '@mui/material';

// MUI Icons.
import AddIcon from '@mui/icons-material/Add';

// Components.
import GroupChatModal from '../ModalWindows/GroupChatModal/GroupChatModal';
import OnlineStatus from '../OnlineStatus/OnlineStatus';
import ListLoading from '../ListLoading/ListLoading';

// Functions.
import { getFullSender, getSender } from '../../helpers/chatLogic';
import { fetchChats, fetchChat } from '../../features/chat/chatSlice';

const ChatsList = (props) => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  const chatState = useSelector((state) => {
    return state.chatReducer;
  });

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  // STATE.
  const [isGroupChatModalOpen, setIsGroupChatModalOpen] = useState(false);
  const [online, setOnline] = useState([]);

  useEffect(() => {
    getAllChats();
  }, [props.fetchAgain]);

  useEffect(() => {
    allOnlineUsers();
  }, [chatState.usersOnline]);

  // Open group chat's modal window.
  const handleGroupChatModalOpen = () => {
    try {
      setIsGroupChatModalOpen(true);
    } catch (error) {
      console.error(err);
    };
  };

  // Get all chats of the current user from DB.
  const getAllChats = () => {
    try {
      dispatch(fetchChats());
    } catch (err) {
      console.error(err);
    };
  };

  // Get one specific chat of the current user from DB.
  const getOneChat = async (chatId) => {
    try {
      dispatch(fetchChat(chatId));
    } catch (err) {
      console.error(err);
    };
  };

  // Get all online users.
  const allOnlineUsers = () => {
    setOnline(chatState.usersOnline);
  };

  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 0.5rem 1rem 0 rgba(0, 0, 0, 0.3)',
        display: { xs: chatState.selectedChat ? 'none' : 'flex', md: 'flex' },
        flexDirection: 'column',
        padding: '1rem',
        width: { xs: '100%', md: '25%' }
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
          onClick={handleGroupChatModalOpen}
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
          overflowX: 'hidden',
          overflowY: 'auto',
          marginTop: '1rem',
          padding: '1rem',
          width: '100%'
        }}
      >
        {
          chatState.chats
            ? <Stack
              sx={{
                width: '100%'
              }}
            >
              {
                chatState.chats.map((chat) => (
                  <Box
                    component='div'
                    key={chat._id}
                    sx={{
                      alignItems: 'center',
                      backgroundColor: 'white',
                      border: '0.1rem solid lightgray',
                      borderRadius: '0.5rem',
                      color: 'black',
                      cursor: 'pointer',
                      display: 'flex',
                      marginBottom: '1rem',
                      padding: '1rem 2rem',
                      ':hover': { boxShadow: '0 0.2rem 1rem 0 rgba(0, 0, 0, 0.3)' },
                    }}
                    onClick={() => getOneChat(chat._id)}
                  >
                    <Box
                      component='div'
                      sx={{ display: 'flex', marginRight: `${chat.isGroupChat && '2.5rem'}` }}
                    >
                      <Avatar
                        src={
                          !chat.isGroupChat
                            ? getFullSender(authState.user, chat.users).avatar
                            : 'https://img.icons8.com/parakeet-line/48/group.png'
                        }
                        sx={{ fontSize: '2rem' }}
                      />

                      {
                        !chat.isGroupChat && <OnlineStatus online={online} chat={chat} />
                      }
                    </Box>

                    <Typography
                      sx={{
                        fontSize: '1.4rem',
                        fontWeight: '500'
                      }}
                    >
                      {
                        !chat.isGroupChat ? getSender(authState.user, chat.users) : (chat.chatName)
                      }
                    </Typography>
                  </Box>
                ))
              }
            </Stack>
            : <ListLoading />
        }
      </Box>

      <GroupChatModal
        isGroupChatModalOpen={isGroupChatModalOpen}
        setIsGroupChatModalOpen={setIsGroupChatModalOpen}
      />
    </Box>
  );
};

export default ChatsList;