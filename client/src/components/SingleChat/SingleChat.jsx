import { useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  IconButton,
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUpdateGroupChatModalOpen, setIsUpdateGroupChatModalOpen] = useState(false);

  // Reset STATE for selected chat.
  const resetSelectedChat = () => {
    try {
      dispatch(resetSelectedChatState());
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
                  overflowY: 'hidden',
                  padding: '1rem',
                  scrollbarWidth: 'thin'
                }}
              >
                MESSAGES
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