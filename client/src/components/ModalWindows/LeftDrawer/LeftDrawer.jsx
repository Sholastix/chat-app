import React from 'react';
import { Box, Drawer, Typography } from '@mui/material';

const LeftDrawer = (props) => {
  const handleLeftDrawerClose = () => {
    props.setIsLeftDrawerOpen(false);
  };

  return (
    <Drawer
      anchor='left'
      open={props.isLeftDrawerOpen}
      onClose={handleLeftDrawerClose}
    >
      <Box
        role='presentation'
        sx={{
          padding: '2rem',
          textAlign: 'center',
          width: '20vw'
        }}
      >
        <Typography variant='h6' component='div'>
          Left Panel
        </Typography>
      </Box>
    </Drawer>
  );
};

export default LeftDrawer;
