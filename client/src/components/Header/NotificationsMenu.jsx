import { memo } from 'react';
import { Badge, Box, IconButton, Menu, MenuList, MenuItem, Typography } from '@mui/material';

// MUI Icons.
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';

const NotificationsMenu = ({
  anchorNotificationsMenu,
  handleNotificationItemClick,
  handleNotificationsMenuClick,
  handleNotificationsMenuClose,
  notifications,
  openNotificationsMenu,
}) => (
  <>
    <IconButton
      id='notifications-button'
      aria-label='notifications'
      aria-controls={openNotificationsMenu ? 'notifications-menu' : undefined}
      aria-haspopup='true'
      aria-expanded={openNotificationsMenu ? 'true' : undefined}
      onClick={handleNotificationsMenuClick}
    >
      <Badge
        badgeContent={notifications.length ? notifications.length : 0}
        max={99}
        color='primary'
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: 'rgb(93, 109, 126)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          },
        }}
      >
        <NotificationsOutlinedIcon sx={{ color: 'black', fontSize: '3rem' }} />
      </Badge>
    </IconButton>

    <Menu
      id='notifications-menu'
      anchorEl={anchorNotificationsMenu}
      open={openNotificationsMenu}
      slotProps={{
        list: {
          'aria-labelledby': 'notifications-button',
        },
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      onClose={handleNotificationsMenuClose}
    >
      <MenuList
        id='menu-list'
        component='div'
        disablePadding
        sx={{
          alignContent: 'center',
          height: 'fit-content',
          maxHeight: '35rem',
          minHeight: '5rem',
          overflowY: notifications.length === 0 ? 'hidden' : 'auto',
          padding: '0rem 1rem',
          scrollbarWidth: 'thin',
        }}
      >
        {notifications.length === 0 && (
          <Box component='div' sx={{ fontSize: '1.4rem' }}>
            No new messages
          </Box>
        )}

        {notifications.map((notification) => (
          <MenuItem
            id='menu-item'
            divider
            key={notification._id}
            sx={{ height: '5rem', width: '30rem' }}
            onClick={() => handleNotificationItemClick(notification._id, notification.messageId)}
          >
            <Box component='div' sx={{ display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
              <Typography component='div' sx={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                {notification.content + ':'}
              </Typography>

              <Typography component='div' sx={{ fontSize: '1.4rem' }}>
                {notification.messageId?.content || 'Message not found.'}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  </>
);

export default memo(NotificationsMenu);
