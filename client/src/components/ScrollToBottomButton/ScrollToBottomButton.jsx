import { useState, useEffect, Fragment } from 'react';
import { Box } from '@mui/material';

const ScrollToBottomButton = (props) => {
  const [isScrollToBottomButtonVisible, setIsScrollToBottomButtonVisible] = useState(false);

  useEffect(() => {
    toggleScrollToBottomButtonVisibility();
  });

  // Conditionally show or hide 'scrollToBottom' button.
  const toggleScrollToBottomButtonVisibility = () => {
    if (props.scrollbarPosition && props.scrollbarPosition < 95) {
      setIsScrollToBottomButtonVisible(true);
    } else {
      setIsScrollToBottomButtonVisible(false);
    }
  };

  return (
    <Fragment>
      {isScrollToBottomButtonVisible && (
        <Box
          component='button'
          sx={{
            alignSelf: 'flex-end',
            backgroundColor: 'rgb(93, 109, 126)',
            border: 'none',
            borderRadius: '50%',
            height: '4rem',
            margin: '2rem',
            opacity: '0.5',
            position: 'fixed',
            right: '1rem',
            top: '83%',
            width: '4rem',
            ':hover': {
              boxShadow: '0 0.5rem 1rem 0 rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
              opacity: '1',
            },
          }}
          onClick={props.scrollToBottom}
        >
          <Box
            component='p'
            sx={{
              color: 'white',
              fontSize: '2.5rem',
              paddingBottom: '0.5rem',
            }}
          >
            &#x2193;
          </Box>
        </Box>
      )}
    </Fragment>
  );
};

export default ScrollToBottomButton;
