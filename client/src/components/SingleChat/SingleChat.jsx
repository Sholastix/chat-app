import { useState, useEffect, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  Box,
  FormControl,
  IconButton,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';

// Socket.IO
import { socket } from '../../socket/socket';

// Assets.
import messageSound from '../../assets/sounds/messageSound.mp3';

// MUI Icons.
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

// Components.
import ProfileModal from '../ModalWindows/ProfileModal/ProfileModal';
import ScrollableChatWindow from '../ScrollableChatWindow/ScrollableChatWindow';
import Spinner from '../Spinner/Spinner';
import UpdateGroupChatModal from '../ModalWindows/UpdateGroupChatModal/UpdateGroupChatModal';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Functions.
import { updateUser } from '../../features/auth/authSlice';
import { getSender, getFullSender } from '../../helpers/chatLogic';
import { resetSelectedChatState, onlineUsers } from '../../features/chat/chatSlice';

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
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isTypingIndicatorVisible, setIsTypingIndicatorVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChatCompare, setSelectedChatCompare] = useState(null);
  const [typing, setTyping] = useState(false);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUpdateGroupChatModalOpen, setIsUpdateGroupChatModalOpen] = useState(false);

  useEffect(() => {
    console.log('SOCKET_STATUS: ', socket.connected);
    console.log('IS_SOCKET_CONNECTED: ', isSocketConnected);

    if (socket.connected === false) {
      socket.connect();
    };
  });
  
  // User connects to the app.
  useEffect(() => {
    socket.on('connected', (data) => {
      setIsSocketConnected(true);
      console.log('CONNECTED: ', data);
    });

    socket.emit('user_add', authState.user);

    socket.on('typing', () => setIsTypingIndicatorVisible(true));

    socket.on('stop_typing', () => setIsTypingIndicatorVisible(false));

    socket.on('users_online', (data) => {
      console.log('USERS_ONLINE: ', data);
      dispatch(onlineUsers(data));
    });

    socket.on('disconnect', (reason) => {
      setIsSocketConnected(false);
      console.log(reason);
      console.log('SOCKET_STATUS: ', socket.connected);
    });

    return () => {
      socket.off('connected');
      socket.off('typing');
      socket.off('stop_typing');
      socket.off('users_online');
      socket.off('disconnect');
    };
  }, []);

  useEffect(() => {
    socket.on('message_received', (data) => {
      // Incoming message will have pop-up sound (only if the chat window is unfocused).
      !document.hasFocus() && messageNotificationSound();

      if (selectedChatCompare === null || selectedChatCompare._id !== data.chat._id) {
        if (!authState.user.notifications.includes(data)) {
          const id = authState.user._id;
          const notifications = authState.user.notifications;
          const newNotification = data;
          const updNotifications = [...notifications, newNotification];

          dispatch(updateUser({ id, updNotifications }));
          setFetchAgain(!fetchAgain);
        };
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
      dispatch(resetSelectedChatState(null));
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

  // Fetch all messages for specific chat (maybe later we will put this logic in REDUX).
  const fetchMessages = async (event) => {
    try {
      if (!chatState.selectedChat) {
        return;
      };

      const chatId = chatState.selectedChat._id;
      setMessageLoading(true);

      const { data } = await axios.get(`/api/chat/messages/${chatId}`);
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
      if (newMessage.trim().length > 0) {
        const chatId = chatState.selectedChat._id;

        const { data } = await axios.post('/api/chat/message', {
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

  // This part for 'pop-up message sound' functionality.
  const messageNotificationSound = () => {
    try {
      const sound = new Audio(messageSound);

      // Here we lowering initial sound's volume to 50% of it's initial value.
      sound.volume = 0.5;
      sound.play();
    } catch (err) {
      console.error(err);
    };
  };

  return (
    <Fragment>
      {
        chatState.loading
          ? <Box
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
          : chatState.selectedChat
            ? (<Box
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
                    ? <Fragment>
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
                    : <Fragment>
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
                  overflowY: 'hidden'
                }}
              >
                {
                  messageLoading
                    ? <Box
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
                    : <ScrollableChatWindow messages={messages} isTypingIndicatorVisible={isTypingIndicatorVisible} />
                }
              </Box>

              <FormControl
                component='div'
                sx={{
                  alignItems: 'flex-end',
                  display: 'flex',
                  flexDirection: 'row', // default value for <FormControl /> Component is 'column', so we need to change it... or we can use <Box /> Component instead.
                  padding: '1rem 1rem 1rem 0rem'
                }}
              >
                <TextField
                  autoComplete='off'
                  label='Type your message...'
                  multiline
                  variant='outlined'
                  slotProps={{
                    inputLabel: { sx: { fontSize: '1.4rem' } }
                  }}
                  sx={{
                    backgroundColor: 'white',
                    margin: '0rem 1rem',
                    width: '100%',
                    '.MuiOutlinedInput-notchedOutline': { fontSize: '1.4rem' },
                    '.MuiInputBase-input': { fontSize: '1.4rem' },
                  }}
                  value={newMessage}
                  onChange={handleTyping}
                >
                </TextField>

                <Tooltip
                  title='Send message'
                  arrow
                  enterDelay={500}
                  enterNextDelay={500}
                  placement='top-start'
                  slotProps={{
                    tooltip: { sx: { fontSize: '1.2rem', backgroundColor: 'rgb(93, 109, 126)', color: 'white' } },
                    arrow: { sx: { color: 'rgb(93, 109, 126)' } }
                  }}
                >
                  <IconButton
                    sx={{
                      alignItems: 'center',
                      backgroundColor: 'rgb(93, 109, 126)',
                      border: 'none',
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      height: '5rem',
                      width: '5rem',
                      ':hover': {
                        backgroundColor: 'rgb(93, 109, 126)',
                        boxShadow: '0 0.5rem 1rem 0 rgba(0, 0, 0, 0.3)',
                        cursor: 'pointer'
                      }
                    }}
                    onClick={sendMessage}
                  >
                    <SendRoundedIcon sx={{
                      color: 'white',
                      height: '2.5rem',
                      width: '2.5rem'
                    }}
                    />
                  </IconButton>

                  {/* <Box
                    component='button'
                    sx={{
                      alignItems: 'center',
                      backgroundColor: 'rgb(93, 109, 126)',
                      border: 'none',
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      height: '5rem',
                      width: '5rem',
                      ':hover': {
                        boxShadow: '0 0.5rem 1rem 0 rgba(0, 0, 0, 0.3)',
                        cursor: 'pointer'
                      }
                    }}
                    onClick={sendMessage}
                  >
                    <SendRoundedIcon sx={{ color: 'white', fontSize: '2.5rem' }} />
                  </Box> */}
                </Tooltip>

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