import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Avatar,
  Box,
  Divider,
  Tooltip,
  Typography
} from '@mui/material';
import Lottie from 'react-lottie-player/dist/LottiePlayerLight';

// Assets.
import typingAnimation from '../../assets/animations/typing.json';

// MUI Icons.
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';

// Components.
import ScrollToBottomButton from '../ScrollToBottomButton/ScrollToBottomButton';

// Functions.
import {
  isFirstMessageInChat,
  isFirstMessageInBlock,
  isLastMessageInChat,
  isLastMessageInBlock,
  isMyMessage,
  isNewDay,
  isSameTime
} from '../../helpers/chatLogic';

const ScrollableChatWindow = ({ messages, isTyping, typingUser }) => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  // Current user's ID.
  const userId = authState.user._id;

  // STATE.
  const [scrollbarPosition, setScrollbarPosition] = useState(0);

  const chatEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Calculate the scrollbar position in percentage.
  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    const position = Math.ceil((scrollTop / (scrollHeight - clientHeight)) * 100);
    setScrollbarPosition(position);
  };

  // Auto-scrolling chat to the end.
  const scrollToBottom = () => {
    try {
      chatEndRef.current?.scrollIntoView({ behavior: 'instant' });
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
        scrollbarWidth: 'thin',
      }}
      onScroll={handleScroll}
    >
      {
        messages.map((message, index) => (
          <div key={message._id}>
            {
              isNewDay(messages, message, index)
              &&
              <Divider
                sx={{
                  fontSize: '1.4rem',
                  margin: '2rem 0rem'
                }}
              >
                {
                  new Date(message.createdAt)
                    .toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                }
              </Divider>
            }

            <Box
              id='message'
              component='div'
              sx={{
                display: 'flex',
                justifyContent: `${isMyMessage(messages, index, userId) ? 'flex-end' : 'flex-start'}`,
                marginTop: '0.5rem',
                marginBottom: `${message.chat.isGroupChat
                  && !isLastMessageInChat(messages, index)
                  && isLastMessageInBlock(messages, index)
                  ? '3rem'
                  : '0.5rem'}`,
              }}
            >
              {
                (
                  !isMyMessage(messages, index, userId)
                  && isFirstMessageInChat(messages, index)
                  ||
                  !isMyMessage(messages, index, userId)
                  && isLastMessageInChat(messages, index)
                  && isNewDay(messages, message, index)
                  ||
                  !isMyMessage(messages, index, userId)
                  && !isFirstMessageInChat(messages, index)
                  && isFirstMessageInBlock(messages, index)
                  ||
                  message.chat.isGroupChat
                  && isFirstMessageInBlock(messages, index)
                )
                &&
                <Tooltip
                  title={message.sender.username}
                  arrow
                  enterDelay={500}
                  enterNextDelay={500}
                  placement='bottom'
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
                      margin: '0.5rem 1rem 0rem 0rem',
                      width: '4rem'
                    }}
                  />
                </Tooltip>
              }

              <Box
                component='div'
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: `${!isLastMessageInChat(messages, index) && isLastMessageInBlock(messages, index) ? '1rem' : '0rem'}`,
                  marginLeft: `${!isMyMessage(messages, index, userId)
                    && !isFirstMessageInChat(messages, index)
                    && isFirstMessageInBlock(messages, index)
                    ||
                    !isMyMessage(messages, index, userId) && isFirstMessageInChat(messages, index)
                    ||
                    isLastMessageInChat(messages, index) && isNewDay(messages, message, index)
                    ||
                    message.chat.isGroupChat && isFirstMessageInBlock(messages, index)
                    ? '0rem'
                    : '5rem'}`,
                  maxWidth: '50%',
                }}
              >
                <Box
                  component='span'
                  sx={{
                    alignSelf: `${!isMyMessage(messages, index, userId) ? 'flex-start' : 'flex-end'}`,
                    fontSize: '1.2rem',
                    margin: '0.5rem 0rem'
                  }}
                >
                  {
                    !isMyMessage(messages, index, userId)
                    && isFirstMessageInBlock(messages, index)
                    && message.sender.username + ' '
                  }

                  {
                    !isSameTime(messages, message, index)
                    &&
                    <Box component='span'>
                      {
                        new Date(message.createdAt)
                          .toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
                      }
                    </Box>
                  }
                </Box>

                <Box
                  component='span'
                  sx={{
                    alignContent: 'center',
                    alignSelf: `${isMyMessage(messages, index, userId) ? 'flex-end' : 'flex-start'}`,
                    backgroundColor: `${isMyMessage(messages, index, userId) ? 'rgb(200, 240, 200)' : 'rgb(233, 233, 233)'}`,
                    borderRadius: `${isMyMessage(messages, index, userId) ? '1rem 1rem 0rem 1rem' : '0rem 1rem 1rem 1rem'}`,
                    fontSize: '1.6rem',
                    overflowWrap: 'break-word',
                    padding: '1rem',
                    width: 'fit-content'
                  }}
                >
                  {message.content}
                </Box>
              </Box>
            </Box>
          </div>
        ))
      }

      <Box
        component='div'
        ref={chatEndRef}
        height='5rem'
      >
        {
          isTyping
          &&
          <Box
            component='div'
            sx={{
              display: 'flex',
              height: '3rem',
              marginTop: '3rem'
            }}
          >
            <Typography
              component='p'
              sx={{ fontSize: '1.4rem' }}
            >
              {`${typingUser} is typing`}
            </Typography>

            <Lottie
              loop={true}
              animationData={typingAnimation}
              play={true}
            />
          </Box>
        }
      </Box>

      <ScrollToBottomButton scrollbarPosition={scrollbarPosition} scrollToBottom={scrollToBottom} />
    </Box>
  );
};

export default ScrollableChatWindow;