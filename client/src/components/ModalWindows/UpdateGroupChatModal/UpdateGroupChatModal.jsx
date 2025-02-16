import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField
} from '@mui/material';

// MUI Icons.
import CloseIcon from '@mui/icons-material/Close';

// Components.
import Spinner from '../../Spinner/Spinner';
import UserBadgeItem from '../../UserBadgeItem/UserBadgeItem';
import UserListItem from '../../UserListItem/UserListItem';

// Functions.
import { renameGroupChat } from '../../../features/chat/chatSlice';

const UpdateGroupChatModal = (props) => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  const chatState = useSelector((state) => {
    return state.chatReducer;
  });

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  const [groupChatName, setGroupChatName] = useState(chatState.selectedChat[0].chatName);
  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const [renameLoading, setRenameLoading] = useState(false);

  const [groupChatNameInputError, setGroupChatNameInputError] = useState(false);
  const [groupChatNameInputHelperText, setGroupChatNameInputHelperText] = useState('');

  // ----------------------------   FUNCTIONS READY - START   ----------------------------

  // Close modal window.
  const handleUpdateGroupChatModalClose = () => {
    props.setIsUpdateGroupChatModalOpen(false);
    setGroupChatName('');
    setSearch('');
    setSearchLoading(false);
    setSearchResult([]);

    setGroupChatNameInputError(false);
    setGroupChatNameInputHelperText('');
  };

  // Search for users to add to a group chat.
  const handleSearch = async (query) => {
    try {
      setSearch(query);

      if (query.length > 0) {
        setSearchLoading(true);

        const { data } = await axios.get(`http://localhost:5000/api/users?search=${query}`);

        setSearchLoading(false);
        setSearchResult(data);
      } else {
        setSearchResult([]);
      };
    } catch (err) {
      console.error(err);
    };
  };

  // ----------------------------   FUNCTIONS READY - END   ----------------------------

  // Leave group chat.
  const handleLeaveGroupChat = () => {
    try {
      console.log('LEAVE GROUP CHAT.');

      // dispatch();
    } catch (err) {
      console.error(err);
    };
  };

  // Add user to group chat.
  const handleAddUser = (userToAdd) => {
    try {
      console.log('ADD USER: ', userToAdd);
    } catch (err) {
      console.error(err);
    };
  };

  // Delete user from group chat.
  const handleDeleteUser = (userToDelete) => {
    try {
      console.log('DELETE USER: ', userToDelete);
    } catch (err) {
      console.error(err);
    };
  };

  // Rename group chat.
  const handleRenameGroupChat = async (event) => {
    try {
      event.preventDefault();

      if (!groupChatName || groupChatName === '') {
        setGroupChatNameInputError(true);
        setGroupChatNameInputHelperText('Please enter something.');
        return;
      };

      setRenameLoading(true);

      dispatch(renameGroupChat({
        chatId: chatState.selectedChat[0]._id,
        chatName: groupChatName,
      }));

      setRenameLoading(false);
      props.setFetchAgain(!props.fetchAgain);
      handleUpdateGroupChatModalClose();
    } catch (err) {
      console.error(err);
    };
  };

  return (
    <Dialog
      open={props.isUpdateGroupChatModalOpen}
      onClose={handleUpdateGroupChatModalClose}
    >
      <DialogTitle
        sx={{
          fontSize: '2rem',
          marginTop: '2rem',
          textAlign: 'center'
        }}
      >
        <IconButton
          aria-label='close'
          onClick={handleUpdateGroupChatModalClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon sx={{ fontSize: '2rem' }} />
        </IconButton>
        Update Group Chat
      </DialogTitle>
      <Box
        component='form'
        noValidate
        autoComplete='off'
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
        }}
      >
        <DialogContent>
          <Box
            component='div'
            sx={{
              display: 'flex'
            }}
          >
            <TextField
              error={groupChatNameInputError}
              helperText={groupChatNameInputHelperText}
              label='Enter new group chat name...'
              variant='outlined'
              slotProps={{
                inputLabel: { sx: { fontSize: '1.4rem' } }
              }}
              sx={{
                marginBottom: '2rem',
                width: '100%',
                '.MuiOutlinedInput-notchedOutline': { fontSize: '1.4rem' },
                '.MuiInputBase-input': { fontSize: '1.4rem' },
                '.MuiFormHelperText-contained': { fontSize: '1.2rem' }
              }}
              value={groupChatName}
              onChange={(event) => { setGroupChatName(event.target.value) }}
            />

            {
              renameLoading
                ?
                (
                  <Box
                    component='div'
                    sx={{
                      height: '5.3rem',
                      margin: '0rem 0rem 2rem 0.5rem',
                      padding: '0rem 1.6rem'
                    }}
                  >
                    <Spinner />
                  </Box>
                ) : (
                  <Button
                    type='submit'
                    variant='outlined'
                    sx={{
                      borderColor: 'lightgray',
                      color: 'black',
                      fontSize: '1.4rem',
                      fontWeight: '400',
                      height: '5.3rem',
                      margin: '0rem 0rem 2rem 0.5rem',
                      padding: '0.5rem 2rem',
                      textTransform: 'none',
                      ':hover': { backgroundColor: 'rgb(235, 235, 235)' }
                    }}
                    onClick={handleRenameGroupChat}
                  >
                    Rename
                  </Button>
                )
            }
          </Box>

          <TextField
            label='Add users...'
            variant='outlined'
            slotProps={{
              inputLabel: { sx: { fontSize: '1.4rem' } }
            }}
            sx={{
              width: '37.5rem',
              '.MuiOutlinedInput-notchedOutline': { fontSize: '1.4rem' },
              '.MuiInputBase-input': { fontSize: '1.4rem' },
              '.MuiFormHelperText-contained': { fontSize: '1.2rem' }
            }}
            value={search}
            onChange={(event) => { handleSearch(event.target.value) }}
          />
        </DialogContent>

        <Stack sx={{ flexDirection: 'row' }}>
          {
            chatState.selectedChat[0].users.map((user) => (
              <UserBadgeItem
                key={user._id}
                user={user}
                handleFunction={() => handleDeleteUser(user)}
              />
            ))
          }
        </Stack>

        {
          searchLoading
            ?
            <Box
              component='div'
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '20rem',
                marginBottom: '3rem',
                padding: '0rem 1rem',
              }}
            >
              <Spinner />
            </Box>
            :
            <Box
              component='div'
              sx={{
                height: '20rem',
                marginBottom: '3rem',
                overflowY: 'auto',
                padding: '0rem 1rem',
                scrollbarWidth: 'thin'
              }}
            >
              <Stack sx={{ marginBottom: '2rem' }}>
                {
                  searchResult?.map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => handleAddUser(user)}
                    />
                  ))
                }
              </Stack>
            </Box>
        }

        <DialogActions>
          <Button
            type='button'
            variant='outlined'
            sx={{
              borderColor: 'lightgray',
              color: 'black',
              fontSize: '1.4rem',
              fontWeight: '400',
              marginBottom: '2rem',
              padding: '0.5rem 2rem',
              textTransform: 'none',
              ':hover': { backgroundColor: 'rgb(235, 235, 235)' }
            }}
            onClick={handleLeaveGroupChat}
          >
            Leave Chat
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default UpdateGroupChatModal;