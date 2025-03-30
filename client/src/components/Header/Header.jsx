import { useState, useEffect, Fragment } from 'react';
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

// Socket.IO
import { socket } from '../../socket/socket';

// MUI Icons.
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Logout from '@mui/icons-material/Logout';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Settings from '@mui/icons-material/Settings';

// Components.
import LeftDrawer from '../ModalWindows/LeftDrawer/LeftDrawer';
import ProfileModal from '../ModalWindows/ProfileModal/ProfileModal';
import SettingsModal from '../ModalWindows/SettingsModal/SettingsModal';

// Functions.
import { signout, updateUser } from '../../features/auth/authSlice';
import { getSender } from '../../helpers/chatLogic';
import { resetSelectedChatState } from '../../features/chat/chatSlice';

const Header = () => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  // STATE.
  const [anchorUserMenu, setAnchorUserMenu] = useState(null);
  const [anchorNotificationsMenu, setAnchorNotificationsMenu] = useState(null);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(authState.user.notifications);
  }, [authState.user]);

  // User menu.
  const openUserMenu = Boolean(anchorUserMenu);

  // Open user menu.
  const handleUserMenuClick = (event) => {
    try {
      setAnchorUserMenu(event.currentTarget);
    } catch (error) {
      console.error(err);
    };
  };

  // Close user menu.
  const handleUserMenuClose = () => {
    try {
      setAnchorUserMenu(null);
    } catch (error) {
      console.error(err);
    };
  };

  // Open user's profile modal window in user's menu.
  const handleProfileModalOpen = () => {
    try {
      setIsProfileModalOpen(true);
      setAnchorUserMenu(null);
    } catch (error) {
      console.error(err);
    };
  };

  // Open user's settings modal window in user's menu.
  const handleSettingsModalOpen = () => {
    try {
      setIsSettingsModalOpen(true);
      setAnchorUserMenu(null);
    } catch (error) {
      console.error(err);
    };
  };

  // Notifications menu.
  const openNotificationsMenu = Boolean(anchorNotificationsMenu);

  // Notifications list open.
  const handleNotificationsMenuClick = (event) => {
    try {
      setAnchorNotificationsMenu(event.currentTarget);
    } catch (error) {
      console.error(err);
    };
  };

  // Notifications list close.
  const handleNotificationsMenuClose = () => {
    try {
      setAnchorNotificationsMenu(null);
    } catch (error) {
      console.error(err);
    };
  };

  // Sign out user.
  const logOut = () => {
    try {
      dispatch(resetSelectedChatState(null));
      dispatch(signout());
      
      // Disconnect from socket server.
      socket.disconnect();
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
          title='Search user by username'
          arrow
          enterDelay={500}
          enterNextDelay={500}
          placement='bottom-end'
          slotProps={{
            tooltip: { sx: { backgroundColor: 'rgb(93, 109, 126)', color: 'white', fontSize: '1.2rem' } },
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
              badgeContent={notifications.length}
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
            slotProps={{
              list: {
                'aria-labelledby': 'notifications-button'
              }
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
            <MenuList disablePadding>
              {
                notifications.length === 0
                &&
                <Box
                  component='div'
                  sx={{
                    fontSize: '1.4rem',
                    padding: '0rem 1rem'
                  }}
                >
                  No new messages
                </Box>
              }

              {
                notifications.map((notification) => (
                  <MenuItem
                    key={notification._id}
                    sx={{ fontSize: '1.4rem' }}
                    onClick={() => {
                      // Redirect to chat with new message.
                      dispatch(resetSelectedChatState(notification.chat));

                      const id = authState.user._id;

                      // Clear the message from notifications menu. ATTENTION!!! NOT DONE YET!!!
                      const updNotifications = authState.user.notifications.filter((element) => element._id !== notification._id);
                      dispatch(updateUser({ id, updNotifications }));
                    }}
                  >
                    {
                      notification.chat.isGroupChat
                        ? `New message in '${notification.chat.chatName}' chat`
                        : `New message from '${getSender(authState.user, notification.chat.users)}'`
                    }
                  </MenuItem>
                ))
              }
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
            slotProps={{
              list: {
                'aria-labelledby': 'user-menu-button'
              }
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
            <MenuList disablePadding>
              <MenuItem onClick={handleProfileModalOpen} sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}>
                <Avatar sx={{ fontSize: '2rem', marginRight: '0.5rem' }} src={authState.user.avatar} /> Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSettingsModalOpen} sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}>
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

      <SettingsModal
        isSettingsModalOpen={isSettingsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
      />
    </Fragment>
  );
};

export default Header;