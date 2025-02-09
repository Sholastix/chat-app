import React from 'react';
import { Box, Typography } from '@mui/material';

const UserBadgeItem = (props) => {
  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'rgb(93, 109, 126)',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        margin: '0rem 0.5rem',
        padding: '0.5rem 1rem',
        ':hover': { boxShadow: '0 0.2rem 1rem 0 rgba(0, 0, 0, 0.3)' }
      }}
      onClick={props.handleFunction}
    >
      <Typography
        component='div'
        sx={{
          color: 'white',
          fontSize: '1.2rem',
        }}
      >
        {props.user.username}
      </Typography>
    </Box>
  );
};

export default UserBadgeItem;