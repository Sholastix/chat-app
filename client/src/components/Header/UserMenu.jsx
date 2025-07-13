import { memo } from 'react';
import { Avatar, Button, Divider, ListItemIcon, Menu, MenuList, MenuItem, Typography } from '@mui/material';

// MUI Icons.
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Logout from '@mui/icons-material/Logout';
import Settings from '@mui/icons-material/Settings';

const UserMenu = memo(
  ({
    anchorUserMenu,
    avatar,
    handleProfileModalOpen,
    handleSettingsModalOpen,
    handleUserMenuClick,
    handleUserMenuClose,
    logOut,
    openUserMenu,
    username,
  }) => (
    <>
      <Button
        id='user-menu-button'
        aria-controls={openUserMenu ? 'user-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={openUserMenu ? 'true' : undefined}
        onClick={handleUserMenuClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          color: 'black',
          margin: '0.5rem 1rem',
          padding: '0.5rem 2rem',
          textTransform: 'none',
          ':hover': { backgroundColor: 'rgb(235, 235, 235)', color: 'black' },
        }}
      >
        <Avatar sx={{ fontSize: '2rem', marginRight: '0.5rem' }} src={avatar} />

        <Typography sx={{ fontSize: '1.4rem' }}>{username}</Typography>
      </Button>

      <Menu
        id='user-menu'
        anchorEl={anchorUserMenu}
        open={openUserMenu}
        slotProps={{
          list: {
            'aria-labelledby': 'user-menu-button',
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top',
        }}
        onClose={handleUserMenuClose}
      >
        <MenuList disablePadding>
          <MenuItem onClick={handleProfileModalOpen} sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}>
            <Avatar sx={{ fontSize: '2rem', marginRight: '0.5rem' }} src={avatar} /> Profile
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleSettingsModalOpen} sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}>
            <ListItemIcon>
              <Settings sx={{ fontSize: '2rem', marginRight: '0.5rem' }} /> Settings
            </ListItemIcon>
          </MenuItem>

          <MenuItem onClick={logOut} sx={{ fontFamily: 'Georgia', fontSize: '1.4rem' }}>
            <ListItemIcon>
              <Logout sx={{ fontSize: '2rem', marginRight: '0.5rem' }} /> Logout
            </ListItemIcon>
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  )
);

// For debugging purposes.
UserMenu.displayName = 'UserMenu';

export default UserMenu;
