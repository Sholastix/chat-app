import { useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Avatar, Box, Button, Drawer, Divider, TextField, Typography } from '@mui/material';

// MUI Icons.
import SearchIcon from '@mui/icons-material/Search';

// Components.
import GroupChatListItem from './GroupChatListItem';
import ConfirmationDialog from '../../ConfirmationDialog/ConfirmationDialog';
import Spinner from '../../Spinner/Spinner';
import UserListItem from '../../UserListItem/UserListItem';
import ListLoading from '../../ListLoading/ListLoading';

// Functions.
import { accessGroupChat, createPrivateChat } from '../../../features/chat/chatSlice';

const LeftDrawer = ({ isLeftDrawerOpen, setIsLeftDrawerOpen }) => {
  const chatLoading = useSelector((state) => state.chatReducer.loading);

  const dispatch = useDispatch();

  // STATE.
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [inputHelperText, setInputHelperText] = useState('');
  const [search, setSearch] = useState('');
  const [searchGroupChats, setSearchGroupChats] = useState([]);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedGroupChatId, setSelectedGroupChatId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Memoized reset state function for reuse.
  const resetSearchState = useCallback(() => {
    setInputError(false);
    setInputHelperText('');
    setSearch('');
    setSearchGroupChats([]);
    setSearchUsers([]);
  }, []);

  // 'Close' event for 'LeftDrawer' Component.
  const handleLeftDrawerClose = useCallback(() => {
    try {
      setIsLeftDrawerOpen(false);
      resetSearchState();
    } catch (err) {
      console.error(err);
    }
  }, [setIsLeftDrawerOpen, resetSearchState]);

  // Search user in database.
  const handleSearch = useCallback(async () => {
    try {
      if (!search.trim()) {
        setInputError(true);
        setInputHelperText('Please enter something.');
        setSearchGroupChats([]);
        setSearchUsers([]);
        return;
      }

      setSearchLoading(true);

      // Return users from database accordingly to search parameters.
      const users = await axios.get(`/api/users/search?search=${encodeURIComponent(search)}`);

      // Return chats from database accordingly to search parameters.
      const chats = await axios.get(`/api/chat/group/search?search=${encodeURIComponent(search)}`);

      resetSearchState();
      setSearchGroupChats(chats.data ?? []);
      setSearchUsers(users.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  }, [search, resetSearchState]);

  // Add private chat to chats list.
  const chatAccess = useCallback(async (userId) => {
    setSelectedUserId(userId);
    setConfirmationOpen(true);
  }, []);

  // Add group chat to chats list.
  const groupChatAccess = useCallback(async (groupId) => {
    setSelectedGroupChatId(groupId);
    setConfirmationOpen(true);
  }, []);

  // Confirm action.
  const handleConfirm = useCallback(() => {
    if (selectedUserId !== null) {
      try {
        dispatch(createPrivateChat(selectedUserId));
        setIsLeftDrawerOpen(false);
        resetSearchState();
      } catch (err) {
        console.error(err);
      } finally {
        setSelectedUserId(null);
        setConfirmationOpen(false);
      }

      return;
    }

    if (selectedGroupChatId !== null) {
      try {
        dispatch(accessGroupChat(selectedGroupChatId));
        setIsLeftDrawerOpen(false);
        resetSearchState();
      } catch (err) {
        console.error(err);
      } finally {
        setSelectedGroupChatId(null);
        setConfirmationOpen(false);
      }
    }
  }, [dispatch, selectedUserId, selectedGroupChatId, setIsLeftDrawerOpen, resetSearchState]);

  // Cancel action.
  const handleCancel = useCallback(() => {
    setSelectedGroupChatId(null);
    setSelectedUserId(null);
    setConfirmationOpen(false);
  }, []);

  const handleChatAccessMemo = useCallback((userId) => () => {
    chatAccess(userId)
  }, [chatAccess]);

  const handleGroupChatAccessMemo = useCallback((groupId) => () => {
    groupChatAccess(groupId);
  }, [groupChatAccess]);

  // Memoized render for search list.
  const renderedResults = useMemo(() => {
    return (
      <>
        {searchUsers.length > 0 && (
          <>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Users
            </Typography>

            {searchUsers.map((user) => (
              <UserListItem key={user._id} user={user} handleFunction={handleChatAccessMemo(user._id)} />
            ))}
          </>
        )}

        {searchGroupChats.length > 0 && (
          <>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '3rem 0rem 1rem' }}>
              Group Chats
            </Typography>

            {searchGroupChats.map((chat) => (
              <GroupChatListItem key={chat._id} chat={chat} handleFunction={handleGroupChatAccessMemo(chat._id)} />
            ))}
          </>
        )}

        {!searchLoading && searchUsers.length === 0 && searchGroupChats.length === 0 && (
          <Typography sx={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
            No results found.
          </Typography>
        )}
      </>
    );
  }, [searchUsers, searchGroupChats, handleChatAccessMemo, searchLoading, resetSearchState, setIsLeftDrawerOpen]);

  return (
    <>
      <Drawer anchor='left' open={isLeftDrawerOpen} onClose={handleLeftDrawerClose}>
        <Box
          component='div'
          role='presentation'
          overflow='auto'
          sx={{
            padding: '2rem',
            textAlign: 'center',
            minWidth: '20vw',
            height: '100%',
          }}
        >
          <Typography component='div' sx={{ fontSize: '1.6rem' }}>
            Search user or group chat
          </Typography>

          <Divider sx={{ margin: '2rem 0rem 3rem' }} />

          <Box
            component='form'
            autoComplete='off'
            noValidate
            sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}
          >
            <TextField
              error={inputError}
              helperText={inputHelperText}
              label='Username...'
              variant='outlined'
              slotProps={{
                inputLabel: { sx: { fontSize: '1.4rem' } },
              }}
              sx={{
                width: '75%',
                '.MuiOutlinedInput-notchedOutline': { fontSize: '1.4rem' },
                '.MuiInputBase-input': { fontSize: '1.4rem' },
                '.MuiFormHelperText-contained': { fontSize: '1.2rem' },
              }}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
            />

            <Button
              type='button'
              variant='outlined'
              sx={{
                borderColor: 'lightgray',
                color: 'black',
                fontSize: '1.4rem',
                height: '5.3rem',
                marginLeft: '1rem',
                ':hover': { backgroundColor: 'rgb(235, 235, 235)' },
              }}
              onClick={handleSearch}
            >
              <SearchIcon sx={{ fontSize: '3rem' }} />
            </Button>
          </Box>

          {searchLoading ? <ListLoading /> : renderedResults}

          {chatLoading && (
            <Box component='div' sx={{ marginTop: '2rem' }}>
              <Spinner />
            </Box>
          )}
        </Box>
      </Drawer>

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        cancelText='Cancel'
        confirmText='Confirm'
        title='Add new contact'
        message='Do you want to add this contact to the list?'
      />
    </>
  );
};

export default LeftDrawer;
