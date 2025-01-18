import React from 'react';
import { Typography } from '@mui/material';

const UserListItem = (props) => {
  return (
    <Typography
      component='div'
      sx={{
        scrollBehavior: 'smooth',
        border: '0.1rem solid lightgray',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '1.4rem',
        marginTop: '1rem',
        padding: '1rem 0rem',
        ':hover': { boxShadow: '0 0.2rem 1rem 0 rgba(0, 0, 0, 0.3)' }
      }}
      onClick={props.handleFunction}
    >
      {props.user.username}
    </Typography>
  );
};

export default UserListItem;