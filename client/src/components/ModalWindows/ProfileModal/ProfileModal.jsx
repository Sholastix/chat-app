import React from 'react';
import {
  Avatar,
  Box,
  Modal,
  Typography
} from '@mui/material';

const ProfileModal = (props) => {
  const handleProfileModalClose = () => {
    props.setIsProfileModalOpen(false);
  };

  return (
    <Modal
      open={props.isProfileModalOpen}
      onClose={handleProfileModalClose}
      aria-labelledby='modal-user-menu-profile'
    >
      <Box
        sx={{
          backgroundColor: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          left: '50vw',
          padding: '3rem',
          position: 'fixed',
          top: '50vh',
          transform: 'translate(-50%, -50%)',
          width: '40rem',
        }}
      >
        <Typography
          id='modal-user-menu-profile'
          component='div'
          sx={{
            textAlign: 'center',
            fontSize: '3rem',
          }}
        >
          {props.user.username}
        </Typography>
        <Typography
          component='div'
          sx={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Avatar
            src={props.user.avatar}
            sx={{
              height: '10rem',
              margin: '3rem 0rem',
              width: '10rem'
            }}
          />
        </Typography>
        <Typography
          component='div'
          sx={{
            fontSize: '1.6rem',
            textAlign: 'center'
          }}
        >
          Email: {props.user.email}
        </Typography>
      </Box>
    </Modal>
  );
};

export default ProfileModal;