import { useState, useEffect, useRef, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  Avatar,
  Box,
  Button,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  MenuList,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

// Animations.
import Lottie from 'react-lottie-player/dist/LottiePlayerLight';

// Assets.
import typingAnimation from '../../assets/animations/typing.json';

// MUI Icons.
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReplyIcon from '@mui/icons-material/Reply';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

// Components.
import ScrollToBottomButton from '../ScrollToBottomButton/ScrollToBottomButton';

// Socket.IO
import { socket } from '../../socket/socket';

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
  truncateText,
} from '../../helpers/chatLogic';
import { updateChatLastMessage } from '../../features/chat/chatSlice';


const ScrollableChatWindow = ({ isTyping, chatId, messages, setMessages, setQuotedMessage, typingUser }) => {
  const authState = useSelector((state) => {
    return state.authReducer;
  });

  const dispatch = useDispatch();

  // Current user's ID.
  const userId = authState.user._id;

  // STATE.
  const [scrollbarPosition, setScrollbarPosition] = useState(0);
  const [linkPreviews, setLinkPreviews] = useState({});
  const [messageBeingEdited, setMessageBeingEdited] = useState(null);
  const [newMessageContent, setNewMessageContent] = useState('');
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
      }
    };

    messages.forEach((msg) => {
      const urlMatch = msg.content.match(/https?:\/\/[^\s]+/);

      if (urlMatch && !linkPreviews[msg._id]) {
        fetchPreview(urlMatch[0], msg._id);
      }
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
    }
  };

  // Removing anything except www + full domain name in request URL which dispays in link preview.
  const shortRequestUrl = (messageId) => {
    try {
      const parsedUrl = new URL(linkPreviews[messageId]?.requestUrl);

      return parsedUrl.hostname;
    } catch (err) {
      return '';
    }
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

  // Edit the message.
  const handleEditMessage = (message) => {
    setMessageBeingEdited(message); // Store the message being edited.
    setNewMessageContent(message.content); // Pre-fill the content in the input field.
    handleMessageItemMenuClose(); // Close the menu after edit is selected.
  };

  // Save the edited message and update this message in chat.
  const handleSaveEdit = async () => {
    try {
      const editedMessage = {
        _id: messageBeingEdited._id,
        chatId: messageBeingEdited.chat._id,
        content: newMessageContent,
        sender: messageBeingEdited.sender,
      };

      if (socket.connected) {
        // Preferred: real-time update (emit via socket, no axios call needed here if socket is used).
        socket.emit('message_edit', editedMessage);
      } else {
        // Fallback: persist via REST.
        await axios.put(`/api/chat/message/edit/${editedMessage._id}`, {
          content: editedMessage.content,
          senderId: editedMessage.sender._id,
          isEdited: true,
        });

        // Optional: manually update message in state if socket isn't active.
        setMessages((prevMessages) => {
          return prevMessages.map((msg) =>
            msg._id === editedMessage._id ? { ...msg, content: editedMessage.content } : msg
          );
        });
      }

      setMessageBeingEdited(null);
      setNewMessageContent('');
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel the message editing.
  const handleCancelEdit = () => {
    setMessageBeingEdited(null);
    setNewMessageContent('');
  };

  // Hide existing message in chat.
  const handleHideMessage = async (message) => {
    try {
        if (socket.connected) {
        // Preferred: real-time update (emit via socket, no axios call needed here if socket is used).
        socket.emit('message_hide', message);
      } else {
        const { data: hiddenMessage } = await axios.put(`/api/chat/message/hide/${message._id}`);
  
        // Refresh messages in chat.
        const { data: updatedMessages } = await axios.get(`/api/chat/messages/${hiddenMessage.chat}`);
        
        setMessages(updatedMessages);
      }

      handleMessageItemMenuClose();
    } catch (err) {
      console.error(err);
    }
  };

  // Redisplay a hidden existing message in chat.
  const handleUnhideMessage = async (message) => {
    try {
      if (socket.connected) {
        // Preferred: real-time update (emit via socket, no axios call needed here if socket is used).
        socket.emit('message_unhide', message);
      } else {
        const { data: unhiddenMessage } = await axios.put(`/api/chat/message/unhide/${message._id}`);
  
        // Refresh messages in chat.
        const { data: updatedMessages } = await axios.get(`/api/chat/messages/${unhiddenMessage.chat}`);
  
        setMessages(updatedMessages);
      }

      handleMessageItemMenuClose();
    } catch (err) {
      console.error(err);
    }
  };

  // 'Soft delete' of the specific message.
  const handleDeleteMessage = async (message) => {
    try {
      if (socket.connected) {
        // Preferred: real-time update (emit via socket, no axios call needed here if socket is used).
        socket.emit('message_delete', message);
      } else {
        // Fallback: persist via REST.
        // Delete message from chat.
        const { data: updatedChat } = await axios.put(`/api/chat/message/delete/${message._id}`, {
          senderId: message.sender._id,
        });

        // This will update the preview in Redux.
        dispatch(updateChatLastMessage(updatedChat));

        // Optionally refresh messages.
        const { data: updatedMessages } = await axios.get(`/api/chat/messages/${updatedChat._id}`);
      
        setMessages(updatedMessages);
      }

      handleMessageItemMenuClose();
    } catch (err) {
      console.error(err);
    }
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
      {messages.map((message, index) => (
        <div key={message._id}>
          {isNewDay(messages, message, index) && (
            <Divider
              sx={{
                fontSize: '1.4rem',
                margin: '2rem 0rem',
              }}
            >
              {new Date(message.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Divider>
          )}

          <Box
            id='message'
            component='div'
            sx={{
              display: 'flex',
              justifyContent: `${isMyMessage(messages, index, userId) ? 'flex-end' : 'flex-start'}`,
              marginTop: '0.5rem',
              marginBottom: `${
                message.chat.isGroupChat &&
                !isLastMessageInChat(messages, index) &&
                isLastMessageInBlock(messages, index)
                  ? '3rem'
                  : '0.5rem'
              }`,
            }}
          >
            {((!isMyMessage(messages, index, userId) && isFirstMessageInChat(messages, index)) ||
              (!isMyMessage(messages, index, userId) &&
                isLastMessageInChat(messages, index) &&
                isNewDay(messages, message, index)) ||
              (!isMyMessage(messages, index, userId) &&
                !isFirstMessageInChat(messages, index) &&
                isFirstMessageInBlock(messages, index)) ||
              (message.chat.isGroupChat && isFirstMessageInBlock(messages, index))) && (
              <Tooltip
                title={message.sender.username}
                arrow
                enterDelay={500}
                enterNextDelay={500}
                placement='bottom'
                slotProps={{
                  tooltip: { sx: { fontSize: '1.2rem', backgroundColor: 'rgb(93, 109, 126)', color: 'white' } },
                  arrow: { sx: { color: 'rgb(93, 109, 126)' } },
                }}
              >
                <Avatar
                  src={message.sender.avatar}
                  sx={{
                    cursor: 'pointer',
                    height: '4rem',
                    margin: '0.5rem 1rem 0rem 0rem',
                    width: '4rem',
                  }}
                />
              </Tooltip>
            )}

            {message?.isDeleted ? (
              <Box
                component='div'
                sx={{
                  alignItems: `${isMyMessage(messages, index, userId) ? 'flex-end' : 'flex-start'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: `${
                    !isLastMessageInChat(messages, index) && isLastMessageInBlock(messages, index) ? '1rem' : '0rem'
                  }`,
                  marginLeft: `${
                    (!isMyMessage(messages, index, userId) &&
                      !isFirstMessageInChat(messages, index) &&
                      isFirstMessageInBlock(messages, index)) ||
                    (!isMyMessage(messages, index, userId) && isFirstMessageInChat(messages, index)) ||
                    (isLastMessageInChat(messages, index) && isNewDay(messages, message, index)) ||
                    (message.chat.isGroupChat && isFirstMessageInBlock(messages, index))
                      ? '0rem'
                      : '5rem'
                  }`,
                  maxWidth: { xs: '80%', sm: '70%', md: '60%' },
                }}
              >
                <Fragment>
                  <Box
                    component='span'
                    sx={{
                      alignSelf: `${!isMyMessage(messages, index, userId) ? 'flex-start' : 'flex-end'}`,
                      fontSize: '1.2rem',
                      margin: '0.5rem 0rem',
                    }}
                  >
                    {!isMyMessage(messages, index, userId) &&
                      isFirstMessageInBlock(messages, index) &&
                      message.sender.username + ' '}

                    {!isSameTime(messages, message, index) && (
                      <Box component='span'>
                        {new Date(message.createdAt).toLocaleTimeString(navigator.language, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Box>
                    )}
                  </Box>

                  <Box
                    component='div'
                    sx={{
                      display: 'flex',
                      flexDirection: `${isMyMessage(messages, index, userId) ? 'row-reverse' : 'row'}`,
                      width: 'fit-content',
                    }}
                  >
                    <Box
                      component='div'
                      sx={{
                        backgroundColor: `${
                          isMyMessage(messages, index, userId) ? 'rgb(200, 240, 200)' : 'rgb(233, 233, 233)'
                        }`,
                        borderRadius: `${
                          isMyMessage(messages, index, userId) ? '1rem 1rem 0rem 1rem' : '0rem 1rem 1rem 1rem'
                        }`,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0.5rem',
                        width: 'fit-content',
                      }}
                    >
                      <Box
                        component='div'
                        id='message-box'
                        sx={{
                          alignContent: 'center',
                          alignSelf: `${isMyMessage(messages, index, userId) ? 'flex-end' : 'flex-start'}`,
                          backgroundColor: `${
                            isMyMessage(messages, index, userId) ? 'rgb(200, 240, 200)' : 'rgb(233, 233, 233)'
                          }`,
                          borderRadius: `${
                            isMyMessage(messages, index, userId) ? '1rem 1rem 0rem 1rem' : '0rem 1rem 1rem 1rem'
                          }`,
                          display: 'flex',
                          flexDirection: 'column',
                          maxWidth: '100%',
                          padding: '0.5rem',
                          width: 'fit-content',
                        }}
                      >
                        <Typography sx={{ fontFamily: 'Georgia', fontSize: '1.6rem' }}>
                          This message has been deleted.
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    component='span'
                    sx={{
                      alignSelf: 'flex-end',
                      fontSize: '1.2rem',
                      margin: '0.5rem 0rem',
                    }}
                  >
                    {isMyMessage(messages, index, userId) && message.isRead && (
                      <Box
                        component='span'
                        sx={{
                          alignItems: 'flex-end',
                          display: 'flex',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <Typography component='span' sx={{ fontFamily: 'Georgia', marginRight: '0.5rem' }}>
                          {new Date(message.updatedAt).toLocaleTimeString(navigator.language, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>

                        <DoneAllRoundedIcon sx={{ color: 'blue', fontSize: '2rem' }} />
                      </Box>
                    )}
                  </Box>
                </Fragment>
              </Box>
            ) : (
              <Box
                component='div'
                id='message-block'
                sx={{
                  alignItems: `${isMyMessage(messages, index, userId) ? 'flex-end' : 'flex-start'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: `${
                    !isLastMessageInChat(messages, index) && isLastMessageInBlock(messages, index) ? '1rem' : '0rem'
                  }`,
                  marginLeft: `${
                    (!isMyMessage(messages, index, userId) &&
                      !isFirstMessageInChat(messages, index) &&
                      isFirstMessageInBlock(messages, index)) ||
                    (!isMyMessage(messages, index, userId) && isFirstMessageInChat(messages, index)) ||
                    (isLastMessageInChat(messages, index) && isNewDay(messages, message, index)) ||
                    (message.chat.isGroupChat && isFirstMessageInBlock(messages, index))
                      ? '0rem'
                      : '5rem'
                  }`,
                  maxWidth: { xs: '80%', sm: '70%', md: '60%' },
                }}
              >
                {messageBeingEdited?._id === message._id ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '25rem',
                    }}
                  >
                    <TextField
                      multiline
                      minRows={3}
                      sx={{
                        marginBottom: '1rem',
                        '.MuiInputBase-input': { fontFamily: 'Georgia', fontSize: '1.4rem' },
                      }}
                      value={newMessageContent}
                      onChange={(event) => setNewMessageContent(event.target.value)}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                      <Button
                        variant='contained'
                        color='error'
                        sx={{ fontFamily: 'Georgia', fontSize: '1.1rem' }}
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>

                      <Button
                        variant='contained'
                        color='primary'
                        sx={{ fontFamily: 'Georgia', fontSize: '1.1rem' }}
                        onClick={() => handleSaveEdit(message.sender._id)}
                      >
                        Save
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Fragment>
                    <Box
                      component='span'
                      sx={{
                        alignSelf: `${!isMyMessage(messages, index, userId) ? 'flex-start' : 'flex-end'}`,
                        fontSize: '1.2rem',
                        margin: '0.5rem 0rem',
                      }}
                    >
                      {!isMyMessage(messages, index, userId) &&
                        isFirstMessageInBlock(messages, index) &&
                        message.sender.username + ' '}

                      {!isSameTime(messages, message, index) && (
                        <Box component='span'>
                          {new Date(message.createdAt).toLocaleTimeString(navigator.language, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Box>
                      )}
                    </Box>

                    <Box
                      component='div'
                      sx={{
                        display: 'flex',
                        flexDirection: `${isMyMessage(messages, index, userId) ? 'row-reverse' : 'row'}`,
                        width: 'fit-content',
                      }}
                    >
                      <Box
                        component='div'
                        sx={{
                          backgroundColor: `${
                            isMyMessage(messages, index, userId) ? 'rgb(200, 240, 200)' : 'rgb(233, 233, 233)'
                          }`,
                          borderRadius: `${
                            isMyMessage(messages, index, userId) ? '1rem 1rem 0rem 1rem' : '0rem 1rem 1rem 1rem'
                          }`,
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '0.5rem',
                          width: 'fit-content',
                        }}
                      >
                        {message.replyTo && (
                          <Box
                            sx={{
                              backgroundColor: 'rgb(250, 250, 250)',
                              borderRadius: `${
                                isMyMessage(messages, index, userId) ? '1rem 1rem 0rem 1rem' : '0rem 1rem 1rem 1rem'
                              }`,
                              boxShadow: '0 0.3rem 1rem 0 rgba(0, 0, 0, 0.3)',
                              color: 'black',
                              fontSize: '1.4rem',
                              marginBottom: '1rem',
                              maxWidth: '100%',
                              padding: '1rem',
                            }}
                          >
                            <Typography sx={{ fontWeight: 600, fontSize: '1.3rem' }}>
                              {message.replyTo.sender?.username || 'Unknown'}
                            </Typography>

                            <Typography sx={{ fontSize: '1.3rem', fontStyle: 'italic' }}>
                              {truncateText(message.replyTo.content || 'Quoted message unavailable', 120)}
                            </Typography>
                          </Box>
                        )}

                        <Box
                          component='div'
                          id='message-box'
                          sx={{
                            alignContent: 'center',
                            alignSelf: `${isMyMessage(messages, index, userId) ? 'flex-end' : 'flex-start'}`,
                            backgroundColor: `${
                              isMyMessage(messages, index, userId) ? 'rgb(200, 240, 200)' : 'rgb(233, 233, 233)'
                            }`,
                            borderRadius: `${
                              isMyMessage(messages, index, userId) ? '1rem 1rem 0rem 1rem' : '0rem 1rem 1rem 1rem'
                            }`,
                            display: 'flex',
                            flexDirection: 'column',
                            fontSize: '1.6rem',
                            maxWidth: '100%',
                            overflowWrap: 'break-word',
                            padding: '0.5rem',
                            whiteSpace: 'pre-wrap',
                            width: 'fit-content',
                            wordBreak: 'break-word',
                          }}
                        >
                          <Box
                            component='span'
                            sx={{ display: 'inline' }}
                            dangerouslySetInnerHTML={{ __html: linkifyAndSanitize(message.hiddenBy.includes(userId) ? 'This message has been hidden.' : message.content) }}
                          />

                          {message.isEdited && (
                            <Tooltip
                              key={`${message._id}-${message.updatedAt}`} // force 'Tooltip' component to re-render when message is edited.
                              title={`Edited at ${new Date(message.updatedAt).toLocaleString(navigator.language, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                second: 'numeric',
                              })}`}
                              arrow
                              enterDelay={100}
                              enterNextDelay={100}
                              placement='bottom-start'
                              slotProps={{
                                tooltip: {
                                  sx: {
                                    backgroundColor: 'rgb(93, 109, 126)',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                  },
                                },
                                arrow: {
                                  sx: { color: 'rgb(93, 109, 126)' },
                                },
                              }}
                            >
                              <Typography
                                component='span'
                                sx={{
                                  alignSelf: `${isMyMessage(messages, index, userId) ? 'flex-end' : 'flex-start'}`,
                                  color: 'blue',
                                  fontSize: '1.1rem',
                                  fontStyle: 'italic',
                                  marginTop: '0.5rem',
                                  ':hover': { cursor: 'default' },
                                }}
                              >
                                (edited)
                              </Typography>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>

                      {/* Dropdown Menu Icon */}
                      <MoreVertIcon
                        sx={{ color: 'gray', fontSize: '2rem', cursor: 'pointer' }}
                        onClick={(event) => handleMessageItemMenuOpen(event, message._id)}
                      />

                      {/* Dropdown Menu */}
                      {menuAnchorElsRef.current[message._id] && openMenuMessageId === message._id && (
                        <Menu
                          id='message-item-menu'
                          anchorEl={menuAnchorElsRef.current[message._id]}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: isMyMessage(messages, index, userId) ? 'left' : 'right',
                          }}
                          disableAutoFocusItem // Important to avoid focusing issues.
                          open={true}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: isMyMessage(messages, index, userId) ? 'right' : 'left',
                          }}
                          onClose={handleMessageItemMenuClose}
                        >
                          <MenuList disablePadding sx={{ width: '12rem' }}>
                            {!message.hiddenBy.includes(userId) &&
                              <MenuItem
                                sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}
                                onClick={() => setQuotedMessage(message)}
                              >
                                <ListItemIcon>
                                  <ReplyIcon sx={{ fontSize: '2rem', marginRight: '1rem' }} /> Reply
                                </ListItemIcon>
                              </MenuItem>
                            }

                            {message.hiddenBy.includes(userId) ? (
                              <MenuItem
                                sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}
                                onClick={() => handleUnhideMessage(message)}
                              >
                                <ListItemIcon>
                                  <VisibilityIcon sx={{ fontSize: '2rem', marginRight: '1rem' }} /> Unhide
                                </ListItemIcon>
                              </MenuItem>
                            ) : (
                              <MenuItem
                                sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}
                                onClick={() => handleHideMessage(message)}
                              >
                                <ListItemIcon>
                                  <VisibilityOffIcon sx={{ fontSize: '2rem', marginRight: '1rem' }} /> Hide
                                </ListItemIcon>
                              </MenuItem>
                            )}

                            {message.sender._id === userId && !message.hiddenBy.includes(userId) && (
                              <Fragment>
                                <MenuItem
                                  divider
                                  sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}
                                  onClick={() => handleEditMessage(message)}
                                >
                                  <ListItemIcon>
                                    <EditIcon sx={{ fontSize: '2rem', marginRight: '1rem' }} /> Edit
                                  </ListItemIcon>
                                </MenuItem>

                                <MenuItem
                                  sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}
                                  onClick={() => handleDeleteMessage(message)}
                                >
                                  <ListItemIcon>
                                    <DeleteOutlinedIcon sx={{ fontSize: '2rem', marginRight: '1rem' }} /> Delete
                                  </ListItemIcon>
                                </MenuItem>
                              </Fragment>
                            )}
                          </MenuList>
                        </Menu>
                      )}
                    </Box>

                    {linkPreviews[message._id] && (
                      <Box
                        component='a'
                        id='message-linkPreview-box'
                        sx={{
                          backgroundColor: 'rgb(250, 250, 250)',
                          border: '1px solid lightgray',
                          borderRadius: '0.5rem',
                          marginTop: '0.5rem',
                          maxWidth: '32rem',
                          overflow: 'hidden',
                          textDecoration: 'none',
                        }}
                        href={linkPreviews[message._id].requestUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {linkPreviews[message._id].linkImage?.url && (
                          <Box
                            component='img'
                            src={linkPreviews[message._id].linkImage.url}
                            alt='preview'
                            sx={{ width: '100%', height: 'auto' }}
                            onError={(error) => {
                              error.target.style.display = 'none';
                            }}
                          />
                        )}

                        <Box sx={{ padding: '0.8rem' }}>
                          {/* Part below allow us to truncate title to 100 chars maximum */}
                          <Typography
                            sx={{ color: 'black', fontWeight: 600, fontSize: '1.4rem', marginBottom: '1rem' }}
                          >
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
                    )}

                    <Box
                      component='span'
                      sx={{
                        alignSelf: 'flex-end',
                        fontSize: '1.2rem',
                        margin: '0.5rem 0rem',
                      }}
                    >
                      {isMyMessage(messages, index, userId) && message.isRead && (
                        <Box
                          component='span'
                          sx={{
                            alignItems: 'flex-end',
                            display: 'flex',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <Typography component='span' sx={{ fontFamily: 'Georgia', marginRight: '0.5rem' }}>
                            {new Date(message.updatedAt).toLocaleTimeString(navigator.language, {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>

                          <DoneAllRoundedIcon sx={{ color: 'blue', fontSize: '2rem' }} />
                        </Box>
                      )}
                    </Box>
                  </Fragment>
                )}
              </Box>
            )}
          </Box>
        </div>
      ))}

      <Box component='div' ref={chatEndRef} height='5rem'>
        {isTyping && (
          <Box
            component='div'
            sx={{
              display: 'flex',
              height: '3rem',
              marginTop: '3rem',
            }}
          >
            <Typography component='p' sx={{ fontSize: '1.4rem' }}>
              {`${typingUser} is typing`}
            </Typography>

            <Lottie loop={true} animationData={typingAnimation} play={true} />
          </Box>
        )}
      </Box>

      <ScrollToBottomButton scrollbarPosition={scrollbarPosition} scrollToBottom={scrollToBottom} />
    </Box>
  );
};

export default ScrollableChatWindow;
