import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box } from '@mui/material';

// Components.
import ChatBox from '../../components/ChatBox/ChatBox';
import ChatsList from '../../components/ChatsList/ChatsList';
import Header from '../../components/Header/Header';
import Spinner from '../../components/Spinner/Spinner';

// Socket.IO
import { socket } from '../../socket/socket';

// Hooks.
import { useAuthGuard } from '../../hooks/useAuthGuard';

// Functions.
import { onlineUsers } from './chatSlice';

const Chat = () => {
  const authUser = useSelector((state) => state.authReducer.user);
  const authLoading = useSelector((state) => state.authReducer.loading);

  const dispatch = useDispatch();

  // STATE.
  const [fetchAgain, setFetchAgain] = useState(false);

  // Check auth token.
  useAuthGuard();

  useEffect(() => {
    // Wait for user info.
    if (!authUser) {
      return;
    }

    // User connects to the app.
    if (!socket.connected) {
      socket.connect();
      socket.emit('user_add', authUser);
    }
    
    socket.on('connected', (data) => {
      console.log('SOCKET_STATUS: ', socket.connected);
      console.log('CONNECTED: ', data);
    });

    socket.on('users_online', (data) => {
      dispatch(onlineUsers(data));
    });

    socket.on('disconnect', (reason) => {
      console.log('SOCKET_STATUS: ', socket.connected);
      console.log(`DISCONNECTED_FOR_REASON: ${reason}`);
    });

    return () => {
      socket.off('connected');
      socket.off('users_online');
      socket.off('disconnect');

      // // Disconnect socket on 'Chat' unmount (OPTIONAL).
      // socket.disconnect();
    };
  }, [authUser, dispatch]);

  return (
    <>
      {!authLoading && authUser ? (
        <Box component='div' sx={{ width: '100vw' }}>
          <Header />
          <Box
            component="div"
            sx={{
              backgroundColor: 'rgb(93, 109, 126)',
              display: 'flex',
              justifyContent: 'space-between',
              height: '92.61vh',
              padding: '1rem',
              width: '100vw',
            }}
          >
            <ChatsList fetchAgain={fetchAgain} />
            <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            height: '100vh',
            justifyContent: 'center',
          }}
        >
          <Spinner />
        </Box>
      )}
    </>
  );
};

export default Chat;
