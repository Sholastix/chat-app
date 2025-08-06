import { lazy, memo, Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { Box, Typography } from '@mui/material';

// Components.
import SearchButton from './SearchButton';
import Spinner from '../Spinner/Spinner';
import NotificationsMenu from './NotificationsMenu';
import UserMenu from './UserMenu';

// Components (lazy-loaded).
const LeftDrawer = lazy(() => import('../ModalWindows/LeftDrawer/LeftDrawer'));
const ProfileModal = lazy(() => import('../ModalWindows/ProfileModal/ProfileModal'));
const SettingsModal = lazy(() => import('../ModalWindows/SettingsModal/SettingsModal'));

// Socket.IO
import { socket } from '../../socket/socket';

// Functions.
import { signout } from '../../features/auth/authSlice';
import { fetchChat } from '../../features/chat/chatSlice';

const Header = () => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const user = useSelector((state) => state.authReducer.user);
  const userId = user?._id;
  const username = user?.username;
  const avatar = user?.avatar;

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  // STATE.
  const [anchorUserMenu, setAnchorUserMenu] = useState(null);
  const [anchorNotificationsMenu, setAnchorNotificationsMenu] = useState(null);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

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
    if (userId) fetchNotifications();
  }, [userId, fetchNotifications]);

  const handleNotificationItemClick = useCallback(
    async (notificationId, messageId) => {
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
    },
    [dispatch]
  );

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

  // Search menu open.
  const handleSearchButtonModalOpen = useCallback(() => {
    setIsLeftDrawerOpen(true);
  }, []);

  // Sign out user.
  const logOut = useCallback(() => {
    try {
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
    <>
      <Box
        component='div'
        sx={{
          alignItems: 'center',
          display: 'flex',
          height: '7vh',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div>
          <SearchButton onOpen={handleSearchButtonModalOpen} />
        </div>

        <Typography sx={{ fontFamily: 'Georgia', fontSize: { xs: '2rem', sm: '3rem' } }}>ChitChat</Typography>

        <Box component='div' sx={{ display: 'flex' }}>
          <NotificationsMenu
            anchorNotificationsMenu={anchorNotificationsMenu}
            handleNotificationItemClick={handleNotificationItemClick}
            handleNotificationsMenuClick={handleNotificationsMenuClick}
            handleNotificationsMenuClose={handleNotificationsMenuClose}
            notifications={notifications}
            openNotificationsMenu={openNotificationsMenu}
          />

          <UserMenu
            anchorUserMenu={anchorUserMenu}
            avatar={avatar}
            handleProfileModalOpen={handleProfileModalOpen}
            handleSettingsModalOpen={handleSettingsModalOpen}
            handleUserMenuClick={handleUserMenuClick}
            handleUserMenuClose={handleUserMenuClose}
            logOut={logOut}
            openUserMenu={openUserMenu}
            username={username}
          />
        </Box>
      </Box>

      {isLeftDrawerOpen && (
        <Suspense fallback={<Spinner />}>
          <LeftDrawer isLeftDrawerOpen={isLeftDrawerOpen} setIsLeftDrawerOpen={setIsLeftDrawerOpen} />
        </Suspense>
      )}

      {isProfileModalOpen && (
        <Suspense fallback={<Spinner />}>
          <ProfileModal
            isProfileModalOpen={isProfileModalOpen}
            setIsProfileModalOpen={setIsProfileModalOpen}
            user={user}
          />
        </Suspense>
      )}

      {isSettingsModalOpen && (
        <Suspense fallback={<Spinner />}>
          <SettingsModal isSettingsModalOpen={isSettingsModalOpen} setIsSettingsModalOpen={setIsSettingsModalOpen} />
        </Suspense>
      )}
    </>
  );
};

export default memo(Header);
