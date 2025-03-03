import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Avatar,
  Box,
  Tooltip
} from '@mui/material';
import Lottie from 'react-lottie-player/dist/LottiePlayerLight';

// Assets (typing animation).
import typingAnimation from '../../assets/animations/typing.json';

// Functions.
import { isLastMessage, isSameSender } from '../../helpers/chatLogic';

const ScrollableChatWindow = ({ messages, isTypingIndicatorVisible }) => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  // Current user's ID.
  const userId = authState.user._id;

  // const [scrollbarPosition, setScrollbarPosition] = useState(0);

  const chatEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // // Calculate the scrollbar position in percentage.
  // const handleScroll = (event) => {
  //   const { scrollTop, scrollHeight, clientHeight } = event.target;
  //   const position = Math.ceil((scrollTop / (scrollHeight - clientHeight)) * 100);
  //   // console.log('POSITION: ', position);
  //   setScrollbarPosition(position);
  // };

  // Auto-scrolling chat to the end.
  const scrollToBottom = () => {
    try {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    };
  };

  return (
    <Box
      component='div'
      sx={{
        borderRadius: '0.5rem',
        height: '100%',
        overflowY: 'scroll',
        padding: '1rem',
        scrollbarWidth: 'none',
      }}
    // onScroll={handleScroll}
    >
      {
        messages.map((message, index) => (
          <div key={message._id}>
            <Box
              component='div'
              sx={{
                display: 'flex',
                justifyContent: `${message.sender._id === userId ? 'flex-end' : 'flex-start'}`,
                margin: '0.5rem 0rem'
              }}
            >
              {
                (isSameSender(messages, message, index, userId) || isLastMessage(messages, index, userId))
                &&
                <Tooltip
                  title={message.sender.username}
                  placement='bottom-start'
                  arrow
                  slotProps={{
                    tooltip: { sx: { fontSize: '1.2rem', backgroundColor: 'rgb(93, 109, 126)', color: 'white' } },
                    arrow: { sx: { color: 'rgb(93, 109, 126)' } }
                  }}
                >
                  <Avatar
                    src={message.sender.avatar}
                    sx={{
                      cursor: 'pointer',
                      height: '4rem',
                      width: '4rem'
                    }}
                  />
                </Tooltip>
              }

              <Box
                component='span'
                sx={{
                  alignContent: 'center',
                  backgroundColor: `${message.sender._id === userId ? 'rgb(200, 240, 200)' : 'rgb(233, 233, 233)'}`,
                  borderRadius: `${message.sender._id === userId ? '1rem 1rem 0rem 1rem' : '0rem 1rem 1rem 1rem'}`,
                  fontSize: '1.6rem',
                  marginLeft: `${isSameSender(messages, message, index, userId) || isLastMessage(messages, index, userId) ? '0rem' : '4rem'}`,
                  overflowWrap: 'break-word',
                  padding: '1rem',
                  width: 'fit-content',
                  maxWidth: '50%',
                }}
              >
                {message.content}
              </Box>
            </Box>
          </div>
        ))
      }

      <Box
        component='div'
        ref={chatEndRef}
        sx={{ height: '5rem' }}
      >
        {
          isTypingIndicatorVisible
          &&
          <Box component='div'>
            <Lottie
              loop={true}
              animationData={typingAnimation}
              play={true}
              style={{ width: 50, height: 50 }}
            />
          </Box>
        }
      </Box>
    </Box>
  );
};

export default ScrollableChatWindow;