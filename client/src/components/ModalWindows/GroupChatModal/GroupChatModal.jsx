import { useState } from 'react';
import { useDispatch } from 'react-redux';
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
  TextField,
  Typography
} from '@mui/material';

// MUI Icons.
import CloseIcon from '@mui/icons-material/Close';

// Components.
import Alert from '../../Alert/Alert';
import Spinner from '../../Spinner/Spinner';
import UserBadgeItem from '../../UserBadgeItem/UserBadgeItem';
import UserListItem from '../../UserListItem/UserListItem';

// Functions.
import { createGroupChat } from '../../../features/chat/chatSlice';

const GroupChatModal = (props) => {
  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  // STATE.
  const [groupChatName, setGroupChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);

  const [groupChatNameInputError, setGroupChatNameInputError] = useState(false);
  const [groupChatNameInputHelperText, setGroupChatNameInputHelperText] = useState('');
  const [addUsersInputError, setAddUsersInputError] = useState(false);
  const [addUsersHelperText, setAddUsersHelperText] = useState('');

  // STATE for 'Alert' Component.
  const [addUserAlert, setAddUserAlert] = useState(false);

  // 'Close' function for 'Alert' Component.
  const handleCloseAddUserAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    };

    setAddUserAlert(false);
  };

  // Close modal window.
  const handleGroupChatModalClose = () => {
    props.setIsGroupChatModalOpen(false);
    setGroupChatName('');
    setSelectedUsers([]);
    setSearch('');
    setSearchLoading(false);
    setSearchResult([]);

    setGroupChatNameInputError(false);
    setGroupChatNameInputHelperText('');
    setAddUsersInputError(false);
    setAddUsersHelperText('');
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

  // Add user to group chat.
  const handleAddUser = (userToAdd) => {
    try {
      if (selectedUsers.includes(userToAdd)) {
        setAddUserAlert(true);

        setTimeout(() => {
          setAddUserAlert(false);
        }, 5000);

        return;
      };

      setSelectedUsers([...selectedUsers, userToAdd]);
    } catch (err) {
      console.error(err);
    };
  };

  // Remove user from group chat.
  const handleRemoveUser = (userToRemove) => {
    try {
      const filteredSelectedUsers = selectedUsers.filter((user) => {
        return user._id !== userToRemove._id;
      });

      setSelectedUsers(filteredSelectedUsers);
    } catch (err) {
      console.error(err);
    };
  };

  // Create new group chat.
  const handleSubmit = async (event) => {
    try {
      event.preventDefault();

      if (!groupChatName || groupChatName === '') {
        setGroupChatNameInputError(true);
        setGroupChatNameInputHelperText('Please enter something.');
        return;
      };

      if (selectedUsers.length < 2) {
        setAddUsersInputError(true);
        setAddUsersHelperText('Please add minimum 2 users.');
        return;
      };

      dispatch(createGroupChat({
        chatName: groupChatName,
        users: JSON.stringify(selectedUsers)
      }));

      handleGroupChatModalClose();
    } catch (err) {
      console.error(err);
    };
  };

  return (
    <Dialog
      open={props.isGroupChatModalOpen}
      onClose={handleGroupChatModalClose}
    >
      <DialogTitle
        sx={{ marginTop: '2rem', textAlign: 'center' }}
      >
        <IconButton
          aria-label='close'
          onClick={handleGroupChatModalClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon sx={{ fontSize: '2rem' }} />
        </IconButton>

        <Typography sx={{ marginBottom: '2rem', fontSize: '2rem' }}>
          Create Group Chat
        </Typography>

        {
          addUserAlert
          &&
          <Alert
            handleFunction={handleCloseAddUserAlert}
            severityType={'warning'}
            message={'User already added.'}
          />
        }
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
          <TextField
            error={groupChatNameInputError}
            helperText={groupChatNameInputHelperText}
            label='Enter group chat name...'
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

          <TextField
            error={addUsersInputError}
            helperText={addUsersHelperText}
            label='Add users...'
            variant='outlined'
            slotProps={{
              inputLabel: { sx: { fontSize: '1.4rem' } }
            }}
            sx={{
              marginBottom: '1rem',
              width: '100%',
              '.MuiOutlinedInput-notchedOutline': { fontSize: '1.4rem' },
              '.MuiInputBase-input': { fontSize: '1.4rem' },
              '.MuiFormHelperText-contained': { fontSize: '1.2rem' }
            }}
            value={search}
            onChange={(event) => { handleSearch(event.target.value) }}
          />

          <Stack
            sx={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              width: '37.5rem'
            }}
          >
            {
              selectedUsers?.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleRemoveUser(user)}
                />
              ))
            }
          </Stack>

          {
            searchLoading
              ? <Box
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
              : <Stack
                sx={{
                  minHeight: 'auto',
                  maxHeight: '20rem',
                  margin: '1rem 0rem',
                  overflowY: 'auto',
                  scrollbarWidth: 'thin'
                }}
              >
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
          }
        </DialogContent>

        <DialogActions>
          <Button
            type='submit'
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
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default GroupChatModal;