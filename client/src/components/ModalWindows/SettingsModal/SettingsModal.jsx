import { memo, useCallback } from 'react';
import { Box, Dialog, DialogTitle, IconButton } from '@mui/material';

// MUI Icons.
import CloseIcon from '@mui/icons-material/Close';

const SettingsModal = ({ isSettingsModalOpen, setIsSettingsModalOpen }) => {
  // Close 'Settings' modal window.
  const handleSettingsModalClose = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, [setIsSettingsModalOpen]);

  return (
    <Dialog
      aria-labelledby='modal-user-menu-settings'
      open={isSettingsModalOpen}
      onClose={handleSettingsModalClose}
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
