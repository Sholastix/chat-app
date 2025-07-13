import { memo, useMemo } from 'react';
import { Skeleton, Stack } from '@mui/material';

const UserSearchLoading = () => {
  const skeletons = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => (
      <Skeleton
        key={index}
        variant='rounded'
        sx={{ height: '6rem', marginBottom: '1rem', width: '30rem' }}
      />
    ));
  }, []);

  return <Stack>{skeletons}</Stack>;
};

export default memo(UserSearchLoading);