import { useSelector } from 'react-redux';
import { Box } from '@mui/material';

const OnlineStatus = ({ online, chat }) => {
  const authState = useSelector((state) => {
    return state.authReducer;
  });

  const collocutorId = chat.users.filter((element) => element._id !== authState.user._id)[0]._id;

  return (
    <Box
      sx={{
        backgroundColor: `${online.some((element) => element.userId === collocutorId) ? 'lime' : 'white'}`,
        borderRadius: '50%',
        height: '1rem',
        marginRight: '1.5rem',
        width: '1rem',
      }}
    />
  );
};

export default OnlineStatus;
