import { Link as ReactRouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Avatar, Box, Dialog, DialogTitle, DialogContent, IconButton, Link, Typography } from '@mui/material';

// MUI Icons.
import CloseIcon from '@mui/icons-material/Close';

const ProfileModal = (props) => {
  const authState = useSelector((state) => {
    return state.authReducer;
  });

  // Close profile modal window.
  const handleProfileModalClose = () => {
    try {
      props.setIsProfileModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog 
      aria-labelledby='modal-user-menu-profile'
      open={props.isProfileModalOpen} 
      onClose={handleProfileModalClose} 
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
          component='div'
          id='modal-user-menu-profile'
          sx={{ textAlign: 'center', fontSize: '3rem' }}
        >
          {props.user.username}
        </DialogTitle>

        <IconButton
          aria-label='close'
          onClick={handleProfileModalClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon sx={{ fontSize: '2rem' }} />
        </IconButton>

        <DialogContent>
          <Typography
            component='div'
            sx={{ display: 'flex', justifyContent: 'center' }}
          >
            <Avatar
              src={props.user.avatar}
              sx={{ height: '15rem', marginBottom: '2rem', width: '15rem' }}
            />
          </Typography>

          <Typography
            component='div'
            sx={{ fontSize: '2rem', marginBottom: '3rem', textAlign: 'center' }}
          >
            {props.user.email}
          </Typography>

          {props.user._id === authState.user._id ? (
            <Link
              component={ReactRouterLink}
              to='/profile'
              sx={{
                display: 'flex',
                justifyContent: 'center',
                fontSize: '1.6rem',
                textDecoration: 'none',
              }}
            >
              Edit Profile
            </Link>
          ) : null}
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default ProfileModal;
