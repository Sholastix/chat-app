import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Button,
  Drawer,
  Divider,
  TextField,
  Typography
} from '@mui/material';

// MUI Icons.
import SearchIcon from '@mui/icons-material/Search';

// Components.
import Spinner from '../../Spinner/Spinner';
import UserListItem from '../../UserListItem/UserListItem';
import ListLoading from '../../ListLoading/ListLoading';

// Functions.
import { createPrivateChat } from '../../../features/chat/chatSlice';

const LeftDrawer = (props) => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const chatState = useSelector((state) => {
    return state.chatReducer;
  });

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  // STATE.
  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);

  const [inputError, setInputError] = useState(false);
  const [inputHelperText, setInputHelperText] = useState('');

  // 'Close' event for 'LeftDrawer' Component. 
  const handleLeftDrawerClose = () => {
    try {
      props.setIsLeftDrawerOpen(false);
      setInputError(false);
      setInputHelperText('');
      setSearch('');
      setSearchResult([]);
    } catch (err) {
      console.error(err);
    };
  };

  // Search user in database.
  const handleSearch = async () => {
    try {
      if (!search || search === '') {
        setInputError(true);
        setInputHelperText('Please enter something.');
        setSearchResult([]);
        return;
      };

      setSearchLoading(true);

      // Return users from database accordingly to search parameters.
      const { data } = await axios.get(`http://localhost:5000/api/users?search=${search}`);

      setInputError(false);
      setInputHelperText('');
      setSearchLoading(false);
      setSearch('');
      setSearchResult(data);
    } catch (err) {
      console.error(err);
    };
  };

  // Access to chat.
  const chatAccess = async (userId) => {
    try {
      dispatch(createPrivateChat(userId));

      props.setIsLeftDrawerOpen(false);
      setInputError(false);
      setInputHelperText('');
      setSearch('');
      setSearchResult([]);
    } catch (err) {
      console.error(err);
    };
  };

  return (
    <Drawer
      anchor='left'
      open={props.isLeftDrawerOpen}
      onClose={handleLeftDrawerClose}
    >
      <Box
        role='presentation'
        overflow='auto'
        sx={{
          padding: '2rem',
          textAlign: 'center',
          minWidth: '20vw'
        }}
      >
        <Typography
          component='div'
          sx={{
            fontSize: '1.6rem',
          }}
        >
          Search user
        </Typography>

        <Divider sx={{ margin: '2rem 0rem 3rem' }} />

        <Box
          component='form'
          noValidate
          autoComplete='off'
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '3rem'
          }}
        >
          <TextField
            error={inputError}
            helperText={inputHelperText}
            label='Username...'
            variant='outlined'
            slotProps={{
              inputLabel: { sx: { fontSize: '1.4rem' } }
            }}
            sx={{
              width: '75%',
              '.MuiOutlinedInput-notchedOutline': { fontSize: '1.4rem' },
              '.MuiInputBase-input': { fontSize: '1.4rem' },
              '.MuiFormHelperText-contained': { fontSize: '1.2rem' }
            }}
            value={search}
            onChange={(event) => { setSearch(event.target.value) }}
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
              ':hover': { backgroundColor: 'rgb(235, 235, 235)' }
            }}
            onClick={handleSearch}
          >
            <SearchIcon
              sx={{
                fontSize: '3rem',
              }}
            />
          </Button>
        </Box>

        {
          searchLoading
            ?
            <ListLoading />
            :
            searchResult?.map((user) => (
              <UserListItem
                key={user._id}
                user={user}
                handleFunction={() => chatAccess(user._id)}
              />
            ))
        }

        {
          chatState.loading &&
          <Box
            component='div'
            sx={{
              marginTop: '2rem'
            }}
          >
            <Spinner />
          </Box>
        }
      </Box>
    </Drawer >
  );
};

export default LeftDrawer;
