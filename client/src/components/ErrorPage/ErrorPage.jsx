import { Box, Typography } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const ErrorPage = () => (
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
    <ReportProblemIcon
      sx={{
        fontSize: { xs: '15rem', md: '25rem', lg: '35rem' },
        marginBottom: { xs: '1rem', sm: '3rem' },
      }}
    />

    <Typography
      sx={{
        fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
        fontWeight: 'bold',
        textAlign: 'justify',
      }}
    >
      Oops! Something went wrong!
    </Typography>

    <Typography
      sx={{
        fontSize: { xs: '1.4rem', sm: '2rem' },
        margin: '1rem 0rem',
        textAlign: 'justify',
      }}
    >
      Try refreshing the page or come back later.
    </Typography>
  </Box>
);

export default ErrorPage;
