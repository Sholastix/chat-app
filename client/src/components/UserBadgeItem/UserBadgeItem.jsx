import { memo } from 'react';
import { Box, Typography } from '@mui/material';

// MUI Icons.
import CloseIcon from '@mui/icons-material/Close';

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'rgb(93, 109, 126)',
        borderRadius: '0.5rem',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        margin: '1rem 0.5rem 0.5rem 0rem',
        padding: '0.5rem',
        ':hover': { boxShadow: '0 0.2rem 1rem 0 rgba(0, 0, 0, 0.3)' },
      }}
      onClick={handleFunction}
    >
      <Typography component="div" sx={{ fontSize: '1.2rem' }}>
        {user.username}
      </Typography>
      <CloseIcon sx={{ marginLeft: '0.3rem', fontSize: '1.4rem' }} />
    </Box>
  );
};

export default memo(UserBadgeItem);
