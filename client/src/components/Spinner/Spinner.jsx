import { Box } from '@mui/material';

import spinner from './spinner.gif';

const Spinner = () => {
  return (
    <Box
      component='img'
      src={spinner}
      alt='LOADING...'
      draggable='false'
      role='img'
      sx={{
        display: 'block',
        height: '5rem',
        width: '5rem',
      }}
    />
  );
};

export default Spinner;
