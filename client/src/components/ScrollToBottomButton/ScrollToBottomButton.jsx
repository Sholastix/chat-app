import { useState, useEffect } from 'react';
import { Box } from '@mui/material';

const ScrollToBottomButton = ({ scrollbarPosition, scrollToBottom }) => {
  const [isScrollToBottomButtonVisible, setIsScrollToBottomButtonVisible] = useState(false);

  useEffect(() => {
    toggleScrollToBottomButtonVisibility();
  }, [scrollbarPosition]);

  // Conditionally show or hide 'scrollToBottom' button.
  const toggleScrollToBottomButtonVisibility = () => {
    if (scrollbarPosition != null && scrollbarPosition < 95) {
      setIsScrollToBottomButtonVisible(true);
    } else {
      setIsScrollToBottomButtonVisible(false);
    }
  };

  return (
    <>
      {isScrollToBottomButtonVisible && (
        <Box
          component='button'
          aria-label='scroll to bottom'
          type='button'
          sx={{
            alignSelf: 'flex-end',
            backgroundColor: 'rgb(93, 109, 126)',
            border: 'none',
            borderRadius: '50%',
            height: '4rem',
            margin: '0rem 2rem 2rem 2rem',
            opacity: 0.5,
            position: 'fixed',
            right: '1rem',
            top: '80%',
            width: '4rem',
            ':hover': {
              boxShadow: '0 0.5rem 1rem 0 rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
              opacity: 1,
            },
          }}
          onClick={scrollToBottom}
        >
          <Box
            component='p'
            sx={{
              color: 'white',
              fontSize: '2.5rem',
              paddingBottom: '0.5rem',
              userSelect: 'none'
            }}
          >
            &#x2193;
          </Box>
        </Box>
      )}
    </>
  );
};

export default ScrollToBottomButton;
