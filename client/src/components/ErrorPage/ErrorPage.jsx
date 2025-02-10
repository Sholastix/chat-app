import { Link as ReactRouterLink } from 'react-router-dom';
import { Box, Link, Typography } from '@mui/material';

const ErrorPage = () => {
  return (
    <Box
      component='div'
      sx={{
        alignItems: 'center',
        backgroundColor: 'rgb(93, 109, 126)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw'
      }}
    >
      <Typography
        component='div'
        sx={{
          fontSize: '30rem',
          margin: '10rem 0rem'
        }}
      >
        404
      </Typography>

      <div>
        <Box
          component='div'
          sx={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '5rem',
            textAlign: 'center'
          }}
        >
          PAGE NOT FOUND
        </Box>

        <Box
          component='p'
          sx={{
            fontSize: '2rem',
            marginBottom: '3rem'
          }}
        >
          Nothing interesting here, time to go
          <Link
            component={ReactRouterLink}
            to='/'
            sx={{
              textDecoration: 'none',
              color: 'gold',
              marginLeft: '0.5rem',
              ':hover': { borderBottom: '0.2rem solid white' },
              ':visited': { color: 'black' }
            }}
          >
            back
          </Link>
        </Box>
      </div>
    </Box>
  );
};

export default ErrorPage;