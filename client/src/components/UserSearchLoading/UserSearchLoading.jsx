import React from 'react';
import { Skeleton, Stack, Typography } from '@mui/material';

// Components.
import Spinner from '../Spinner/Spinner';

const UserSearchLoading = () => {
  return (
    // <Typography
    //   component='div'
    //   sx={{
    //     position: 'fixed',
    //     top: '0%', 
    //     left: '9%'
    //   }}
    // >
    //   <Spinner />
    // </Typography>
    <Stack>
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
      <Skeleton variant='rounded' sx={{ height: '3.4rem', marginBottom: '1rem' }} />
    </Stack>
  );
};

export default UserSearchLoading;