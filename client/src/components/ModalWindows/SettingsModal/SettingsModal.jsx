import { memo, useCallback } from 'react';
import { Box, Dialog, DialogTitle, IconButton, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// MUI Icons.
import CloseIcon from '@mui/icons-material/Close';

const SettingsModal = ({ isSettingsModalOpen, setIsSettingsModalOpen }) => {
  // Close 'Settings' modal window.
  const handleSettingsModalClose = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, [setIsSettingsModalOpen]);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const paperWidth = fullScreen ? '100%' : '50rem';

  return (
    <Dialog
      aria-labelledby='modal-user-menu-settings'
      open={isSettingsModalOpen}
      onClose={handleSettingsModalClose}
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
          alignItems: 'center',
          backgroundColor: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
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
          id='modal-user-menu-settings'
          sx={{
            fontSize: '2rem',
            fontFamily: 'Roboto',
            textAlign: 'center',
          }}
        >
          Settings
        </DialogTitle>

        <IconButton
          aria-label='close'
          onClick={handleSettingsModalClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon sx={{ fontSize: '2rem' }} />
        </IconButton>
      </Box>
    </Dialog>
  );
};

export default memo(SettingsModal);
