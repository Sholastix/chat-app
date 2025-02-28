import { useState, useEffect, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import axios from 'axios';
import {
  Box,
  FormControl,
  IconButton,
  TextField,
  Typography
} from '@mui/material';

// Socket.IO
import { socket } from '../../socket/socket';

// MUI Icons.
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Components.
import ProfileModal from '../ModalWindows/ProfileModal/ProfileModal';
import ScrollableChatWindow from '../ScrollableChatWindow/ScrollableChatWindow';
import Spinner from '../Spinner/Spinner';
import UpdateGroupChatModal from '../ModalWindows/UpdateGroupChatModal/UpdateGroupChatModal';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Functions.
import { resetSelectedChatState } from '../../features/chat/chatSlice';
import { getSender, getFullSender } from '../../helpers/chatLogic';

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
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
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSocketConnected, setIsSocketConnected] = useState(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUpdateGroupChatModalOpen, setIsUpdateGroupChatModalOpen] = useState(false);

  // User connects to the app.
  useEffect(() => {
    // // Catch-all listener for all events, useful in development process.
    // socket.onAny((event, ...args) => {
    //   console.log(`Event '${event}' with arguments: `, ...args);
    // });

    socket.emit('addUser', authState.user._id);

    socket.on('users_online', (data) => {
      console.log('USERS_ONLINE: ', data);
    });

    return () => {
      // socket.offAny();

      socket.off('users_online');
    };
  }, []);

  // Fetch all messages for specific chat every time when STATE of 'selected chat' property changed.
  useEffect(() => {
    fetchMessages();
  }, [chatState.selectedChat]);

  // Reset STATE for selected chat.
  const resetSelectedChat = () => {
    try {
      dispatch(resetSelectedChatState());
    } catch (err) {
      console.error(err);
    };
  };

  // Typing handler.
  const handleTyping = (event) => {
    try {
      setNewMessage(event.target.value);

      // Later we will add here logic for typing indication.
    } catch (err) {
      console.error(err);
    };
  };

  // Fetch all messages for specific chat (maybe later we will put this logic in REDUX).
  const fetchMessages = async (event) => {
    try {
      if (!chatState.selectedChat) {
        return;
      };

      const chatId = chatState.selectedChat._id;

      setMessageLoading(true);

      const { data } = await axios.get(`http://localhost:5000/api/chat/messages/${chatId}`);

      console.log('FETCH_MESSAGES: ', data);

      setMessages(data);
      setMessageLoading(false);
    } catch (err) {
      console.error(err);
    };
  };

  // Send message (maybe later we will put this logic in REDUX).
  const sendMessage = async (event) => {
    try {
      if (event.key === 'Enter' && newMessage.trim().length > 0) {
        const chatId = chatState.selectedChat._id;

        const { data } = await axios.post('http://localhost:5000/api/chat/message', {
          chatId: chatId,
          messageContent: newMessage
        });

        console.log('SEND_MESSAGE: ', data);

        setMessages([...messages, data]);
        setNewMessage('');
      };
    } catch (err) {
      console.error(err);
    };
  };

  return (
    <Fragment>
      {
        chatState.loading
          ?
          <Box
            component='div'
            sx={{
              alignItems: 'center',
              display: 'flex',
              height: '100%',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            <Spinner />
          </Box>
          :
          chatState.selectedChat ? (
            <Box
              component='div'
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
              }}
            >
              <Box
                component='div'
                sx={{
                  alignItems: 'center',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  fontSize: { xs: '2.5rem', md: '3rem' },
                  height: '6rem',
                  justifyContent: { xs: 'space-between', md: 'center' },
                  marginBottom: '1rem',
                  padding: '0rem 1rem',
                  width: '100%'
                }}
              >
                <IconButton
                  sx={{
                    display: { xs: 'flex', md: 'none' },
                    margin: '0.5rem 1rem'
                  }}
                  onClick={resetSelectedChat}
                >
                  <ArrowBackIcon sx={{ fontSize: '3rem' }} />
                </IconButton>

                {
                  !chatState.selectedChat.isGroupChat
                    ?
                    <Fragment>
                      {
                        getSender(authState.user, chatState.selectedChat.users)
                      }
                      <IconButton
                        sx={{ marginLeft: '1rem' }}
                        onClick={() => { setIsProfileModalOpen(true) }}
                      >
                        <VisibilityIcon sx={{ fontSize: '2rem' }} />
                      </IconButton>
                      <ProfileModal
                        isProfileModalOpen={isProfileModalOpen}
                        setIsProfileModalOpen={setIsProfileModalOpen}
                        user={getFullSender(authState.user, chatState.selectedChat.users)}
                      />
                    </Fragment>
                    :
                    <Fragment>
                      {
                        chatState.selectedChat.chatName
                      }
                      <IconButton
                        sx={{ marginLeft: '1rem' }}
                        onClick={() => { setIsUpdateGroupChatModalOpen(true) }}
                      >
                        <VisibilityIcon sx={{ fontSize: '2rem' }} />
                      </IconButton>
                      <UpdateGroupChatModal
                        isUpdateGroupChatModalOpen={isUpdateGroupChatModalOpen}
                        setIsUpdateGroupChatModalOpen={setIsUpdateGroupChatModalOpen}
                        fetchAgain={fetchAgain}
                        setFetchAgain={setFetchAgain}
                      />
                    </Fragment>
                }
              </Box>

              <Box
                component='div'
                sx={{
                  borderRadius: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'flex-end',
                  overflowY: 'hidden',
                  // padding: '1rem'
                }}
              >
                {
                  messageLoading
                    ?
                    <Box
                      component='div'
                      sx={{
                        alignItems: 'center',
                        display: 'flex',
                        height: '100%',
                        justifyContent: 'center',
                        width: '100%'
                      }}
                    >
                      <Spinner />
                    </Box>
                    :
                    <ScrollableChatWindow messages={messages} />
                }
              </Box>

              <FormControl>
                <TextField
                  label='Type your message...'
                  variant='outlined'
                  slotProps={{
                    inputLabel: { sx: { fontSize: '1.4rem' } }
                  }}
                  sx={{
                    backgroundColor: 'white',
                    margin: '2rem 1rem 1rem',
                    '.MuiOutlinedInput-notchedOutline': { fontSize: '1.4rem' },
                    '.MuiInputBase-input': { fontSize: '1.4rem' },
                  }}
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyDown={sendMessage}
                >
                </TextField>
              </FormControl>
            </Box>
          ) : (
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                height: '100%',
                justifyContent: 'center',
                width: '100%'
              }}>
              <Typography
                sx={{
                  fontSize: '3rem',
                }}
              >
                Please select collocutor from chats list.
              </Typography>
            </Box>
          )
      }
    </Fragment>
  );
};

export default SingleChat;