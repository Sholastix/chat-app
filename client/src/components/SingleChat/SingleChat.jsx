import { useState, useEffect, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUpdateGroupChatModalOpen, setIsUpdateGroupChatModalOpen] = useState(false);

  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [selectedChatCompare, setSelectedChatCompare] = useState(null);

  const [typing, setTyping] = useState(false);
  const [isTypingIndicatorVisible, setIsTypingIndicatorVisible] = useState(false);

  // User connects to the app.
  useEffect(() => {
    socket.emit('user_add', authState.user);

    socket.on('connected', (data) => {
      setIsSocketConnected(true);
      console.log('CONNECTED: ', data);
    });

    socket.on('typing', () => setIsTypingIndicatorVisible(true));

    socket.on('stop_typing', () => setIsTypingIndicatorVisible(false));

    socket.on('users_online', (data) => {
      console.log('USERS_ONLINE: ', data);
    });

    return () => {
      socket.off('connected');
      socket.off('typing');
      socket.off('stop_typing');
      socket.off('users_online');
    };
  }, []);

  useEffect(() => {
    socket.on('message_received', (data) => {
      if (selectedChatCompare === null || selectedChatCompare._id !== data.chat._id) {
        // Add new notification.
      } else {
        setMessages([...messages, data]);
      };
    });

    return () => {
      socket.off('message_received');
    };
  });

  // Fetch all messages for specific chat every time when STATE of 'selected chat' property changed.
  useEffect(() => {
    fetchMessages();

    setSelectedChatCompare(chatState.selectedChat);
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

      // Logic for typing indication.
      if (!isSocketConnected) {
        return;
      };

      if (!typing) {
        setTyping(true);
        socket.emit('typing', chatState.selectedChat._id);
      };

      console.log('TYPING_(handleTyping): ', typing);

      const timeout = 3000;
      const lastTypingTime = new Date().getTime();

      // Disable typing indicator after 3 second of user's typing inactivity.
      setTimeout(() => {
        const currentTime = new Date().getTime();
        const timeDifference = currentTime - lastTypingTime;

        if (timeDifference >= timeout && typing) {
          socket.emit('stop_typing', chatState.selectedChat._id);
          setTyping(false);
        };
      }, timeout);
    } catch (err) {
      console.error(err);
    };
  };

  console.log('TYPING_AFTER: ', typing);

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

      socket.emit('room_join', chatId);
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

        socket.emit('message_send', data);
        setMessages([...messages, data]);
        setNewMessage('');

        socket.emit('stop_typing', chatState.selectedChat._id);
        setTyping(false);
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
                    <ScrollableChatWindow messages={messages} isTypingIndicatorVisible={isTypingIndicatorVisible} />
                }
              </Box>

              <FormControl>
                <TextField
                  autoComplete='off'
                  label='Type your message...'
                  variant='outlined'
                  slotProps={{
                    inputLabel: { sx: { fontSize: '1.4rem' } }
                  }}
                  sx={{
                    backgroundColor: 'white',
                    margin: '0rem 1rem 1rem',
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