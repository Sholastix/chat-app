import { 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  message = 'Are you sure?',
  title = 'Confirm',
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const paperWidth = fullScreen ? '100%' : '40rem';

  return (
    <Dialog
      aria-describedby='confirm-dialog-description'
      aria-labelledby='confirm-dialog-title'
      open={open}
      onClose={onClose}
      disableRestoreFocus
      sx={{
        '& .MuiDialog-paper': {
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '100%',
          padding: '1rem 0rem',
          width: paperWidth,
        },
      }}
    >
      <DialogTitle id='confirm-dialog-title' sx={{ color: 'rgba(114, 144, 177, 1);', fontSize: '1.6rem', textTransform: 'uppercase' }}>
        {title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText id='confirm-dialog-description' sx={{ color: 'black', fontSize: '1.6rem' }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button 
          autoFocus
          type='button'
          variant='outlined'
          sx={{
            borderColor: 'lightgray',
            color: 'black',
            fontSize: '1.1rem',
            height: '3rem',
            marginBottom: '1rem',
            ':hover': { backgroundColor: 'lightgreen' },
          }}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>

        <Button
          type='button'
          variant='outlined'
          sx={{
            borderColor: 'lightgray',
            color: 'black',
            fontSize: '1.1rem',
            height: '3rem',
            marginBottom: '1rem',
            ':hover': { backgroundColor: 'red' },
          }}
          onClick={onClose}
        >
          {cancelText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
