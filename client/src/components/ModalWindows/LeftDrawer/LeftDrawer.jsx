import { useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Box, Button, Drawer, Divider, TextField, Typography } from '@mui/material';

// MUI Icons.
import SearchIcon from '@mui/icons-material/Search';

// Components.
import Spinner from '../../Spinner/Spinner';
import UserListItem from '../../UserListItem/UserListItem';
import ListLoading from '../../ListLoading/ListLoading';

// Functions.
import { createPrivateChat } from '../../../features/chat/chatSlice';

const LeftDrawer = ({ isLeftDrawerOpen, setIsLeftDrawerOpen }) => {
  const chatLoading = useSelector((state) => state.chatReducer.loading);

  const dispatch = useDispatch();

  // STATE.
  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);

  const [inputError, setInputError] = useState(false);
  const [inputHelperText, setInputHelperText] = useState('');

  // Memoized reset state function for reuse.
  const resetSearchState = useCallback(() => {
    setInputError(false);
    setInputHelperText('');
    setSearch('');
    setSearchResult([]);
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
        setSearchResult([]);
        return;
      }

      setSearchLoading(true);

      // Return users from database accordingly to search parameters.
      const { data } = await axios.get(`/api/users?search=${encodeURIComponent(search)}`);

      resetSearchState();
      setSearchResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  }, [search, resetSearchState]);

  // Add chat to chats list.
  const chatAccess = useCallback(async (userId) => {
    try {
      dispatch(createPrivateChat(userId));

      setIsLeftDrawerOpen(false);
      resetSearchState();
    } catch (err) {
      console.error(err);
    }
  }, [dispatch, setIsLeftDrawerOpen, resetSearchState]);

  const handleChatAccessMemo = useCallback((userId) => () => {
    chatAccess(userId);
  }, [chatAccess]);

  // Memoized render for search list.
  const renderedResults = useMemo(() => {
    return searchResult?.map((user) => (
      <UserListItem 
        key={user._id} 
        user={user} 
        handleFunction={handleChatAccessMemo(user._id)}
      />
    ));
  }, [searchResult, handleChatAccessMemo]);

  return (
    <Drawer anchor='left' open={isLeftDrawerOpen} onClose={handleLeftDrawerClose}>
      <Box
        role='presentation'
        overflow='auto'
        sx={{ padding: '2rem', textAlign: 'center', minWidth: '20vw' }}
      >
        <Typography
          component='div'
          sx={{ fontSize: '1.6rem' }}
        >
          Search user
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
          <Box component='div' sx={{ marginTop: '2rem' }} >
            <Spinner />
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default LeftDrawer;
