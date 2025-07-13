import { memo } from 'react';
import { Alert as MuiAlert } from '@mui/material';

const Alert = ({ handleFunction, severityType, message }) => {
  return (
    <MuiAlert
      role='alert'
      severity={severityType}
      slotProps={{
        closeIcon: { sx: { fontSize: '1.6rem' } },
      }}
      sx={{ color: 'black', fontSize: '1.4rem', width: '100%' }}
      onClose={handleFunction}
    >
      {message}
    </MuiAlert>
  );
};

export default memo(Alert);
