import { lazy, memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Box, Button, Stack, Typography } from '@mui/material';

// MUI Icons.
import AddIcon from '@mui/icons-material/Add';

// Components.
import ChatItem from './ChatItem';
import ListLoading from '../ListLoading/ListLoading';
import Spinner from '../Spinner/Spinner';

// Components (lazy-loaded).
const GroupChatModal = lazy(() => import('../ModalWindows/GroupChatModal/GroupChatModal'));

// Socket.IO
import { socket } from '../../socket/socket';

// Functions.
import { getFullSender, replaceEmoticons, replaceShortcodes, truncateText } from '../../helpers/chatLogic';
import { fetchChats, fetchChat, updateChatLastMessage } from '../../features/chat/chatSlice';

const ChatsList = ({ fetchAgain }) => {
  const user = useSelector((state) => state.authReducer.user);
  const chats = useSelector((state) => state.chatReducer.chats);
  const selectedChat = useSelector((state) => state.chatReducer.selectedChat);
  const usersOnline = useSelector((state) => state.chatReducer.usersOnline);

  const dispatch = useDispatch();

  // STATE.
  const [isGroupChatModalOpen, setIsGroupChatModalOpen] = useState(false);
  const [online, setOnline] = useState([]);
  const [openMenuChatId, setOpenMenuChatId] = useState(null);

  const menuAnchorElsRef = useRef({});

  useEffect(() => {
    getAllChats();
  }, [fetchAgain]);

  useEffect(() => {
    allOnlineUsers();
  }, [usersOnline]);

  useEffect(() => {
    const handleLastMessageUpdate = (updatedChat) => {
      try {
        dispatch(updateChatLastMessage(updatedChat));
      } catch (err) {
        console.error(err);
      }
    };

    // Listen for real-time last message updates.
    socket.on('chat_last_message_update', handleLastMessageUpdate);

    return () => {
      socket.off('chat_last_message_update', handleLastMessageUpdate);
    };
  }, [dispatch]);

  // Open group chat's modal window.
  const handleGroupChatModalOpen = () => {
    setIsGroupChatModalOpen(true);
  };

  // Open chat item menu.
  const handleChatItemMenuClick = useCallback((event, chatId) => {
    event.stopPropagation();

    menuAnchorElsRef.current[chatId] = event.currentTarget; // Set ref immediately.
    setOpenMenuChatId(chatId); // Now this will render the menu right away.
  }, []);

  // Close chat item menu.
  const handleChatItemMenuClose = useCallback((event) => {
    // Safely stop propagation if event exists
    if (event?.stopPropagation) {
      event.stopPropagation();
    }

    setOpenMenuChatId(null);
  }, []);

  // Get all chats of the current user from DB.
  const getAllChats = async () => {
    try {
      // Use `unwrap` for error catching (if using Redux Toolkit with 'createAsyncThunk()' method).
      await dispatch(fetchChats()).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  // Get one specific chat of the current user from DB.
  const getOneChat = useCallback(async (chatId) => {
    try {
      await dispatch(fetchChat(chatId)).unwrap();
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  // Hide one specific chat from the current user's chat list.
  const hideChat = useCallback(async (chatId) => {
    try {
      const response = await axios.put('/api/chat/hide', {
        chatId: chatId,
        userId: user._id,
      });

      if (response.status === 200) {
        // Refresh the chat list.
        await dispatch(fetchChats()).unwrap();
      }

      // Close the menu.
      handleChatItemMenuClose();
    } catch (err) {
      console.error(err);
    }
  }, [dispatch, handleChatItemMenuClose, user._id]);

  // Delete one specific chat from the current user's chat list.
  // This is a "soft deletion" of the chat (basically, we permanently hide this chat from ourselfs without means to unhide it).
  // All correspondence from this chat will still be available to our collocutor unless he "deletes" the chat for himself (and vice versa).
  const deleteChat = useCallback(async (chatId) => {
    try {
      await axios.put('/api/chat/delete', {
        chatId: chatId,
        userId: user._id,
        currentUserId: user._id,
      });

      // Refresh the chat list.
      await dispatch(fetchChats()).unwrap();

      // Close the menu.
      handleChatItemMenuClose();
    } catch (err) {
      console.error(err);
    }
  }, [dispatch, handleChatItemMenuClose, user._id]);

  // Get all online users.
  const allOnlineUsers = () => {
    setOnline(usersOnline);
  };

  // Sort current user's chatlist in descensing order (newest chats first) based of recent activity in chat.
  const sortedChats = useMemo(() => {
    if (!Array.isArray(chats) || chats.length === 0) {
      return [];
    }

    return [...chats].sort((a, b) => {
      const dateA = new Date(a.lastMessage?.createdAt || a.updatedAt || a.createdAt);
      const dateB = new Date(b.lastMessage?.createdAt || b.updatedAt || b.createdAt);

      // Descending order → newest chats first.
      return dateB - dateA;
    });
  }, [chats]);

  // Replace ASCII-style emoticons and emoji shortcodes with emojis.
  // 'replaceEmoticons()' function replaces ASCII-style emoticons with emojis.
  // 'replaceShortcodes()' takes the result of the previous step and replaces the emoji shortcodes in it with emojis.
  const emojiTransformer = useCallback((text) => {
    return replaceShortcodes(replaceEmoticons(text));
  }, []);

  // Precompute memoized transformed messages *outside* JSX and inside the Component body.
  const chatsWithTransformedMessages = useMemo(() => {
    if (!chats) {
      return [];
    }

    return sortedChats.map((chat) => {
      const transformedLastMessage = chat.lastMessage?.content
        ? truncateText(emojiTransformer(chat.lastMessage.content), 40)
        : '';

      return {
        ...chat,
        transformedLastMessage,
      };
    });
  }, [sortedChats]);

  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 0.5rem 1rem 0 rgba(0, 0, 0, 0.3)',
        display: { xs: selectedChat ? 'none' : 'flex', md: 'flex' },
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
        {chats ? (
          <Stack sx={{ width: '100%' }}>
            {chatsWithTransformedMessages.map((chat) => {
              const fullSender = !chat.isGroupChat ? getFullSender(user, chat.users) : null;

              return (
                <ChatItem
                  key={chat._id}
                  chat={chat}
                  deleteChat={deleteChat}
                  fullSender={fullSender}
                  getOneChat={getOneChat}
                  handleChatItemMenuClick={handleChatItemMenuClick}
                  handleChatItemMenuClose={handleChatItemMenuClose}
                  hideChat={hideChat}
                  menuAnchorEl={menuAnchorElsRef.current[chat._id]}
                  online={online}
                  openMenuChatId={openMenuChatId}
                  user={user}
                />
              );
            })}
          </Stack>
        ) : (
          <ListLoading />
        )}
      </Box>

      {isGroupChatModalOpen && (
        <Suspense fallback={<Spinner />}>
          <GroupChatModal
            isGroupChatModalOpen={isGroupChatModalOpen}
            setIsGroupChatModalOpen={setIsGroupChatModalOpen}
          />
        </Suspense>
      )}
    </Box>
  );
};

export default memo(ChatsList);
