import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';

// MUI Icons.
import CloseIcon from '@mui/icons-material/Close';

// Functions.
import { createGroupChat } from '../../../features/chat/chatSlice';

const GroupChatModal = (props) => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer
  });

  const chatState = useSelector((state) => {
    return state.chatReducer;
  });

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  const [inputError, setInputError] = useState(false);
  const [inputHelperText, setInputHelperText] = useState('');

  const [groupChatName, setGroupChatName] = useState('');
  const [groupChatUsers, setGroupChatUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);

  const handleGroupChatModalClose = () => {
    props.setIsGroupChatModalOpen(false);
    setGroupChatName('');
    setGroupChatUsers([]);
    setSearch('');
    setSearchResult([]);
  };

  return (
    <Dialog
      open={props.isGroupChatModalOpen}
      onClose={handleGroupChatModalClose}
    >
      <DialogTitle
        sx={{
          fontSize: '2rem',
          marginTop: '2rem',
          textAlign: 'center'
        }}
      >
        <IconButton
          aria-label='close'
          onClick={handleGroupChatModalClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon sx={{ fontSize: '2rem' }} />
        </IconButton>
        Create Group Chat
      </DialogTitle>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
        }}
      >
        <DialogContent>
          <TextField
            // error={inputError}
            // helperText={inputHelperText}
            label='Enter group chat name...'
            variant='outlined'
            slotProps={{
              inputLabel: { sx: { fontSize: '1.4rem' } }
            }}
            sx={{
              width: '100%',
              '.MuiOutlinedInput-notchedOutline': { fontSize: '1.4rem' },
              '.MuiInputBase-input': { fontSize: '1.4rem' },
            }}
            value={groupChatName}
            onChange={(event) => { setGroupChatName(event.target.value) }}
          />
          <TextField
            // error={inputError}
            // helperText={inputHelperText}
            label='Add minimum 3 users...'
            variant='outlined'
            slotProps={{
              inputLabel: { sx: { fontSize: '1.4rem' } }
            }}
            sx={{
              width: '100%',
              '.MuiOutlinedInput-notchedOutline': { fontSize: '1.4rem' },
              '.MuiInputBase-input': { fontSize: '1.4rem' },
            }}
            value={groupChatUsers}
            onChange={(event) => { setGroupChatUsers(event.target.value) }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            type='submit'
            variant='outlined'
            sx={{
              borderColor: 'lightgray',
              color: 'black',
              fontSize: '1.4rem',
              fontWeight: '400',
              marginBottom: '2rem',
              padding: '0.5rem 2rem',
              textTransform: 'none',
              ':hover': { backgroundColor: 'rgb(235, 235, 235)' }
            }}
          // onClick={}
          >
            Submit
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default GroupChatModal;