import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  Input,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

// MUI Icons.
import CloseIcon from '@mui/icons-material/Close';

// Components.
import UserBadgeItem from '../../UserBadgeItem/UserBadgeItem';
import UserListItem from '../../UserListItem/UserListItem';

// Functions.
import { resetSelectedChatState } from '../../../features/chat/chatSlice';

const UpdateGroupChatModal = (props) => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  const chatState = useSelector((state) => {
    return state.chatReducer;
  });

  const [groupChatName, setGroupChatName] = useState(chatState.selectedChat[0].chatName);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  const handleUpdateGroupChatModalClose = () => {
    props.setIsUpdateGroupChatModalOpen(false);
    setGroupChatName('');
    setSelectedUsers([]);
    setSearch('');
    setSearchLoading(false);
    setSearchResult([]);
  };

  // ----------------------------   FUNCTIONS READY - START   ----------------------------

  const handleLeaveGroup = () => {
    try {
      dispatch(resetSelectedChatState());
    } catch (err) {
      console.error(err);
    };
  };

  const handleSearch = async (query) => {
    try {
      setSearch(query);

      if (!query) {
        return;
      };

      setSearchLoading(true);

      const { data } = await axios.get(`http://localhost:5000/api/users?search=${search}`);

      setSearchLoading(false);
      setSearchResult(data);
    } catch (err) {
      console.error(err);
    };
  };

  const handleGroupUsers = (userToAdd) => {
    try {
      if (selectedUsers.includes(userToAdd)) {
        console.log('USER ALREADY ADDED!');
        return;
      };

      setSelectedUsers([...selectedUsers, userToAdd]);
      console.log('SELECTED_USERS: ', selectedUsers);
    } catch (err) {
      console.error(err);
    };
  };

  // ----------------------------   FUNCTIONS READY - END   ----------------------------

  // Delete user from selected users.
  const handleDelete = (userToDelete) => {
    try {
      // const filteredSelectedUsers = selectedUsers.filter((user) => {
      //   return user._id !== userToDelete._id;
      // });

      // setSelectedUsers(filteredSelectedUsers);
      console.log('DELETE');
    } catch (err) {
      console.error(err);
    };
  };

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      console.log('SU: ', selectedUsers)

      // dispatch(createGroupChat({
      //   chatName: groupChatName,
      //   users: JSON.stringify(selectedUsers)
      // }));

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
          <TextField
            // error={inputError}
            // helperText={inputHelperText}
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
            }}
            value={groupChatName}
            onChange={(event) => { setGroupChatName(event.target.value) }}
          />

          <TextField
            // error={inputError}
            // helperText={inputHelperText}
            label='Search user...'
            variant='outlined'
            slotProps={{
              inputLabel: { sx: { fontSize: '1.4rem' } }
            }}
            sx={{
              width: '100%',
              '.MuiOutlinedInput-notchedOutline': { fontSize: '1.4rem' },
              '.MuiInputBase-input': { fontSize: '1.4rem' },
            }}
            value={search}
            onChange={(event) => { handleSearch(event.target.value) }}
          />
        </DialogContent>

        {
          <Stack sx={{
            display: 'flex',
            flexDirection: 'row'
          }}>
            {
              chatState.selectedChat[0].users.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleDelete(user)}
                />
              ))
            }

            {
              selectedUsers?.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleDelete(user)}
                />
              ))
            }
          </Stack>
        }

        {
          searchLoading
            ?
            <div>LOADING...</div>
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
                      handleFunction={() => handleGroupUsers(user)}
                    />
                  ))
                }
              </Stack>
            </Box>
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
            onClick={handleLeaveGroup}
          >
            Leave
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default UpdateGroupChatModal;