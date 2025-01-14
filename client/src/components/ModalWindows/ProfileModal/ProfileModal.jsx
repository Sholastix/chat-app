import React from 'react';
import {
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
          borderRadius: '0.3rem',
          left: '50vw',
          padding: '1rem',
          position: 'fixed',
          top: '50vh',
          transform: 'translate(-50%, -50%)',
          width: '50rem',
        }}
      >
        <Typography
          id='modal-user-menu-profile'
          component='div'
          sx={{ 
            textAlign: 'center',
            fontSize: '2rem' ,
          }}
        >
          {props.user.username}
        </Typography>
      </Box>
    </Modal>
  );
};

export default ProfileModal;