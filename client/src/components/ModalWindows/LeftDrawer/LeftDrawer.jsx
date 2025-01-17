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

// Components.
import Spinner from '../../Spinner/Spinner';

// MUI Icons.
import SearchIcon from '@mui/icons-material/Search';

const LeftDrawer = (props) => {
  const [inputError, setInputError] = useState(false);
  const [inputHelperText, setInputHelperText] = useState('');

  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

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

  const handleSearch = async () => {
    try {
      if (!search || search === '') {
        setInputError(true);
        setInputHelperText('Please enter something.');
        return;
      };

      setLoading(true);

      const { data } = await axios.get(`http://localhost:5000/api/users?search=${search}`);

      setLoading(false);
      setSearch('');
      setSearchResult(data);
      setInputError(false);
      setInputHelperText('');
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
            justifyContent: 'space-between'
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
          loading
            ?
            <Spinner />
            :
            searchResult.map((user) => {
              return <div key={user._id}>
                {user.username}
              </div>
            })
        }
      </Box>
    </Drawer >
  );
};

export default LeftDrawer;
