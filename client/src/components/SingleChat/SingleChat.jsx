import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Box, FormControl, IconButton, TextField, Tooltip, Typography } from '@mui/material';

// Assets.
import messageSound from '../../assets/sounds/messageSound.mp3';

// MUI Icons.
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Components.
import ScrollableChatWindow from '../ScrollableChatWindow/ScrollableChatWindow';
import Spinner from '../Spinner/Spinner';

// Components (lazy-loaded).
const ProfileModal = lazy(() => import('../ModalWindows/ProfileModal/ProfileModal'));
const UpdateGroupChatModal = lazy(() => import('../ModalWindows/UpdateGroupChatModal/UpdateGroupChatModal'));

// Socket.IO
import { socket } from '../../socket/socket';

// Functions.
import { getSender, getFullSender, truncateText } from '../../helpers/chatLogic';
import { resetSelectedChatState, onlineUsers } from '../../features/chat/chatSlice';

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const authUser = useSelector((state) => state.authReducer.user);
  const authUserId = authUser?._id;
  const authUserUsername = authUser?.username;

  const chatLoading = useSelector((state) => state.chatReducer.loading);
  const selectedChat = useSelector((state) => state.chatReducer.selectedChat);
  const selectedChatId = selectedChat?._id;
  const selectedChatIsGroupChat = selectedChat?.isGroupChat;
  const selectedChatUsers = selectedChat?.users;
  const selectedChatName = selectedChat?.chatName;
  
  const dispatch = useDispatch();

  // STATE.
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isUpdateGroupChatModalOpen, setIsUpdateGroupChatModalOpen] = useState(false);
  const [lastOnline, setLastOnline] = useState();
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [quotedMessage, setQuotedMessage] = useState(null);
  const [typingUser, setTypingUser] = useState('');

  const typingTimeoutRef = useRef(null);

  // Show online users.
  const handleUsersOnline = useCallback((data) => {
    dispatch(onlineUsers(data));
  }, [dispatch]);

  // Showing typing indicator based on 'typing' event.
  const handleTypingIndicator = useCallback((username) => {
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
  }, []);

  // Add new message to chat.
  const handleMessageReceived = useCallback((data) => {
    // Incoming message will have pop-up sound (only if the chat window is unfocused or hidden).
    if (!document.hasFocus() || document.visibilityState === 'hidden') {
      messageNotificationSound();
    }
      
    setMessages((prevMessages) => [...prevMessages, data]);
    setIsTyping(false);
    setTypingUser('');
  }, []);

  // Mark one message as read.
  const handleMarkOneMessageAsRead = useCallback(({ messageId }) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => (msg._id === messageId ? { ...msg, isRead: true } : msg))
    );
  }, []);

  // Mark all messages as read.
  const handleMarkAllMessagesAsRead = useCallback((updatedMessage) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => (msg._id === updatedMessage._id ? { ...msg, isRead: true } : msg))
    );
  }, []);

  // Insert edited message in chat.
  const handleEditedMessage = useCallback((editedMessage) => {
    setMessages((prev) =>
      prev.map((msg) =>
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
  }, []);

  // Hide chat message.
  const handleHideMessage = useCallback((hiddenMessage) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === hiddenMessage._id
          ? hiddenMessage
          : msg
      )
    );
  }, []);

  // Unhide chat message.
  const handleUnhideMessage = useCallback((unhiddenMessage) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === unhiddenMessage._id
          ? unhiddenMessage
          : msg
      )
    );
  }, []);

  // Delete message from chat. 
  const handleDeleteMessage = useCallback((deletedMessage) => {
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
  }, []);

  useEffect(() => {
    socket.on('users_online', handleUsersOnline);
    socket.on('typing', handleTypingIndicator);
    socket.on('message_received', handleMessageReceived);
    socket.on('mark_one_message_as_read', handleMarkOneMessageAsRead);
    socket.on('mark_all_messages_as_read', handleMarkAllMessagesAsRead);
    socket.on('message_edited', handleEditedMessage);
    socket.on('message_hidden', handleHideMessage);
    socket.on('message_unhidden', handleUnhideMessage);
    socket.on('message_deleted', handleDeleteMessage);
    
    window.addEventListener('keydown', cancelQuotedMessage);
    
    return () => {
      socket.off('users_online', handleUsersOnline);
      socket.off('typing', handleTypingIndicator);
      socket.off('message_received', handleMessageReceived);
      socket.off('mark_one_message_as_read', handleMarkOneMessageAsRead);
      socket.off('mark_all_messages_as_read', handleMarkAllMessagesAsRead);
      socket.off('message_edited', handleEditedMessage);
      socket.off('message_hidden', handleHideMessage);
      socket.off('message_unhidden', handleUnhideMessage);
      socket.off('message_deleted', handleDeleteMessage);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      window.removeEventListener('keydown', cancelQuotedMessage);
    };
  }, []);

  // Fetch all messages for specific chat (maybe later we will put this logic in REDUX).
  const fetchMessages = async () => {
    try {
      if (!selectedChat) {
        return;
      }

      setMessageLoading(true);

      const { data } = await axios.get(`/api/chat/messages/${selectedChatId}`);

      setMessages(data);
      setMessageLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch 'lastOnline' status for our collocutor in private chat.
  const fetchLastOnline = async () => {
    try {
      if (!selectedChat || selectedChatIsGroupChat) {
        return;
      }

      const collocutor = getFullSender(authUser, selectedChatUsers);
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

  // Update 'lastOnline' status on connect/disconnect.
  const handleLastOnlineUpdate = useCallback(({ userId, lastOnline }) => {
    if (!selectedChatUsers || selectedChatUsers.length < 2 || !authUser?._id) {
      return;
    }

    // Defining our collocutor.
    const collocutor = getFullSender(authUser, selectedChatUsers);

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
  }, []);

  useEffect(() => {
    // Fetch all messages for specific chat every time when STATE of 'selected chat' property changed.
    fetchMessages();
    // Fetch online status at first chat select.
    fetchLastOnline();

    socket.emit('room_join', selectedChatId, selectedChatUsers, authUserUsername, authUserId);
    
    socket.on('last_online_update', handleLastOnlineUpdate);

    return () => {
      socket.off('last_online_update', handleLastOnlineUpdate);
    };
  }, [selectedChat]);

  // Reset STATE for selected chat.
  const resetSelectedChat = () => {
    try {
      dispatch(resetSelectedChatState(null));
      setNewMessage('');
      setFetchAgain(!fetchAgain);

      socket.emit('room_leave', selectedChatId, authUserUsername, authUserId);
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
      socket.emit('typing', selectedChatId, authUserUsername);
    } catch (err) {
      console.error(err);
    }
  };

  // Send message (maybe later we will put this logic in REDUX).
  const sendMessage = async () => {
    try {
      if (newMessage.trim().length > 0) {
        const { data } = await axios.post('/api/chat/message', {
          chatId: selectedChatId,
          messageContent: newMessage,
          replyTo: quotedMessage?._id || null,
        });

        socket.emit('message_send', selectedChatId, data);
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
    <>
      {chatLoading ? (
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
      ) : selectedChat ? (
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

            {!selectedChatIsGroupChat ? (
              <>
                <Box component='div' sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography component='div' sx={{ display: 'flex', fontSize: '2.5rem' }}>
                    {getSender(authUser, selectedChatUsers)}
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
                
                {isProfileModalOpen && (
                  <Suspense fallback={<Spinner />}>
                    <ProfileModal
                      isProfileModalOpen={isProfileModalOpen}
                      setIsProfileModalOpen={setIsProfileModalOpen}
                      user={getFullSender(authUser, selectedChatUsers)}
                    />
                  </Suspense>
                )}
              </>
            ) : (
              <>
                {selectedChatName}

                <IconButton
                  sx={{ marginLeft: '1rem' }}
                  onClick={() => {
                    setIsUpdateGroupChatModalOpen(true);
                  }}
                >
                  <VisibilityIcon sx={{ fontSize: '2rem' }} />
                </IconButton>
                
                {isUpdateGroupChatModalOpen && (
                  <Suspense fallback={<Spinner />}>
                    <UpdateGroupChatModal
                      isUpdateGroupChatModalOpen={isUpdateGroupChatModalOpen}
                      setIsUpdateGroupChatModalOpen={setIsUpdateGroupChatModalOpen}
                      fetchAgain={fetchAgain}
                      setFetchAgain={setFetchAgain}
                    />
                  </Suspense>
                )}
              </>
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
                chatId={selectedChatId}
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
    </>
  );
};

export default SingleChat;
