import { Link as ReactRouterLink } from 'react-router-dom';
import { Box, Link, Typography } from '@mui/material';

const PageNotFound = () => (
  <Box
    component='div'
    sx={{
      alignItems: 'center',
      backgroundColor: 'rgb(93, 109, 126)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      justifyContent: 'center',
      padding: '5rem',
      width: '100vw',
    }}
  >
    <Typography
      component='div'
      sx={{
        fontFamily: 'Roboto',
        fontSize: { xs: '15rem', md: '25rem', lg: '35rem' },
      }}
    >
      404
    </Typography>

    <Box component='div'>
      <Box
        component='div'
        sx={{
          fontFamily: 'Roboto',
          fontSize: { xs: '3rem', md: '4rem' },
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        Page not found.
      </Box>

      <Box 
        component='p' 
        sx={{ fontFamily: 'Roboto', fontSize: '2rem', marginTop: '2rem' }}
      >
        Nothing interesting here, time to go
        <Link
          component={ReactRouterLink}
          to='/'
          sx={{
            color: 'gold',
            fontFamily: 'Roboto',
            marginLeft: '0.5rem',
            textDecoration: 'none',
            ':hover': { borderBottom: '0.2rem solid white' },
            ':visited': { color: 'black' },
          }}
        >
          back
        </Link>
      </Box>
    </Box>
  </Box>
);

export default PageNotFound;
