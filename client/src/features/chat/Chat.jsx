import { useState, Fragment } from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';

// Components.
import ChatBox from '../../components/ChatBox/ChatBox';
import ChatsList from '../../components/ChatsList/ChatsList';
import Header from '../../components/Header/Header';
import Spinner from '../../components/Spinner/Spinner';

const Chat = () => {
  const [fetchAgain, setFetchAgain] = useState(false);

  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  return (
    <Fragment>
      {
        !authState.loading && authState.user
          ?
          <Box
            component='div'
            sx={{ width: '100vw' }}
          >
            <Header />
            <Box
              component='div'
              sx={{
                backgroundColor: 'rgb(93, 109, 126)',
                display: 'flex',
                justifyContent: 'space-between',
                height: '92.61vh',
                padding: '1rem',
                width: '100vw'
              }}
            >
              <ChatsList fetchAgain={fetchAgain} />
              <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
            </Box>
          </Box>
          :
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
      }
    </Fragment>
  );
};

export default Chat;