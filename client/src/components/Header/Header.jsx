import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuList,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Logout from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import Settings from '@mui/icons-material/Settings';

// Functions.
import { signout } from '../../features/auth/authSlice';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  // Sign out user.
  const logOut = () => {
    try {
      dispatch(signout());
    } catch (err) {
      console.error(err);
    };
  };

  return (
    <Box
      sx={{
        alignItems: 'center',
        border: '0.5rem solid rgb(235, 235, 235)',
        display: 'flex',
        justifyContent: 'space-between',
        width: '100vw'
      }}
    >
      <Tooltip
        title='Search user by username or email.'
        arrow
        slotProps={{
          tooltip: { sx: { fontSize: '1.2rem', backgroundColor: 'white', color: 'black' } },
          arrow: { sx: { color: 'white' } }
        }}
      >
        <Button
          sx={{
            color: 'black',
            margin: '0.5rem 1rem',
            padding: '0.5rem 2rem',
            textTransform: 'none',
            ':hover': { backgroundColor: 'rgb(235, 235, 235)', color: 'black' }
          }}
        >
          <SearchIcon sx={{ fontSize: '3rem', marginRight: '0.5rem' }} />
          <Typography sx={{ fontSize: '1.6rem', display: { xs: 'none', sm: 'flex' } }}>
            Search User
          </Typography>
        </Button>
      </Tooltip>

      <Typography sx={{ fontFamily: 'Georgia', fontSize: '3rem' }}>
        ChitChat
      </Typography>

      <div>
        <Button
          id='user-menu-button'
          aria-controls={open ? 'user-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          endIcon={<KeyboardArrowDownIcon />}
          sx={{
            color: 'black',
            margin: '0.5rem 1rem',
            padding: '0.5rem 2rem',
            textTransform: 'none',
            ':hover': { backgroundColor: 'rgb(235, 235, 235)', color: 'black' }
          }}
        >
          <Avatar sx={{ fontSize: '2rem', marginRight: '0.5rem' }} src={authState.user.avatar} />
          <Typography sx={{ fontSize: '1.4rem' }}>
            {authState.user.username}
          </Typography>
        </Button>
        <Menu
          id='user-menu'
          anchorEl={anchorEl}
          open={open}
          MenuListProps={{
            'aria-labelledby': 'user-menu-button',
          }}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
        >
          <MenuItem onClick={handleClose} sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}>
            <Avatar sx={{ fontSize: '2rem', marginRight: '0.5rem' }} src={authState.user.avatar} /> Profile
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleClose} sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}>
            <ListItemIcon>
              <Settings sx={{ fontSize: '2rem', marginRight: '0.5rem' }} /> Settings
            </ListItemIcon>
          </MenuItem>
          <MenuItem onClick={logOut} sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}>
            <ListItemIcon>
              <Logout sx={{ fontSize: '2rem', marginRight: '0.5rem' }} /> Logout
            </ListItemIcon>
          </MenuItem>
        </Menu>
      </div>
    </Box>
  );
};

export default Header;