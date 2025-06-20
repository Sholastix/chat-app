import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Avatar, Box, Button, Stack, ListItemIcon, Menu, MenuItem, MenuList, Tooltip, Typography } from '@mui/material';

// MUI Icons.
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

// Components.
import GroupChatModal from '../ModalWindows/GroupChatModal/GroupChatModal';
import OnlineStatus from '../OnlineStatus/OnlineStatus';
import ListLoading from '../ListLoading/ListLoading';

// Socket.IO
import { socket } from '../../socket/socket';

// Functions.
import { getFullSender, getSender, replaceEmoticons, replaceShortcodes, truncateText } from '../../helpers/chatLogic';
import { fetchChats, fetchChat, updateChatLastMessage } from '../../features/chat/chatSlice';

const ChatsList = (props) => {
  const authState = useSelector((state) => {
    return state.authReducer;
  });

  const chatState = useSelector((state) => {
    return state.chatReducer;
  });

  const dispatch = useDispatch();

  // STATE.
  const [openMenuChatId, setOpenMenuChatId] = useState(null);
  const menuAnchorElsRef = useRef({});

  const [isGroupChatModalOpen, setIsGroupChatModalOpen] = useState(false);
  const [online, setOnline] = useState([]);

  useEffect(() => {
    getAllChats();
  }, [props.fetchAgain]);

  useEffect(() => {
    allOnlineUsers();
  }, [chatState.usersOnline]);

  useEffect(() => {
    // Listen for real-time last message updates.
    socket.on('chat_last_message_update', (updatedChat) => {
      dispatch(updateChatLastMessage(updatedChat));
    });

    return () => {
      socket.off('chat_last_message_update');
    };
  }, []);

  // Open group chat's modal window.
  const handleGroupChatModalOpen = () => {
    try {
      setIsGroupChatModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Get all chats of the current user from DB.
  const getAllChats = () => {
    try {
      dispatch(fetchChats());
    } catch (err) {
      console.error(err);
    }
  };

  // Get one specific chat of the current user from DB.
  const getOneChat = async (chatId) => {
    try {
      dispatch(fetchChat(chatId));
    } catch (err) {
      console.error(err);
    }
  };

  // Hide one specific chat from the current user's chat list.
  const hideChat = async (event, chatId) => {
    event.stopPropagation();

    try {
      await axios.put('/api/chat/hide', {
        chatId: chatId,
        userId: authState.user._id,
      });

      // Refresh the chat list.
      dispatch(fetchChats());

      // Close the menu.
      handleChatItemMenuClose();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete one specific chat from the current user's chat list.
  // This is a "soft deletion" of the chat (basically, we permanently hide this chat from ourselfs without means to unhide it).
  // All correspondence from this chat will still be available to our collocutor unless he "deletes" the chat for himself (and vice versa).
  const deleteChat = async (event, chatId) => {
    event.stopPropagation();

    try {
      await axios.put('/api/chat/delete', {
        chatId: chatId,
        userId: authState.user._id,
        currentUserId: authState.user._id,
      });

      // Refresh the chat list.
      dispatch(fetchChats());

      // Close the menu.
      handleChatItemMenuClose();
    } catch (err) {
      console.error(err);
    }
  };

  // Get all online users.
  const allOnlineUsers = () => {
    setOnline(chatState.usersOnline);
  };

  // Open chat item menu.
  const handleChatItemMenuClick = (event, chatId) => {
    event.stopPropagation();

    menuAnchorElsRef.current[chatId] = event.currentTarget; // set ref immediately.
    setOpenMenuChatId(chatId); // now this will render the menu right away.
  };

  // Close chat item menu.
  const handleChatItemMenuClose = () => {
    setOpenMenuChatId(null);
  };

  // Sort chats by 'createdAt' property in ascension order.
  const sortedChats = chatState.chats.length
    ? [...chatState.chats].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    : [];

  // Replace ASCII-style emoticons and emoji shortcodes with emojis.
  const emojiTransformer = (text) => {
    // Replace ASCII-style emoticons with emojis.
    const emoticonsToEmoji = replaceEmoticons(text);
    
    // Get result from previous step and replace emoji shortcodes with emojis in it.
    const emoticonsAndShortcodesToEmoji = replaceShortcodes(emoticonsToEmoji);

    return emoticonsAndShortcodesToEmoji;
  };

  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 0.5rem 1rem 0 rgba(0, 0, 0, 0.3)',
        display: { xs: chatState.selectedChat ? 'none' : 'flex', md: 'flex' },
        flexDirection: 'column',
        padding: '1rem',
        width: { xs: '100%', md: '25%' },
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          height: '5rem',
          padding: '1rem',
          width: '100%',
        }}
      >
        <Typography sx={{ fontSize: '2rem' }}>ChatsList</Typography>

        <Button
          endIcon={<AddIcon sx={{ color: 'black' }} />}
          sx={{ backgroundColor: 'rgb(235, 235, 235)', borderRadius: '0.5rem' }}
          onClick={handleGroupChatModalOpen}
        >
          <Typography sx={{ color: 'black', fontSize: '1.5rem', textTransform: 'none' }}>New Group Chat</Typography>
        </Button>
      </Box>

      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowX: 'hidden',
          overflowY: 'auto',
          marginTop: '1rem',
          padding: '1rem',
          width: '100%',
        }}
      >
        {chatState.chats ? (
          <Stack sx={{ width: '100%' }}>
            {sortedChats.map((chat) => {
              const fullSender = !chat.isGroupChat ? getFullSender(authState.user, chat.users) : null;

              // Skip rendering if private chat and collocutor is deleted (chat corrupted).
              if (!chat.isGroupChat && !fullSender) {
                return null;
              }

              return (
                <Box
                  component='div'
                  id='chat-item'
                  key={chat._id}
                  sx={{
                    alignItems: 'center',
                    backgroundColor: 'white',
                    border: '0.1rem solid lightgray',
                    borderRadius: '0.5rem',
                    color: 'black',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    // height: '6.5rem',
                    marginBottom: '1rem',
                    padding: '1rem 1rem 1rem 2rem',
                    ':hover': { boxShadow: '0 0.2rem 1rem 0 rgba(0, 0, 0, 0.3)' },
                  }}
                  onClick={(event) => {
                    // Ignore clicks inside the menu or its button.
                    if (event.target.closest('#chat-item-menu-button') || event.target.closest('#chat-item-menu')) {
                      return;
                    }

                    getOneChat(chat._id);
                  }}
                >
                  <Box component='div' sx={{ display: 'flex' }}>
                    <Box component='div' sx={{ display: 'flex', marginRight: `${chat.isGroupChat && '2.5rem'}` }}>
                      <Avatar
                        src={
                          !chat.isGroupChat && fullSender?.avatar
                            ? fullSender.avatar
                            : 'https://img.icons8.com/parakeet-line/48/group.png'
                        }
                        sx={{ fontSize: '2rem' }}
                      />

                      {!chat.isGroupChat && <OnlineStatus online={online} chat={chat} />}
                    </Box>

                    <Box component="div" sx={{ display: 'flex', flexDirection: 'column' }}>
                      {/* <Typography sx={{ fontSize: '1.4rem', fontWeight: '600' }}>
                        {!chat.isGroupChat ? getSender(authState.user, chat.users) : chat.chatName}
                      </Typography> */}

                      <Typography sx={{ fontSize: '1.4rem', fontWeight: '600' }}>
                        {!chat.isGroupChat
                          ? (fullSender ? fullSender.username : 'Deleted User.') // Fallback if fullSender is 'null'.
                          : chat.chatName}
                      </Typography>

                      <Typography
                        component='div'
                        id='last-message'
                        sx={{
                          fontSize: '1.4rem',
                          fontWeight: '400',
                          maxWidth: '100%', // Keeps it within its container.
                          overflowWrap: 'break-word', // Ensures long words break correctly.
                          wordBreak: 'break-word', // Prevents overflow from long links or strings.
                          whiteSpace: 'pre-wrap', // Preserves spacing, supports wrapping.
                        }}
                      >
                        {chat.lastMessage ? (
                          `${
                            chat.lastMessage.sender._id === authState.user._id
                              ? 'You'
                              : chat.lastMessage.sender.username
                          }: ${truncateText(emojiTransformer(chat.lastMessage.content), 40)}`
                        ) : (
                          <Typography
                            sx={{
                              color: 'darkred',
                              fontSize: '1.4rem',
                              fontWeight: '400',
                              wordBreak: 'break-word',
                            }}
                          >
                            No messages.
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  {!chat.isGroupChat && (
                    <Box component='div' sx={{ display: 'flex', alignSelf: 'flex-start' }}>
                      <Tooltip
                        title='Options'
                        arrow
                        enterDelay={100}
                        enterNextDelay={100}
                        placement='top'
                        slotProps={{
                          tooltip: { sx: { backgroundColor: 'rgb(93, 109, 126)', color: 'white', fontSize: '1.2rem' } },
                          arrow: { sx: { color: 'rgb(93, 109, 126)' } },
                        }}
                      >
                        <Box
                          component='button'
                          id='chat-item-menu-button'
                          aria-controls={openMenuChatId === chat._id ? 'chat-item-menu' : undefined}
                          aria-haspopup='true'
                          aria-expanded={openMenuChatId === chat._id ? 'true' : undefined}
                          sx={{
                            alignItems: 'center',
                            backgroundColor: 'white',
                            display: 'flex',
                            justifyContent: 'center',
                            height: '1.5rem',
                            width: '3rem',
                            border: 'none',
                            ':hover': { cursor: 'pointer' },
                          }}
                          onClick={(event) => handleChatItemMenuClick(event, chat._id)}
                        >
                          <MoreHorizRoundedIcon />
                        </Box>
                      </Tooltip>

                      {menuAnchorElsRef.current[chat._id] && (
                        <Menu
                          id="chat-item-menu"
                          anchorEl={menuAnchorElsRef.current[chat._id]}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          open={openMenuChatId === chat._id}
                          slotProps={{ 
                            list: { 
                              'aria-labelledby': 'chat-item-menu-button' 
                            },
                          }}
                          transformOrigin={{ 
                            horizontal: 'right',
                            vertical: 'top', 
                          }}
                          onClose={handleChatItemMenuClose}
                        >
                          <MenuList disablePadding sx={{ width: '12rem' }}>
                            <MenuItem
                              divider
                              sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}
                              onClick={(event) => hideChat(event, chat._id)}
                            >
                              <ListItemIcon>
                                <VisibilityOffOutlinedIcon sx={{ fontSize: '2rem', marginRight: '1rem' }} /> Hide
                              </ListItemIcon>
                            </MenuItem>

                            <MenuItem
                              sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}
                              onClick={(event) => deleteChat(event, chat._id)}
                            >
                              <ListItemIcon>
                                <DeleteOutlinedIcon sx={{ fontSize: '2rem', marginRight: '1rem' }} /> Delete
                              </ListItemIcon>
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Stack>
        ) : (
          <ListLoading />
        )}
      </Box>

      <GroupChatModal isGroupChatModalOpen={isGroupChatModalOpen} setIsGroupChatModalOpen={setIsGroupChatModalOpen} />
    </Box>
  );
};

export default ChatsList;
