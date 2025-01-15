import React from 'react';
import {
  Avatar,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography
} from '@mui/material';

// MUI Icons.
import CloseIcon from '@mui/icons-material/Close';

const ProfileModal = (props) => {
  const handleProfileModalClose = () => {
    props.setIsProfileModalOpen(false);
  };

  return (
    <Dialog
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
          width: '50rem',
        }}
      >
        <DialogTitle
          id='modal-user-menu-profile'
          component='div'
          sx={{
            textAlign: 'center',
            fontSize: '3rem',
          }}
        >
          {props.user.username}
        </DialogTitle>
        <IconButton
          aria-label='close'
          onClick={handleProfileModalClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon sx={{ fontSize: '2rem' }} />
        </IconButton>
        <DialogContent>
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
                height: '15rem',
                marginBottom: '4rem',
                width: '15rem'
              }}
            />
          </Typography>
          <Typography
            component='div'
            sx={{
              fontSize: '2rem',
              textAlign: 'center'
            }}
          >
            Email: {props.user.email}
          </Typography>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default ProfileModal;