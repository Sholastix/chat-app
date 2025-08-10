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
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '100%',
          padding: '2rem',
          width: paperWidth,
        },
      }}
    >
      <IconButton
        aria-label='close'
        onClick={handleProfileModalClose}
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
        <CloseIcon sx={{ fontSize: '2rem' }} />
      </IconButton>

      <Box>
        <DialogTitle
          component='div'
          id='modal-user-menu-profile'
          sx={{ textAlign: 'center', fontSize: '3rem' }}
        >
          {user.username}
        </DialogTitle>

        <DialogContent sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
          <Avatar
            src={user.avatar}
            sx={{ height: '15rem', marginBottom: '2rem', width: '15rem' }}
          />

          <Typography
            component='div'
            sx={{ fontSize: '2rem', marginBottom: '3rem' }}
          >
            {user.email}
          </Typography>

          {user._id === authUserId && (
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
          )}
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default memo(ProfileModal);
