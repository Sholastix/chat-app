import { memo, useCallback } from 'react';
import { Dialog, DialogTitle, IconButton, useMediaQuery } from '@mui/material';
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
          maxWidth: '100%',
          width: paperWidth,
        },
      }}
    >
      <DialogTitle
        component='div'
        id='modal-user-menu-settings'
        sx={{ fontSize: '2rem', fontFamily: 'Roboto', textAlign: 'center' }}
      >
        Settings
      </DialogTitle>

      <IconButton
        aria-label='close'
        onClick={handleSettingsModalClose}
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
        <CloseIcon sx={{ fontSize: '2rem' }} />
      </IconButton>
    </Dialog>
  );
};

export default memo(SettingsModal);
