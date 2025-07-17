import { memo, useMemo } from 'react'
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';

const OnlineStatus = ({ online, chat }) => {
  const authUser = useSelector((state) => state.authReducer.user);

  // Stop rendering if user data is not available.
  if (!authUser) return null;

  // Memoized to avoid repeated filtering.
  const collocutorId = useMemo(() => {
    return chat.users.find((user) => user._id !== authUser._id)?._id;
  }, [chat.users, authUser._id]);

  // Memoized to reduce unnecessary recalculations.
  const isOnline = useMemo(() => {
    return online.some((element) => element.userId === collocutorId);
  }, [online, collocutorId]);

  return (
    <Box
      sx={{
        backgroundColor: isOnline ? 'lime' : 'white',
        borderRadius: '50%',
        height: '1rem',
        marginRight: '1.5rem',
        width: '1rem',
      }}
    />
  );
};

// Optional: memoized with 'areEqual()' for stability.
function areEqual(prevProps, nextProps) {
  return (
    prevProps.chat._id === nextProps.chat._id &&
    prevProps.chat.users === nextProps.chat.users &&
    prevProps.online === nextProps.online
  );
}

export default memo(OnlineStatus, areEqual);
