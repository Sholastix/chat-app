import { Box } from '@mui/material';

import spinner from './spinner.gif';

const Spinner = () => {
  return (
    <Box
      component='img'
      src={spinner}
      alt='LOADING...'
      sx={{
        height: '5rem',
        width: '5rem'
      }} />
  );
};

export default Spinner;