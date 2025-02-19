import React from 'react';
import { Alert } from '@mui/material';

const AlertComponent = ({ handleFunction, severityType, message }) => {
  return (
    <Alert
      onClose={handleFunction}
      severity={`${severityType}`}
      slotProps={{
        closeIcon: { sx: { fontSize: '1.6rem' } }
      }}
      sx={{
        color: 'black',
        fontSize: '1.4rem',
        width: '100%',
      }}
    >
      {`${message}`}
    </Alert>
  );
};

export default AlertComponent;