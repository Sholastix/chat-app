import { useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Avatar,
  Badge,
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

// MUI Icons.
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Logout from '@mui/icons-material/Logout';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Settings from '@mui/icons-material/Settings';

// Components.
import LeftDrawer from '../ModalWindows/LeftDrawer/LeftDrawer';
import ProfileModal from '../ModalWindows/ProfileModal/ProfileModal';

// Functions.
import { signout } from '../../features/auth/authSlice';
import { resetSelectedChatState } from '../../features/chat/chatSlice';

const Header = () => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  const chatState = useSelector((state) => {
    return state.chatReducer;
  });

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  // STATE.
  const [anchorUserMenu, setAnchorUserMenu] = useState(null);
  const [anchorNotificationsMenu, setAnchorNotificationsMenu] = useState(null);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // User menu.
  const openUserMenu = Boolean(anchorUserMenu);

  const handleUserMenuClick = (event) => {
    setAnchorUserMenu(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorUserMenu(null);
  };

  const handleProfileModalOpen = () => {
    setIsProfileModalOpen(true);
    setAnchorUserMenu(null);
  };

  // Notifications menu.
  const openNotificationsMenu = Boolean(anchorNotificationsMenu);

  const handleNotificationsMenuClick = (event) => {
    setAnchorNotificationsMenu(event.currentTarget);
  };

  const handleNotificationsMenuClose = () => {
    setAnchorNotificationsMenu(null);
  };

  // Sign out user.
  const logOut = () => {
    try {
      dispatch(resetSelectedChatState());
      dispatch(signout());
    } catch (err) {
      console.error(err);
    };
  };

  return (
    <Fragment>
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
          title='Search user by username.'
          arrow
          slotProps={{
            tooltip: { sx: { fontSize: '1.2rem', backgroundColor: 'rgb(93, 109, 126)', color: 'white' } },
            arrow: { sx: { color: 'rgb(93, 109, 126)' } }
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
            onClick={() => setIsLeftDrawerOpen(true)}
          >
            <SearchIcon sx={{ fontSize: '3rem', marginRight: '0.5rem' }} />
            <Typography sx={{ fontSize: '1.6rem', display: { xs: 'none', sm: 'flex' } }}>
              Search User
            </Typography>
          </Button>
        </Tooltip>

        <Typography component='div' sx={{ fontFamily: 'Georgia', fontSize: '3rem' }}>
          ChitChat
        </Typography>

        <div>
          <IconButton
            aria-label='notifications'
            id='notifications-button'
            aria-controls={openNotificationsMenu ? 'notifications-menu' : undefined}
            aria-haspopup='true'
            aria-expanded={openNotificationsMenu ? 'true' : undefined}
            onClick={handleNotificationsMenuClick}
          >
            <Badge
              badgeContent={chatState.notifications.length}
              max={99}
              color='primary'
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: 'rgb(93, 109, 126)',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                },
              }}
            >
              <NotificationsOutlinedIcon
                sx={{
                  color: 'black',
                  fontSize: '3rem'
                }}
              />
            </Badge>
          </IconButton>
          <Menu
            id='notifications-menu'
            anchorEl={anchorNotificationsMenu}
            open={openNotificationsMenu}
            MenuListProps={{
              'aria-labelledby': 'notifications-button',
            }}
            onClose={handleNotificationsMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <MenuList>
              <MenuItem>1</MenuItem>
              <Divider />
              <MenuItem>2</MenuItem>
              <Divider />
              <MenuItem>3</MenuItem>
            </MenuList>
          </Menu>

          <Button
            id='user-menu-button'
            aria-controls={openUserMenu ? 'user-menu' : undefined}
            aria-haspopup='true'
            aria-expanded={openUserMenu ? 'true' : undefined}
            onClick={handleUserMenuClick}
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
            anchorEl={anchorUserMenu}
            open={openUserMenu}
            MenuListProps={{
              'aria-labelledby': 'user-menu-button',
            }}
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <MenuList>
              <MenuItem onClick={handleProfileModalOpen} sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}>
                <Avatar sx={{ fontSize: '2rem', marginRight: '0.5rem' }} src={authState.user.avatar} /> Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleUserMenuClose} sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}>
                <ListItemIcon>
                  <Settings sx={{ fontSize: '2rem', marginRight: '0.5rem' }} /> Settings
                </ListItemIcon>
              </MenuItem>
              <MenuItem onClick={logOut} sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}>
                <ListItemIcon>
                  <Logout sx={{ fontSize: '2rem', marginRight: '0.5rem' }} /> Logout
                </ListItemIcon>
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <LeftDrawer
        isLeftDrawerOpen={isLeftDrawerOpen}
        setIsLeftDrawerOpen={setIsLeftDrawerOpen}
      />

      <ProfileModal
        isProfileModalOpen={isProfileModalOpen}
        setIsProfileModalOpen={setIsProfileModalOpen}
        user={authState.user}
      />
    </Fragment>
  );
};

export default Header;