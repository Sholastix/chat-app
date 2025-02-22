import { useState, useEffect, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  FormControl,
  IconButton,
  TextField,
  Typography
} from '@mui/material';

// MUI Icons.
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Components.
import Spinner from '../Spinner/Spinner';
import ProfileModal from '../ModalWindows/ProfileModal/ProfileModal';
import UpdateGroupChatModal from '../ModalWindows/UpdateGroupChatModal/UpdateGroupChatModal';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Functions.
import { resetSelectedChatState } from '../../features/chat/chatSlice';
import { getSender, getFullSender } from '../../helpers/chatLogic';
import axios from 'axios';

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
                  backgroundColor: 'rgb(235, 235, 235)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'flex-end',
                  overflowY: 'hidden',
                  padding: '1rem',
                  scrollbarWidth: 'thin'
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
                    messages.map((message) => (
                      <Box
                        component='div'
                        key={message._id}
                        sx={{
                          alignSelf: 'flex-end',
                          backgroundColor: 'rgb(200, 240, 200)',
                          borderRadius: '1rem 1rem 0rem 1rem',
                          fontSize: '1.6rem',
                          marginBottom: '1rem',
                          overflowWrap: 'break-word',
                          padding: '1rem',
                          maxWidth: '50%',
                          width: 'fit-content'
                        }}
                      >
                        {message.content}
                      </Box>
                    ))
                }

                <FormControl>
                  <TextField
                    label='Type your message...'
                    variant='outlined'
                    slotProps={{
                      inputLabel: { sx: { fontSize: '1.4rem' } }
                    }}
                    sx={{
                      backgroundColor: 'white',
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