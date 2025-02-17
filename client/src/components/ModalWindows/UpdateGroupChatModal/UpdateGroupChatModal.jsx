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
import {
  addUserToGroupChat,
  removeUserFromGroupChat,
  renameGroupChat
} from '../../../features/chat/chatSlice';

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

  const [groupChatName, setGroupChatName] = useState(chatState.selectedChat.chatName);
  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);

  const [groupChatNameInputError, setGroupChatNameInputError] = useState(false);
  const [groupChatNameInputHelperText, setGroupChatNameInputHelperText] = useState('');

  // ----------------------------   FUNCTIONS READY - START   ----------------------------

  // Close modal window.
  const handleUpdateGroupChatModalClose = () => {
    props.setIsUpdateGroupChatModalOpen(false);
    setGroupChatName(chatState.selectedChat.chatName);
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

  // Rename group chat.
  const handleRenameGroupChat = async (event) => {
    try {
      event.preventDefault();

      if (!groupChatName || groupChatName === '') {
        setGroupChatNameInputError(true);
        setGroupChatNameInputHelperText('Please enter something.');
        return;
      };

      dispatch(renameGroupChat({
        chatId: chatState.selectedChat._id,
        chatName: groupChatName,
      }));

      props.setFetchAgain(!props.fetchAgain);
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
  const handleAddUser = async (userToAdd) => {
    try {
      // console.log('ADD_USER: ', userToAdd);
      // console.log('ADD_USER_ID: ', userToAdd._id);
      // console.log('ALL_USERS_IN_CHAT: ', chatState.selectedChat.users);
      // console.log('GROUP_ADMIN_ID: ', chatState.selectedChat.groupAdmin);
      // console.log('CURRENT_USER_ID: ', authState.user._id);
      // console.log('CHAT_ID: ', chatState.selectedChat._id);

      // Ok, this part kinda trash code. Later we think about better way to do it. It works fine but it is excessive.
      // The problem is that 'chatState.selectedChat.groupAdmin' is 'STRING' type ID after 'fetchChats' fired 
      // but 'object' type with all user properties after 'createGroupChat' or 'add/remove user from group chat' fired.
      let groupAdminId = typeof chatState.selectedChat.groupAdmin === 'object'
        ?
        chatState.selectedChat.groupAdmin._id
        :
        chatState.selectedChat.groupAdmin

      // Check if currently logged user is group admin.
      if (groupAdminId !== authState.user._id) {
        console.log('GROUP ADMIN RIGHTS REQUIRED.');
        return;
      };

      // Check if user which we want to add already in group.
      if (chatState.selectedChat.users.find((user) => user._id === userToAdd._id)) {
        console.log('USER ALREADY IN GROUP.');
        return;
      };

      dispatch(addUserToGroupChat({
        chatId: chatState.selectedChat._id,
        userId: userToAdd._id
      }));

      props.setFetchAgain(!props.fetchAgain);
    } catch (err) {
      console.error(err);
    };
  };

  // Remove user from group chat.
  const handleRemoveUser = (userToDelete) => {
    try {
      let groupAdminId = typeof chatState.selectedChat.groupAdmin === 'object'
        ?
        chatState.selectedChat.groupAdmin._id
        :
        chatState.selectedChat.groupAdmin

      // Check if currently logged user is group admin.
      if (groupAdminId !== authState.user._id) {
        console.log('GROUP ADMIN RIGHTS REQUIRED.');
        return;
      };

      dispatch(removeUserFromGroupChat({
        chatId: chatState.selectedChat._id,
        userId: userToDelete._id
      }));

      props.setFetchAgain(!props.fetchAgain);
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
              chatState.loading
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

        <Stack
          sx={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            width: '37.5rem'
          }}
        >
          {
            chatState.selectedChat.users.map((user) => (
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