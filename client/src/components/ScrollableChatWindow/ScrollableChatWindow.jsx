import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  MenuList,
  Tooltip,
  Typography
} from '@mui/material';
import Lottie from 'react-lottie-player/dist/LottiePlayerLight';

// Assets.
import typingAnimation from '../../assets/animations/typing.json';

// MUI Icons.
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReplyIcon from '@mui/icons-material/Reply';

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
  isSameTime,
  linkifyAndSanitize,
  truncateText
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
  const [linkPreviews, setLinkPreviews] = useState({});
  const [openMenuMessageId, setOpenMenuMessageId] = useState(null);
  const menuAnchorElsRef = useRef({});

  const chatEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();

    const fetchPreview = async (url, messageId) => {
      try {
        const { data } = await axios.post('/api/chat/message/linkPreview', { url });

        setLinkPreviews((prev) => ({ ...prev, [messageId]: data }));
      } catch (err) {
        console.error(err);
      };
    };

    messages.forEach((msg) => {
      const urlMatch = msg.content.match(/https?:\/\/[^\s]+/);

      if (urlMatch && !linkPreviews[msg._id]) {
        fetchPreview(urlMatch[0], msg._id);
      };
    });
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

  // Removing anything except www + full domain name in request URL which dispays in link preview.
  const shortRequestUrl = (messageId) => {
    try {
      const parsedUrl = new URL(linkPreviews[messageId]?.requestUrl);
      return parsedUrl.hostname;
    } catch (err) {
      return '';
    };
  };

  // Open message item menu.
  const handleMessageItemMenuOpen = (event, messageId) => {
    event.stopPropagation();

    // Set ref immediately.
    menuAnchorElsRef.current[messageId] = event.currentTarget;

    // Delay setting the menu open state to ensure the DOM has updated
    setTimeout(() => {
      setOpenMenuMessageId(messageId);
    }, 0);
  };

  // Close chat item menu.
  const handleMessageItemMenuClose = () => {
    setOpenMenuMessageId(null);
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
                id='message-block'
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
                  // maxWidth: '50%',
                  maxWidth: { xs: '80%', sm: '70%', md: '60%' },
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
                  component='div'
                  sx={{
                    display: 'flex',
                    flexDirection: `${isMyMessage(messages, index, userId) ? 'row-reverse' : 'row'}`,
                    width: 'fit-content'
                  }}
                >
                  <Box
                    component='span'
                    id='message-box'
                    sx={{
                      alignContent: 'center',
                      alignSelf: `${isMyMessage(messages, index, userId) ? 'flex-end' : 'flex-start'}`,
                      backgroundColor: `${isMyMessage(messages, index, userId) ? 'rgb(200, 240, 200)' : 'rgb(233, 233, 233)'}`,
                      borderRadius: `${isMyMessage(messages, index, userId) ? '1rem 1rem 0rem 1rem' : '0rem 1rem 1rem 1rem'}`,
                      fontSize: '1.6rem',
                      maxWidth: '100%',
                      overflowWrap: 'break-word',
                      padding: '1rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      width: 'fit-content'
                    }}
                    dangerouslySetInnerHTML={{ __html: linkifyAndSanitize(message.content) }}
                  />

                  {/* Dropdown Menu Icon */}
                  <MoreVertIcon
                    sx={{ color: 'gray', fontSize: '2rem', cursor: 'pointer' }}
                    onClick={(event) => handleMessageItemMenuOpen(event, message._id)}
                  />

                  {/* Dropdown Menu */}
                  {
                    menuAnchorElsRef.current[message._id] && openMenuMessageId === message._id && (
                      <Menu
                        id='message-item-menu'
                        anchorEl={menuAnchorElsRef.current[message._id]}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: isMyMessage(messages, index, userId) ? 'left' : 'right'
                        }}
                        disableAutoFocusItem // Important to avoid focusing issues.
                        open={true}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: isMyMessage(messages, index, userId) ? 'right' : 'left'
                        }}
                        onClose={handleMessageItemMenuClose}
                      >
                        <MenuList disablePadding sx={{ width: '12rem' }}>
                          <MenuItem
                            sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}
                            onClick={() => { alert(`Edit message ${message._id}`); handleMessageItemMenuClose(); }}
                          >
                            <ListItemIcon>
                              <EditIcon sx={{ fontSize: '2rem', marginRight: '1rem' }} /> Edit
                            </ListItemIcon>
                          </MenuItem>

                          <MenuItem
                            sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}
                            onClick={() => { alert(`Reply to: ${message.content}`); handleMessageItemMenuClose(); }}
                          >
                            <ListItemIcon>
                              <ReplyIcon sx={{ fontSize: '2rem', marginRight: '1rem' }} /> Reply
                            </ListItemIcon>
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    )
                  }
                </Box>

                {
                  linkPreviews[message._id] && (
                    <Box
                      sx={{
                        backgroundColor: 'rgb(250, 250, 250)',
                        border: '1px solid lightgray',
                        borderRadius: '0.5rem',
                        marginTop: '0.5rem',
                        maxWidth: '32rem',
                        overflow: 'hidden',
                        textDecoration: 'none',
                      }}
                      component='a'
                      href={linkPreviews[message._id].requestUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {
                        linkPreviews[message._id].linkImage?.url
                        && (
                          <Box
                            component='img'
                            src={linkPreviews[message._id].linkImage.url}
                            alt='preview'
                            sx={{ width: '100%', height: 'auto' }}
                            onError={(error) => {
                              error.target.style.display = 'none';
                            }}
                          />
                        )
                      }

                      <Box sx={{ padding: '0.8rem' }}>
                        {/* Part below allow us to truncate title to 100 chars maximum */}
                        <Typography sx={{ color: 'black', fontWeight: 600, fontSize: '1.4rem', marginBottom: '1rem' }}>
                          {truncateText(linkPreviews[message._id].linkTitle, 100)}
                        </Typography>

                        {/* Part below allow us to truncate description to 100 chars maximum */}
                        <Typography sx={{ fontSize: '1.2rem', color: 'black', marginBottom: '1rem' }}>
                          {truncateText(linkPreviews[message._id].linkDescription, 100)}
                        </Typography>

                        {/* Part below is for displaying short version of URL from request in link preview*/}
                        <Typography sx={{ color: 'gray', fontSize: '1.1rem' }}>
                          {shortRequestUrl(message._id)}
                        </Typography>
                      </Box>
                    </Box>
                  )
                }

                <Box
                  component='span'
                  sx={{
                    alignSelf: 'flex-end',
                    fontSize: '1.2rem',
                    margin: '0.5rem 0rem'
                  }}
                >
                  {
                    isMyMessage(messages, index, userId)
                    &&
                    message.isRead
                    &&
                    <Box
                      component='span'
                      sx={{
                        alignItems: 'flex-end',
                        display: 'flex',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <Typography
                        component='span'
                        sx={{ fontFamily: 'Georgia', marginRight: '0.5rem' }}
                      >
                        {
                          new Date(message.updatedAt)
                            .toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
                        }
                      </Typography>

                      <DoneAllRoundedIcon
                        sx={{ color: 'blue', fontSize: '2rem' }}
                      />
                    </Box>
                  }
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