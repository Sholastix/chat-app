import { Fragment, lazy, Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import debounce from 'lodash.debounce';
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
import Spinner from '../Spinner/Spinner';

// Components (lazy-loaded).
const LeftDrawer = lazy(() => import('../ModalWindows/LeftDrawer/LeftDrawer'));
const ProfileModal = lazy(() => import('../ModalWindows/ProfileModal/ProfileModal'));
const SettingsModal = lazy(() => import('../ModalWindows/SettingsModal/SettingsModal'));

// Socket.IO
import { socket } from '../../socket/socket';

// Functions.
import { signout } from '../../features/auth/authSlice';
import { fetchChat, resetChatState } from '../../features/chat/chatSlice';

const Header = () => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const user = useSelector((state) => state.authReducer.user);

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  // STATE.
  const [anchorUserMenu, setAnchorUserMenu] = useState(null);
  const [anchorNotificationsMenu, setAnchorNotificationsMenu] = useState(null);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const userId = user?._id;

  // Fetch notifications from the backend when the component mounts.
  const fetchNotifications = useCallback(async () => {
    try {
      if (userId) {
        const response = await axios.get(`/api/chat/notifications/${userId}`);

        // Filtering all notifications and return only notifications with 'isRead === false' status.
        const unreadNotifications = response.data.filter((element) => !element.isRead);

        setNotifications(unreadNotifications);
      }
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  const fetchNotificationsDebounced = useMemo(() => debounce(fetchNotifications, 300), [fetchNotifications]);

  // Change 'notificationAlert' STATE.
  useEffect(() => {
    const handleNotification = () => {
      fetchNotificationsDebounced();
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
      fetchNotificationsDebounced.cancel();
    };
  }, [fetchNotificationsDebounced]);

  // Trigger fetching for notifications counter in UI when user enters the app.
  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationItemClick = useCallback(async (notificationId, messageId) => {
    try {
      // Mark notification as 'read'.
      await axios.put(`/api/chat/notifications/${notificationId}/read`);

      // Remove the marked notification from the UI.
      setNotifications((prevNotifications) => prevNotifications.filter((element) => element._id !== notificationId));

      const chatId = messageId.chat;

      // Redirect to chat from notification.
      dispatch(fetchChat(chatId));
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  // User menu.
  const openUserMenu = Boolean(anchorUserMenu);

  // Open user menu.
  const handleUserMenuClick = useCallback((event) => {
    setAnchorUserMenu(event.currentTarget);
  }, []);

  // Close user menu.
  const handleUserMenuClose = useCallback(() => {
    setAnchorUserMenu(null);
  }, []);

  // Open user's profile modal window in user's menu.
  const handleProfileModalOpen = useCallback(() => {
    setIsProfileModalOpen(true);
    setAnchorUserMenu(null);
  }, []);

  // Open user's settings modal window in user's menu.
  const handleSettingsModalOpen = useCallback(() => {
    setIsSettingsModalOpen(true);
    setAnchorUserMenu(null);
  }, []);

  // Notifications menu.
  const openNotificationsMenu = Boolean(anchorNotificationsMenu);

  // Notifications list open.
  const handleNotificationsMenuClick = useCallback((event) => {
    setAnchorNotificationsMenu(event.currentTarget);
  }, []);

  // Notifications list close.
  const handleNotificationsMenuClose = useCallback(() => {
    setAnchorNotificationsMenu(null);
  }, []);

  // Sign out user.
  const logOut = useCallback(() => {
    try {
      // // Manually resets 'chat' STATE. Redundant because we handling 'chat' STATE reset inside the chatSlice by listening to the 'signout' action.
      // dispatch(resetChatState());

      // Resets 'auth' STATE and (because we connected 'signout' action to chatSlice) triggers 'chat' STATE reset via extraReducers too.
      dispatch(signout());

      // Close socket connection.
      if (socket.connected) {
        socket.disconnect();
      }
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  return (
    <Fragment>
      <Box
        sx={{
          alignItems: 'center',
          border: '0.5rem solid rgb(235, 235, 235)',
          display: 'flex',
          justifyContent: 'space-between',
          width: '100vw',
        }}
      >
        <Tooltip
          title="Search user by username"
          arrow
          enterDelay={500}
          enterNextDelay={500}
          placement="bottom-end"
          slotProps={{
            tooltip: { sx: { backgroundColor: 'rgb(93, 109, 126)', color: 'white', fontSize: '1.2rem' } },
            arrow: { sx: { color: 'rgb(93, 109, 126)' } },
          }}
        >
          <Button
            sx={{
              color: 'black',
              margin: '0.5rem 1rem',
              padding: '0.5rem 2rem',
              textTransform: 'none',
              ':hover': { backgroundColor: 'rgb(235, 235, 235)', color: 'black' },
            }}
            onClick={() => setIsLeftDrawerOpen(true)}
          >
            <SearchIcon sx={{ fontSize: '3rem', marginRight: '0.5rem' }} />
            <Typography sx={{ fontSize: '1.6rem', display: { xs: 'none', sm: 'flex' } }}>Search User</Typography>
          </Button>
        </Tooltip>

        <Typography component="div" sx={{ fontFamily: 'Georgia', fontSize: '3rem' }}>
          ChitChat
        </Typography>

        <div>
          <IconButton
            id="notifications-button"
            aria-label="notifications"
            aria-controls={openNotificationsMenu ? 'notifications-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openNotificationsMenu ? 'true' : undefined}
            onClick={handleNotificationsMenuClick}
          >
            <Badge
              badgeContent={notifications.length ? notifications.length : 0}
              max={99}
              color="primary"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: 'rgb(93, 109, 126)',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                },
              }}
            >
              <NotificationsOutlinedIcon sx={{ color: 'black', fontSize: '3rem' }} />
            </Badge>
          </IconButton>

          <Menu
            id="notifications-menu"
            anchorEl={anchorNotificationsMenu}
            open={openNotificationsMenu}
            slotProps={{
              list: {
                'aria-labelledby': 'notifications-button',
              },
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            onClose={handleNotificationsMenuClose}
          >
            <MenuList
              id="menu-list"
              component="div"
              disablePadding
              sx={{
                alignContent: 'center',
                height: 'fit-content',
                maxHeight: '35rem',
                minHeight: '5rem',
                overflowY: `${notifications.length === 0 ? 'hidden' : 'auto'}`,
                padding: '0rem 1rem',
                scrollbarWidth: 'thin',
              }}
            >
              {notifications.length === 0 && (
                <Box component="div" sx={{ fontSize: '1.4rem' }}>
                  No new messages
                </Box>
              )}

              {notifications.map((notification) => (
                <MenuItem
                  id="menu-item"
                  divider
                  key={notification._id}
                  sx={{ height: '5rem', width: '30rem' }}
                  onClick={() => handleNotificationItemClick(notification._id, notification.messageId)}
                >
                  <Box component="div" sx={{ display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
                    <Typography component="div" sx={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                      {notification.content + ':'}
                    </Typography>

                    <Typography component="div" sx={{ fontSize: '1.4rem' }}>
                      {notification.messageId?.content || 'Message not found.'}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Button
            id="user-menu-button"
            aria-controls={openUserMenu ? 'user-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openUserMenu ? 'true' : undefined}
            onClick={handleUserMenuClick}
            endIcon={<KeyboardArrowDownIcon />}
            sx={{
              color: 'black',
              margin: '0.5rem 1rem',
              padding: '0.5rem 2rem',
              textTransform: 'none',
              ':hover': { backgroundColor: 'rgb(235, 235, 235)', color: 'black' },
            }}
          >
            <Avatar sx={{ fontSize: '2rem', marginRight: '0.5rem' }} src={user?.avatar} />

            <Typography sx={{ fontSize: '1.4rem' }}>{user?.username}</Typography>
          </Button>

          <Menu
            id="user-menu"
            anchorEl={anchorUserMenu}
            open={openUserMenu}
            slotProps={{
              list: {
                'aria-labelledby': 'user-menu-button',
              },
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              horizontal: 'right',
              vertical: 'top',
            }}
            onClose={handleUserMenuClose}
          >
            <MenuList disablePadding>
              <MenuItem onClick={handleProfileModalOpen} sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}>
                <Avatar sx={{ fontSize: '2rem', marginRight: '0.5rem' }} src={user.avatar} /> Profile
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
      
      {isLeftDrawerOpen && (
        <Suspense fallback={<Spinner />}>
          <LeftDrawer isLeftDrawerOpen={isLeftDrawerOpen} setIsLeftDrawerOpen={setIsLeftDrawerOpen} />
        </Suspense>
      )}
      
      {isProfileModalOpen && (
        <Suspense fallback={<Spinner />}>
          <ProfileModal isProfileModalOpen={isProfileModalOpen} setIsProfileModalOpen={setIsProfileModalOpen} user={user} />
        </Suspense>
      )}
      
      {isSettingsModalOpen && (
        <Suspense fallback={<Spinner />}>
          <SettingsModal isSettingsModalOpen={isSettingsModalOpen} setIsSettingsModalOpen={setIsSettingsModalOpen} />
        </Suspense>
      )}
    </Fragment>
  );
};

export default Header;
