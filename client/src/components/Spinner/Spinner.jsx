import { Box } from '@mui/material';

import spinner from './spinner.gif';

const Spinner = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <Box
        component='img'
        src={spinner}
        alt='LOADING...'
        sx={{
          marginTop: '40rem',
          height: '5rem',
          width: '5rem'
        }} />
    </Box>
  );
};

export default Spinner;