import { memo } from 'react';
import { Button, Tooltip, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchButton = memo(({ onOpen }) => (
  <Tooltip
    title='Search user by username'
    arrow
    enterDelay={500}
    enterNextDelay={500}
    placement='bottom-end'
    slotProps={{
      tooltip: { sx: { backgroundColor: 'rgb(93, 109, 126)', color: 'white', fontSize: '1.2rem' } },
      arrow: { sx: { color: 'rgb(93, 109, 126)' } },
    }}
  >
    <Button
      sx={{
        color: 'black',
        margin: '0.5rem 1rem',
        padding: '0.5rem 2rem',
        textTransform: 'none',
        ':hover': { backgroundColor: 'rgb(235, 235, 235)', color: 'black' },
      }}
      onClick={onOpen}
    >
      <SearchIcon sx={{ fontSize: '3rem', marginRight: '0.5rem' }} />
      <Typography sx={{ fontSize: '1.6rem', display: { xs: 'none', sm: 'flex' } }}>Search User</Typography>
    </Button>
  </Tooltip>
));

export default SearchButton;
