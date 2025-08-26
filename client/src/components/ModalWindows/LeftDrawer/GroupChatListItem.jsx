import { memo } from 'react';
import { Avatar, Box, Typography } from '@mui/material';

const GroupChatListItem = ({ chat, handleFunction }) => {
  return (
    <Box
      sx={{
        alignItems: 'center',
        border: '0.1rem solid lightgray',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        display: 'flex',
        fontSize: '1.4rem',
        marginTop: '1rem',
        padding: '1rem 2rem',
        ':hover': { boxShadow: '0 0.2rem 1rem 0 rgba(0, 0, 0, 0.3)' },
      }}
      onClick={handleFunction}
    >
      <Avatar src='https://img.icons8.com/parakeet-line/48/group.png' sx={{ marginRight: '2rem' }} />

      <Typography sx={{ fontSize: '1.4rem' }}>
				{chat.chatName}
			</Typography>
    </Box>
  );
};

export default memo(GroupChatListItem);
