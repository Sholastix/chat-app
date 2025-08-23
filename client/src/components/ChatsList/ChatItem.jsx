import { memo } from 'react';
import { Avatar, Box, Typography, Tooltip, Menu, MenuItem, MenuList, ListItemIcon } from '@mui/material';

// MUI Icons.
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

// Components.
import OnlineStatus from '../OnlineStatus/OnlineStatus';

const ChatItem = ({
  chat,
  deleteChat,
  fullSender,
  getOneChat,
  handleChatItemMenuClick,
  handleChatItemMenuClose,
  hideChat,
  menuAnchorEl,
  online,
  openMenuChatId,
  user,
}) => {
  const isMenuOpen = openMenuChatId === chat._id;

  // Handle click on chat item.
  const handleChatClick = () => {
    getOneChat(chat._id);
  };

  // Skip rendering if private chat and collocutor is deleted (chat corrupted).
  if (!chat.isGroupChat && !fullSender) return null;

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
        marginBottom: '1rem',
        padding: '1rem 1rem 1rem 2rem',
        ':hover': { boxShadow: '0 0.2rem 1rem 0 rgba(0, 0, 0, 0.3)' },
      }}
      onClick={handleChatClick}
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

        <Box component='div' sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: '1.4rem', fontWeight: '600' }}>
            {!chat.isGroupChat ? fullSender?.username || 'Deleted User.' : chat.chatName}
          </Typography>

          <Typography
            component='div'
            id='last-message'
            sx={{
              fontSize: '1.4rem',
              fontWeight: '400',
              maxWidth: '100%',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
          >
            {chat.lastMessage ? (
              <>
                {chat.lastMessage?.sender?._id === user._id ? 'You' : chat.lastMessage?.sender?.username || 'Deleted user'}:{' '}
                {chat.transformedLastMessage}
              </>
            ) : (
              <span style={{ color: 'darkred' }}>No messages.</span>
            )}
          </Typography>
        </Box>
      </Box>

      <Box component='div' sx={{ display: 'flex', alignSelf: 'flex-start' }}>
        <Tooltip
          title='Options'
          arrow
          enterDelay={100}
          enterNextDelay={100}
          placement='top'
          slotProps={{
            tooltip: {
              sx: {
                backgroundColor: 'rgb(93, 109, 126)',
                color: 'white',
                fontSize: '1.2rem',
              },
            },
            arrow: { sx: { color: 'rgb(93, 109, 126)' } },
          }}
        >
          <Box
            component='button'
            id='chat-item-menu-button'
            aria-controls={isMenuOpen ? 'chat-item-menu' : undefined}
            aria-haspopup='true'
            aria-expanded={isMenuOpen ? 'true' : undefined}
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
              event.stopPropagation();
              handleChatItemMenuClick(event, chat._id);
            }}
          >
            <MoreHorizRoundedIcon />
          </Box>
        </Tooltip>

        {menuAnchorEl && (
          <Menu
            id='chat-item-menu'
            anchorEl={menuAnchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            open={isMenuOpen}
            onClose={handleChatItemMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            slotProps={{
              list: { 'aria-labelledby': 'chat-item-menu-button' },
            }}
          >
            <MenuList disablePadding sx={{ width: '12rem' }}>
              <MenuItem
                divider
                sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}
                onClick={(event) => {
                  event.stopPropagation();
                  hideChat(chat._id);
                }}
              >
                <ListItemIcon>
                  <VisibilityOffOutlinedIcon sx={{ fontSize: '2rem', marginRight: '1rem' }} /> Hide
                </ListItemIcon>
              </MenuItem>

              <MenuItem
                sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}
                onClick={(event) => {
                  event.stopPropagation();
                  deleteChat(chat._id);
                }}
              >
                <ListItemIcon>
                  <DeleteOutlinedIcon sx={{ fontSize: '2rem', marginRight: '1rem' }} /> Delete
                </ListItemIcon>
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Box>
    </Box>
  );
};

export default memo(ChatItem);
