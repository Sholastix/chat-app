import { Link as ReactRouterLink } from 'react-router-dom';
import { memo, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { 
  Avatar,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Link,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// MUI Icons.
import CloseIcon from '@mui/icons-material/Close';

const ProfileModal = ({ isProfileModalOpen, setIsProfileModalOpen, user }) => {
  // Get only auth user directly from auth STATE.
  const authUser = useSelector((state) => state.authReducer.user);

  // Memoize auth user ID to prevent unnecessary recomputations.
  const authUserId = useMemo(() => authUser?._id, [authUser]);

  // Close profile modal window.
  const handleProfileModalClose = useCallback(() => {
    setIsProfileModalOpen(false);
  }, [setIsProfileModalOpen]);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const paperWidth = fullScreen ? '100%' : '50rem';

  return (
    <Dialog 
      aria-labelledby='modal-user-menu-profile'
      open={isProfileModalOpen} 
      onClose={handleProfileModalClose}
      fullScreen={fullScreen}
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '0.5rem',
          maxWidth: '100%',
          width: paperWidth,
        },
      }}
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
          {user.username}
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
              src={user.avatar}
              sx={{ height: '15rem', marginBottom: '2rem', width: '15rem' }}
            />
          </Typography>

          <Typography
            component='div'
            sx={{ fontSize: '2rem', marginBottom: '3rem', textAlign: 'center' }}
          >
            {user.email}
          </Typography>

          {user._id === authUserId ? (
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

export default memo(ProfileModal);
