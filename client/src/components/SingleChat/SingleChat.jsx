import { useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography
} from '@mui/material';

// MUI Icons.
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Components.
import Spinner from '../Spinner/Spinner';
import ProfileModal from '../ModalWindows/ProfileModal/ProfileModal';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Functions.
import { resetSelectedChatState } from '../../features/chat/chatSlice';
import { getSender, getFullSender } from '../../helpers/chatLogic';

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  const chatState = useSelector((state) => {
    return state.chatReducer;
  });

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

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
          <Spinner />
          :
          chatState.selectedChat ? (
            <Typography
              sx={{
                alignItems: 'center',
                display: 'flex',
                fontSize: { sx: '2.5rem', md: '3rem' },
                height: 'fit-content',
                justifyContent: { sx: 'space-between', md: 'center' },
                width: '100%'
              }}
            >
              <IconButton
                sx={{
                  display: { sx: 'flex', md: 'none' },
                  margin: '0.5rem 1rem'
                }}
                onClick={resetSelectedChat}
              >
                <ArrowBackIcon sx={{ fontSize: '3rem' }} />
              </IconButton>

              {
                !chatState.selectedChat[0].isGroupChat
                  ?
                  <Fragment>
                    {
                      getSender(authState.user, chatState.selectedChat[0].users)
                    }
                    <IconButton onClick={() => { setIsProfileModalOpen(true) }}>
                      <VisibilityIcon />
                    </IconButton>
                    <ProfileModal
                      isProfileModalOpen={isProfileModalOpen}
                      setIsProfileModalOpen={setIsProfileModalOpen}
                      user={getFullSender(authState.user, chatState.selectedChat[0].users)}
                    />
                  </Fragment>
                  :
                  <Fragment>
                    {
                      chatState.selectedChat[0].chatName
                    }
                    {/* <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} /> */}
                  </Fragment>
              }

            </Typography>
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