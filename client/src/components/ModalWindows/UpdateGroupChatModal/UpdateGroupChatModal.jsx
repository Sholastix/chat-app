import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// MUI Icons.
import CloseIcon from '@mui/icons-material/Close';

// Components.
import Alert from '../../Alert/Alert';
import Spinner from '../../Spinner/Spinner';
import UserBadgeItem from '../../UserBadgeItem/UserBadgeItem';
import UserListItem from '../../UserListItem/UserListItem';

// Functions.
import { addUserToGroupChat, removeUserFromGroupChat, renameGroupChat } from '../../../features/chat/chatSlice';

const UpdateGroupChatModal = ({ isUpdateGroupChatModalOpen, setIsUpdateGroupChatModalOpen, fetchAgain, setFetchAgain }) => {
  // Get exact propertie's value directly from auth STATE.
  const authUser = useSelector((state) => state.authReducer.user);
  const chatLoading = useSelector((state) => state.chatReducer.loading);
  const selectedChat = useSelector((state) => state.chatReducer.selectedChat);

  // Early return for missing data.
  if (!authUser || !selectedChat || !selectedChat.groupAdmin) return null;

  // Memoize properties values to prevent unnecessary recomputations.
  const authUserId = useMemo(() => authUser._id, [authUser]);
  const chatId = useMemo(() => selectedChat._id, [selectedChat]);
  const groupAdminId = useMemo(() => selectedChat.groupAdmin._id, [selectedChat]);
  const selectedUsers = useMemo(() => selectedChat.users, [selectedChat]);

  const dispatch = useDispatch();

  const [groupChatName, setGroupChatName] = useState(selectedChat.chatName);
  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);

  const [addUserAlert, setAddUserAlert] = useState(false);
  const [adminRightsAlert, setAdminRightsAlert] = useState(false);
  const [adminSelfRemove, setAdminSelfRemove] = useState(false);
  const [groupChatNameInputError, setGroupChatNameInputError] = useState(false);
  const [groupChatNameInputHelperText, setGroupChatNameInputHelperText] = useState('');

  // Timeout refs for cleanup.
  const addUserTimeout = useRef(null);
  const rightsTimeout = useRef(null);
  const selfRemoveTimeout = useRef(null);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      clearTimeout(addUserTimeout.current);
      clearTimeout(rightsTimeout.current);
      clearTimeout(selfRemoveTimeout.current);
    };
  }, []);

  // 'Close' functions for 'Alert' Component.
  const handleCloseAddUserAlert = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setAddUserAlert(false);
  }, []);

  const handleCloseAdminRightsAlert = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setAdminRightsAlert(false);
  }, []);

  const handleAdminSelfRemoveAlert = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setAdminSelfRemove(false);
  }, []);

  // Close modal window.
  const handleUpdateGroupChatModalClose = useCallback(() => {
    setIsUpdateGroupChatModalOpen(false);
    setGroupChatName(selectedChat.chatName);
    setSearch('');
    setSearchLoading(false);
    setSearchResult([]);
    setGroupChatNameInputError(false);
    setGroupChatNameInputHelperText('');
  }, [selectedChat.chatName, setIsUpdateGroupChatModalOpen]);

  // Search for users to add to a group chat.
  const handleSearch = useCallback(async (query) => {
    setSearch(query);
    
    if (!query) {
      setSearchResult([]);
      return;
    }
    
    setSearchLoading(true);
    
    try {
      const { data } = await axios.get(`/api/users?search=${encodeURIComponent(query)}`);

      setSearchResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Rename group chat.
  const handleRenameGroupChat = useCallback(async (event) => {
    event.preventDefault();

    try {
      // Check if currently logged user is group admin.
      if (groupAdminId !== authUserId) {
        setAdminRightsAlert(true);
        rightsTimeout.current = setTimeout(() => setAdminRightsAlert(false), 5000);
        return;
      }

      if (!groupChatName?.trim()) {
        setGroupChatNameInputError(true);
        setGroupChatNameInputHelperText('Please enter something.');
        return;
      }

      dispatch(
        renameGroupChat({ 
          chatId: chatId, 
          chatName: groupChatName.trim() 
        })
      );

      setFetchAgain(!fetchAgain);
    } catch (err) {
      console.error(err);
    }
  }, [authUserId, groupAdminId, groupChatName, dispatch, chatId, fetchAgain, setFetchAgain]);

  // Add user to group chat.
  const handleAddUser = useCallback(async (userToAdd) => {
    try {
      // Check if currently logged user is group admin.
      if (groupAdminId !== authUserId) {
        setAdminRightsAlert(true);
        rightsTimeout.current = setTimeout(() => setAdminRightsAlert(false), 5000);
        return;
      }

      // Check if user which we want to add already in group.
      if (selectedUsers.some((user) => user._id === userToAdd._id)) {
        setAddUserAlert(true);
        addUserTimeout.current = setTimeout(() => setAddUserAlert(false), 5000);
        return;
      }

      dispatch(
        addUserToGroupChat({ 
          chatId: chatId, 
          userId: userToAdd._id 
        })
      );

      setFetchAgain(!fetchAgain);
    } catch (err) {
      console.error(err);
    }
  }, [authUserId, groupAdminId, selectedUsers, dispatch, chatId, fetchAgain, setFetchAgain]);

  // Remove user from group chat.
  const handleRemoveUser = useCallback((userToRemove) => {
    try {
      // Check if currently logged user is group admin.
      if (groupAdminId !== authUserId) {
        setAdminRightsAlert(true);
        rightsTimeout.current = setTimeout(() => setAdminRightsAlert(false), 5000);
        return;
      }

      // Checking if the group admin is trying to remove himself.
      if (groupAdminId === userToRemove._id) {
        setAdminSelfRemove(true);
        selfRemoveTimeout.current = setTimeout(() => setAdminSelfRemove(false), 5000);
        return;
      }

      dispatch(
        removeUserFromGroupChat({
          chatId: chatId,
          userId: userToRemove._id,
          currentUserId: authUserId,
        })
      );

      setFetchAgain(!fetchAgain);
    } catch (err) {
      console.error(err);
    }
  }, [authUserId, groupAdminId, dispatch, chatId, fetchAgain, setFetchAgain]);

  // New stable handlers for 'UserBadgeItem' and 'UserListItem' Components to avoid inline arrow functions:
  const handleAddUserMemo = useCallback(
    (user) => () => handleAddUser(user),
    [handleAddUser]
  );

  const handleRemoveUserMemo = useCallback(
    (user) => () => handleRemoveUser(user),
    [handleRemoveUser]
  );

  // Leave group chat.
  const handleLeaveGroupChat = useCallback((userToRemove) => {
    try {
      // Checking if the group admin is trying to remove himself.
      if (groupAdminId === userToRemove._id) {
        setAdminSelfRemove(true);
        selfRemoveTimeout.current = setTimeout(() => setAdminSelfRemove(false), 5000);
        return;
      }

      dispatch(
        removeUserFromGroupChat({
          chatId: chatId,
          userId: userToRemove._id,
          currentUserId: authUserId,
        })
      );

      setFetchAgain(!fetchAgain);
    } catch (err) {
      console.error(err);
    }
  }, [authUserId, groupAdminId, dispatch, chatId, fetchAgain, setFetchAgain]);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const paperWidth = fullScreen ? '100%' : '50rem';

  return (
    <Dialog 
      open={isUpdateGroupChatModalOpen} 
      onClose={handleUpdateGroupChatModalClose}
      fullScreen={fullScreen}
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '0.5rem',
          maxWidth: '100%',
          width: paperWidth,
        },
      }}
    >
      <DialogTitle sx={{ marginTop: '2rem', textAlign: 'center' }}>
        <IconButton
          aria-label='close'
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
          onClick={handleUpdateGroupChatModalClose}
        >
          <CloseIcon sx={{ fontSize: '2rem' }} />
        </IconButton>

        <Typography sx={{ marginBottom: '2rem', fontSize: '2rem' }}>Update Group Chat</Typography>

        {addUserAlert && (
          <Alert handleFunction={handleCloseAddUserAlert} severityType={'warning'} message={'User already added.'} />
        )}

        {adminRightsAlert && (
          <Alert
            handleFunction={handleCloseAdminRightsAlert}
            severityType={'error'}
            message={'Group admin rights required.'}
          />
        )}

        {adminSelfRemove && (
          <Alert
            handleFunction={handleAdminSelfRemoveAlert}
            severityType={'error'}
            message={'Group admin can\'t leave the group.'}
          />
        )}
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
              display: 'flex',
            }}
          >
            <TextField
              error={groupChatNameInputError}
              helperText={groupChatNameInputHelperText}
              label='Enter new group chat name...'
              variant='outlined'
              slotProps={{
                inputLabel: { sx: { fontSize: '1.4rem' } },
              }}
              sx={{
                marginBottom: '2rem',
                width: '100%',
                '.MuiOutlinedInput-notchedOutline': { fontSize: '1.4rem' },
                '.MuiInputBase-input': { fontSize: '1.4rem' },
                '.MuiFormHelperText-contained': { fontSize: '1.2rem' },
              }}
              value={groupChatName}
              onChange={(event) => {
                setGroupChatName(event.target.value);
              }}
            />

            {chatLoading ? (
              <Box
                component='div'
                sx={{
                  height: '5.3rem',
                  margin: '0rem 0rem 2rem 0.5rem',
                  padding: '0rem 1.6rem',
                }}
              >
                <Spinner />
              </Box>
            ) : (
              <Button
                type='button'
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
                  ':hover': { backgroundColor: 'rgb(235, 235, 235)' },
                }}
                onClick={handleRenameGroupChat}
              >
                Rename
              </Button>
            )}
          </Box>

          <TextField
            label='Add users...'
            variant='outlined'
            slotProps={{
              inputLabel: { sx: { fontSize: '1.4rem' } },
            }}
            sx={{
              marginBottom: '1rem',
              width: '37.5rem',
              '.MuiOutlinedInput-notchedOutline': { fontSize: '1.4rem' },
              '.MuiInputBase-input': { fontSize: '1.4rem' },
              '.MuiFormHelperText-contained': { fontSize: '1.2rem' },
            }}
            value={search}
            onChange={(event) => {
              handleSearch(event.target.value);
            }}
          />

          <Stack sx={{ flexDirection: 'row', flexWrap: 'wrap', width: '37.5rem' }} >
            {selectedUsers.map((user) => (
              <UserBadgeItem 
                key={user._id}
                groupAdminId={groupAdminId}
                user={user}
                handleFunction={handleRemoveUserMemo(user)}
              />
            ))}
          </Stack>

          {searchLoading ? (
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
          ) : (
            <Box
              component='div'
              sx={{
                minHeight: 'auto',
                maxHeight: '20rem',
                margin: '1rem 0rem',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
              }}
            >
              <Stack sx={{ marginBottom: '2rem' }}>
                {searchResult?.map((user) => (
                  <UserListItem 
                    key={user._id} 
                    user={user} 
                    handleFunction={handleAddUserMemo(user)}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>

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
              ':hover': { backgroundColor: 'rgb(230, 46, 46)', color: 'white' },
            }}
            onClick={() => handleLeaveGroupChat(authUser)}
          >
            Leave Chat
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default memo(UpdateGroupChatModal);
