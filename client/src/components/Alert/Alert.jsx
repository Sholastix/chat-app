import { memo } from 'react';
import { Alert as MuiAlert } from '@mui/material';

const Alert = memo(({ handleFunction, severityType, message }) => {
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
});

// In React, the 'displayName' property defines what name appears in React DevTools and other debugging tools when we're inspecting our component tree.
Alert.displayName = 'Alert';

export default Alert;
