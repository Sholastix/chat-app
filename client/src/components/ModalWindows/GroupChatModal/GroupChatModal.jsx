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
import { createGroupChat } from '../../../features/chat/chatSlice';

const GroupChatModal = (props) => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const chatState = useSelector((state) => {
    return state.chatReducer;
  });

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

  // Add user to selected users.
  const handleAddUser = (userToAdd) => {
    try {
      if (selectedUsers.includes(userToAdd)) {
        console.log('User already added.')
        return;
      };

      setSelectedUsers([...selectedUsers, userToAdd]);
    } catch (err) {
      console.error(err);
    };
  };

  // Delete user from selected users.
  const handleDeleteUser = (userToDelete) => {
    try {
      const filteredSelectedUsers = selectedUsers.filter((user) => {
        return user._id !== userToDelete._id;
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
        sx={{
          fontSize: '2rem',
          marginTop: '2rem',
          textAlign: 'center'
        }}
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
        Create Group Chat
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
              width: '100%',
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
            selectedUsers?.map((user) => (
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
            <Stack
              sx={{
                height: '20rem',
                marginBottom: '3rem',
                overflowY: 'auto',
                padding: '0rem 1rem',
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