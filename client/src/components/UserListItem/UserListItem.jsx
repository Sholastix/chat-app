import { memo } from 'react';
import { Avatar, Box, Typography } from '@mui/material';

const UserListItem = ({ user, handleFunction }) => {
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
      <Avatar src={user.avatar} sx={{ marginRight: '2rem' }} />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Typography component='div' sx={{ fontSize: '1.4rem' }}>
          {user.username}
        </Typography>

        <Typography component='div' sx={{ fontSize: '1.2rem' }}>
          <strong>Email:</strong> {user.email}
        </Typography>
      </Box>
    </Box>
  );
};

export default memo(UserListItem);
