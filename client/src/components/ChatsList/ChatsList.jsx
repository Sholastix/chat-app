import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Avatar,
  Box,
  Button,
  Stack,
  ListItemIcon,
  Menu,
  MenuItem,
  MenuList,
  Tooltip,
  Typography
} from '@mui/material';

// MUI Icons.
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

// Components.
import GroupChatModal from '../ModalWindows/GroupChatModal/GroupChatModal';
import OnlineStatus from '../OnlineStatus/OnlineStatus';
import ListLoading from '../ListLoading/ListLoading';

// Socket.IO
import { socket } from '../../socket/socket';

// Functions.
import { getFullSender, getSender, truncateText } from '../../helpers/chatLogic';
import { fetchChats, fetchChat, updateChatLastMessage } from '../../features/chat/chatSlice';

const ChatsList = (props) => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  const chatState = useSelector((state) => {
    return state.chatReducer;
  });

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  // STATE.
  const [anchorChatItemMenu, setAnchorChatItemMenu] = useState(null);
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
    };
  };

  // Get all chats of the current user from DB.
  const getAllChats = () => {
    try {
      dispatch(fetchChats());
    } catch (err) {
      console.error(err);
    };
  };

  // Get one specific chat of the current user from DB.
  const getOneChat = async (chatId) => {
    try {
      dispatch(fetchChat(chatId));
    } catch (err) {
      console.error(err);
    };
  };

  // Get all online users.
  const allOnlineUsers = () => {
    setOnline(chatState.usersOnline);
  };

  // Chat item menu.
  const openChatItemMenu = Boolean(anchorChatItemMenu);

  // Open chat item menu.
  const handleChatItemMenuClick = (event) => {
    try {
      setAnchorChatItemMenu(event.currentTarget);
    } catch (err) {
      console.error(err);
    };
  };

  // Close chat item menu.
  const handleChatItemMenuClose = () => {
    try {
      setAnchorChatItemMenu(null);
    } catch (err) {
      console.error(err);
    };
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
        width: { xs: '100%', md: '25%' }
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
          width: '100%'
        }}
      >
        <Typography
          sx={{ fontSize: '2rem' }}
        >
          ChatsList
        </Typography>

        <Button
          endIcon={<AddIcon sx={{ color: 'black' }} />}
          sx={{ backgroundColor: 'rgb(235, 235, 235)', borderRadius: '0.5rem' }}
          onClick={handleGroupChatModalOpen}
        >
          <Typography
            sx={{ color: 'black', fontSize: '1.5rem', textTransform: 'none' }}
          >
            New Group Chat
          </Typography>
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
          width: '100%'
        }}
      >
        {
          chatState.chats
            ? <Stack
              sx={{ width: '100%' }}
            >
              {
                chatState.chats.map((chat) => (
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
                      if (
                        event.target.closest('#chat-item-menu-button')
                        || event.target.closest('#chat-item-menu')
                      ) {
                        return;
                      };

                      getOneChat(chat._id);
                    }}
                  >
                    <Box
                      component='div'
                      sx={{ display: 'flex' }}
                    >
                      <Box
                        component='div'
                        sx={{ display: 'flex', marginRight: `${chat.isGroupChat && '2.5rem'}` }}
                      >
                        <Avatar
                          src={
                            !chat.isGroupChat
                              ? getFullSender(authState.user, chat.users).avatar
                              : 'https://img.icons8.com/parakeet-line/48/group.png'
                          }
                          sx={{ fontSize: '2rem' }}
                        />

                        {
                          !chat.isGroupChat && <OnlineStatus online={online} chat={chat} />
                        }
                      </Box>

                      <Box
                        component='div'
                        sx={{ display: 'flex', flexDirection: 'column' }}
                      >
                        <Typography
                          sx={{ fontSize: '1.4rem', fontWeight: '600' }}
                        >
                          {
                            !chat.isGroupChat ? getSender(authState.user, chat.users) : chat.chatName
                          }
                        </Typography>

                        <Typography
                          component='div'
                          id='last-message'
                          sx={{ fontSize: '1.4rem', fontWeight: '400' }}
                        >
                          {
                            chat.lastMessage
                              ? `${chat.lastMessage.sender._id === authState.user._id
                                ? 'You'
                                : chat.lastMessage.sender.username}: ${truncateText(chat.lastMessage.content, 40)}`
                              : <Typography
                                sx={{ color: 'darkred', fontSize: '1.4rem', fontWeight: '400' }}
                              >
                                No messages.
                              </Typography>
                          }
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      component='div'
                      sx={{ display: 'flex', alignSelf: 'flex-start' }}
                    >
                      <Tooltip
                        title='Options'
                        arrow
                        enterDelay={100}
                        enterNextDelay={100}
                        placement='top'
                        slotProps={{
                          tooltip: { sx: { backgroundColor: 'rgb(93, 109, 126)', color: 'white', fontSize: '1.2rem' } },
                          arrow: { sx: { color: 'rgb(93, 109, 126)' } }
                        }}
                      >
                        <Box
                          component='button'
                          id='chat-item-menu-button'
                          aria-controls={openChatItemMenu ? 'chat-item-menu' : undefined}
                          aria-haspopup='true'
                          aria-expanded={openChatItemMenu ? 'true' : undefined}
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
                          onClick={(event) => {
                            // Prevents the event from bubbling up (basically, we launching only this 'onClick' event).
                            event.stopPropagation();

                            handleChatItemMenuClick(event);
                          }}
                        >
                          <MoreHorizRoundedIcon />
                        </Box>
                      </Tooltip>

                      <Menu
                        id='chat-item-menu'
                        anchorEl={anchorChatItemMenu}
                        open={openChatItemMenu}
                        slotProps={{
                          list: {
                            'aria-labelledby': 'chat-item-menu-button'
                          }
                        }}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right'
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right'
                        }}
                        onClose={handleChatItemMenuClose}
                      >
                        <MenuList
                          disablePadding
                          sx={{ width: '12rem' }}
                        >
                          <MenuItem
                            sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}
                            onClick={(event) => {
                              // Prevents the event from bubbling up (basically, we launching only this 'onClick' event).
                              event.stopPropagation();

                              console.log('CHAT DELETED.');

                              handleChatItemMenuClose();
                            }}
                          >
                            <ListItemIcon>
                              <DeleteOutlinedIcon sx={{ fontSize: '2rem', marginRight: '0.5rem' }} /> Delete
                            </ListItemIcon>
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Box>
                  </Box>
                ))
              }
            </Stack>
            : <ListLoading />
        }
      </Box>

      <GroupChatModal
        isGroupChatModalOpen={isGroupChatModalOpen}
        setIsGroupChatModalOpen={setIsGroupChatModalOpen}
      />
    </Box>
  );
};

export default ChatsList;