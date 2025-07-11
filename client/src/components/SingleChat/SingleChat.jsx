import { useState, useEffect, useRef, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Box, FormControl, IconButton, TextField, Tooltip, Typography } from '@mui/material';

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

// Socket.IO
import { socket } from '../../socket/socket';

// Functions.
import { getSender, getFullSender, truncateText } from '../../helpers/chatLogic';
import { resetSelectedChatState, onlineUsers } from '../../features/chat/chatSlice';

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const authState = useSelector((state) => {
    return state.authReducer;
  });

  const chatState = useSelector((state) => {
    return state.chatReducer;
  });

  const dispatch = useDispatch();

  // STATE.
  const [isTyping, setIsTyping] = useState(false);
  const [lastOnline, setLastOnline] = useState();
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [quotedMessage, setQuotedMessage] = useState(null);
  const [typingUser, setTypingUser] = useState('');

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUpdateGroupChatModalOpen, setIsUpdateGroupChatModalOpen] = useState(false);

  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socket.on('users_online', (data) => {
      dispatch(onlineUsers(data));
    });

    // Listen for typing event
    socket.on('typing', (username) => {
      setIsTyping(true);
      setTypingUser(username);

      // Clear any existing timeout if typing has resumed.
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set a new timeout to hide the typing indicator after 3 seconds.
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setTypingUser('');
      }, 3000);
    });

    socket.on('mark_one_message_as_read', ({ messageId }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg._id === messageId ? { ...msg, isRead: true } : msg))
      );
    });

    socket.on('mark_all_messages_as_read', (updatedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg._id === updatedMessage._id ? { ...msg, isRead: true } : msg))
      );
    });

    socket.on('message_edited', (editedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === editedMessage._id
            ? {
                ...msg,
                content: editedMessage.content,
                isEdited: editedMessage.isEdited,
                updatedAt: editedMessage.updatedAt,
              }
            : msg
        )
      );
    });

    socket.on('message_hidden', (hiddenMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === hiddenMessage._id
            ? hiddenMessage
            : msg
        )
      );
    });

    socket.on('message_unhidden', (unhiddenMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === unhiddenMessage._id
            ? unhiddenMessage
            : msg
        )
      );
    });

    socket.on('message_deleted', (deletedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === deletedMessage._id
            ? {
                ...msg,
                isDeleted: deletedMessage.isDeleted,
              }
            : msg
        )
      );
    });

    window.addEventListener('keydown', cancelQuotedMessage);

    return () => {
      socket.off('typing');
      socket.off('mark_one_message_as_read');
      socket.off('mark_all_messages_as_read');
      socket.off('message_edited');
      socket.off('message_hidden');
      socket.off('message_unhidden');
      socket.off('message_deleted');

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      window.removeEventListener('keydown', cancelQuotedMessage);
    };
  }, []);

  useEffect(() => {
    socket.on('message_received', async (data) => {
      // Incoming message will have pop-up sound (only if the chat window is unfocused or hidden).
      if (!document.hasFocus() || document.visibilityState === 'hidden') {
        messageNotificationSound();
      }
      
      setMessages((prevMessages) => [...prevMessages, data]);
      setIsTyping(false);
      setTypingUser('');
    });

    return () => {
      socket.off('message_received');
    };
  });

  // Fetch all messages for specific chat every time when STATE of 'selected chat' property changed.
  useEffect(() => {
    fetchMessages();

    // Fetch online status at first chat select.
    fetchLastOnline();

    socket.emit('room_join',
      chatState.selectedChat?._id,
      chatState.selectedChat?.users,
      authState.user.username,
      authState.user._id
    );

    // Update 'lastOnline' status on connect/disconnect.
    socket.on('last_online_update', ({ userId, lastOnline }) => {
      const selectedUsers = chatState.selectedChat?.users;
      const loggedInUser = authState.user;

      if (!selectedUsers || selectedUsers.length < 2 || !loggedInUser?._id) {
        return;
      }

      // Defining our collocutor.
      const collocutor = getFullSender(loggedInUser, selectedUsers);

      if (collocutor?._id === userId) {
        if (lastOnline === null) {
          setLastOnline('Online');

          return;
        }

        // Formatting date for display in UI.
        const formattedDate = new Date(lastOnline).toLocaleString(navigator.language, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        });

        setLastOnline(`Last online: ${formattedDate}`);
      }
    });

    return () => {
      socket.off('last_online_update');
    };
  }, [chatState.selectedChat]);

  // Fetch 'lastOnline' status for our collocutor in private chat.
  const fetchLastOnline = async () => {
    try {
      if (!chatState.selectedChat || chatState.selectedChat.isGroupChat) {
        return;
      }

      const collocutor = getFullSender(authState.user, chatState.selectedChat.users);
      const { data } = await axios.get(`/api/user/${collocutor._id}`);

      if (data?.lastOnline) {
        // Formatting date for display in UI.
        const formattedDate = new Date(data.lastOnline).toLocaleString(navigator.language, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        });

        setLastOnline(`Last online: ${formattedDate}`);
      } else {
        setLastOnline('Online');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset STATE for selected chat.
  const resetSelectedChat = () => {
    try {
      dispatch(resetSelectedChatState(null));
      setNewMessage('');
      setFetchAgain(!fetchAgain);

      socket.emit('room_leave', chatState.selectedChat._id, authState.user.username, authState.user._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Typing handler.
  const handleTyping = (event) => {
    try {
      setNewMessage(event.target.value);

      // Logic for typing indication.
      if (!socket.connected) {
        return;
      }

      // Emit typing event to the server (to the specific room) when the user is typing.
      socket.emit('typing', chatState.selectedChat._id, authState.user.username);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all messages for specific chat (maybe later we will put this logic in REDUX).
  const fetchMessages = async () => {
    try {
      if (!chatState.selectedChat) {
        return;
      }

      setMessageLoading(true);

      const { data } = await axios.get(`/api/chat/messages/${chatState.selectedChat._id}`);

      setMessages(data);
      setMessageLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Send message (maybe later we will put this logic in REDUX).
  const sendMessage = async () => {
    try {
      if (newMessage.trim().length > 0) {
        const { data } = await axios.post('/api/chat/message', {
          chatId: chatState.selectedChat._id,
          messageContent: newMessage,
          replyTo: quotedMessage?._id || null,
        });

        socket.emit('message_send', chatState.selectedChat._id, data);
        setMessages([...messages, data]);
        setNewMessage('');
        setQuotedMessage(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel quoted message by pressing 'Escape' button.
  const cancelQuotedMessage = (event) => {
    if (event.key === 'Escape') {
      setQuotedMessage(null);
    }
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
    }
  };

  return (
    <Fragment>
      {chatState.loading ? (
        <Box
          component='div'
          sx={{
            alignItems: 'center',
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Spinner />
        </Box>
      ) : chatState.selectedChat ? (
        <Box component='div' sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
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
              width: '100%',
            }}
          >
            <IconButton
              sx={{
                display: { xs: 'flex', md: 'none' },
                margin: '0.5rem 1rem',
              }}
              onClick={resetSelectedChat}
            >
              <ArrowBackIcon sx={{ fontSize: '3rem' }} />
            </IconButton>

            {!chatState.selectedChat.isGroupChat ? (
              <Fragment>
                <Box component='div' sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography component='div' sx={{ display: 'flex', fontSize: '2.5rem' }}>
                    {getSender(authState.user, chatState.selectedChat.users)}
                  </Typography>

                  <Typography
                    component="p"
                    sx={{ fontSize: '1.4rem', color: `${lastOnline && lastOnline === 'Online' ? 'green' : 'darkred'}` }}
                  >
                    {lastOnline}
                  </Typography>
                </Box>

                <IconButton
                  sx={{ marginLeft: '1rem' }}
                  onClick={() => {
                    setIsProfileModalOpen(true);
                  }}
                >
                  <VisibilityIcon sx={{ fontSize: '2rem' }} />
                </IconButton>

                <ProfileModal
                  isProfileModalOpen={isProfileModalOpen}
                  setIsProfileModalOpen={setIsProfileModalOpen}
                  user={getFullSender(authState.user, chatState.selectedChat.users)}
                />
              </Fragment>
            ) : (
              <Fragment>
                {chatState.selectedChat.chatName}

                <IconButton
                  sx={{ marginLeft: '1rem' }}
                  onClick={() => {
                    setIsUpdateGroupChatModalOpen(true);
                  }}
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
            )}
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
            }}
          >
            {messageLoading ? (
              <Box
                component='div'
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  height: '100%',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <Spinner />
              </Box>
            ) : (
              <ScrollableChatWindow
                isTyping={isTyping}
                chatId={chatState.selectedChat._id}
                messages={messages}
                setMessages={setMessages}
                setQuotedMessage={setQuotedMessage}
                typingUser={typingUser}
              />
            )}
          </Box>

          {quotedMessage && (
            <Box
              component='div'
              id='message-quoted'
              sx={{
                backgroundColor: '#f0f0f0',
                borderRadius: '0.5rem',
                borderLeft: '0.5rem solid rgb(93, 109, 126)',
                margin: '1rem 7rem 0rem 1rem',
                padding: '0.5rem 1rem',
                position: 'relative',
              }}
            >
              <Typography sx={{ fontSize: '1.4rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                Replying to: <strong>{quotedMessage?.sender?.username}</strong>
              </Typography>

              <Typography sx={{ fontSize: '1.4rem', fontStyle: 'italic' }}>
                <strong>{truncateText(quotedMessage.content, 100)}</strong>
              </Typography>

              <IconButton
                size='small'
                onClick={() => setQuotedMessage(null)}
                sx={{ position: 'absolute', right: 4, top: 4 }}
              >
                ✖
              </IconButton>
            </Box>
          )}

          <FormControl
            component='div'
            sx={{
              alignItems: 'flex-end',
              display: 'flex',
              flexDirection: 'row', // default value for <FormControl /> Component is 'column', so we need to change it... or we can use <Box /> Component instead.
              padding: '1rem 1rem 1rem 0rem',
            }}
          >
            <TextField
              autoComplete='off'
              label='Type your message...'
              multiline
              variant='outlined'
              slotProps={{
                inputLabel: { sx: { fontSize: '1.4rem' } },
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
            ></TextField>

            <Tooltip
              title='Send message'
              arrow
              enterDelay={500}
              enterNextDelay={500}
              placement='top-start'
              slotProps={{
                tooltip: { sx: { fontSize: '1.2rem', backgroundColor: 'rgb(93, 109, 126)', color: 'white' } },
                arrow: { sx: { color: 'rgb(93, 109, 126)' } },
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
                    cursor: 'pointer',
                  },
                }}
                onClick={sendMessage}
              >
                <SendRoundedIcon sx={{ color: 'white', height: '2.5rem', width: '2.5rem' }} />
              </IconButton>
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
            width: '100%',
          }}
        >
          <Typography sx={{ fontSize: '3rem' }}>Please select collocutor from chats list.</Typography>
        </Box>
      )}
    </Fragment>
  );
};

export default SingleChat;
