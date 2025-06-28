import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';

// Components.
import Spinner from '../Spinner/Spinner';

// Components (lazy-loaded).
const SingleChat = lazy(() => import('../SingleChat/SingleChat'));

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  // Get 'selectedChat' from chat STATE.
  const { selectedChat } = useSelector((state) => {
    return state.chatReducer;
  });

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        display: { xs: selectedChat ? 'flex' : 'none', md: 'flex' },
        fontSize: '3rem',
        padding: '1rem',
        width: { xs: '100%', md: '74%' },
      }}
    >
      {/* Must remember - lazy loading will not work without condition (as 'selectedChat === true' in our case) */}
      {selectedChat && (
        <Suspense fallback={<Spinner />}>
          <SingleChat 
            fetchAgain={fetchAgain} 
            setFetchAgain={setFetchAgain} 
          />
        </Suspense>
      )}
    </Box>
  );
};

// For debugging purposes.
ChatBox.displayName = 'ChatBox';

export default ChatBox;
