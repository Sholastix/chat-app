import React from 'react';
import {
  Avatar,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography
} from '@mui/material';

const GroupChatModal = (props) => {
  const handleGroupChatModalClose = () => {
    props.setIsGroupChatModalOpen(false);
  };

  return (
    <Dialog
      open={props.isGroupChatModalOpen}
      onClose={handleGroupChatModalClose}
    >
      <DialogTitle>
        GroupChatModal
      </DialogTitle>
    </Dialog>
  );
};

export default GroupChatModal;