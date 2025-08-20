import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { signout } from '../auth/authSlice';

// Initial STATE for 'Chat'.
const initialState = {
  loading: false,
  error: '',
  chats: [],
  selectedChat: null,
  usersOnline: [],
};

// Get all chats of the current user.
export const fetchChats = createAsyncThunk('chat/fetchChats', async () => {
  const { data } = await axios.get('/api/chat');

  return data;
});

// Get one specific chat of the current user.
export const fetchChat = createAsyncThunk('chat/fetchChat', async (chatId) => {
  const { data } = await axios.get(`/api/chat/${chatId}`);

  return data;
});

// Create new private chat or return it if it exists already.
export const createPrivateChat = createAsyncThunk('chat/createPrivateChat', async (userId) => {
  let allChats = await axios.get('/api/chat');
  const createdChat = await axios.post('/api/chat', { userId });
  const isChatExists = allChats.data.find((chat) => chat._id === createdChat.data._id);

  // If that chat already existed in database then we don't add it to our chats list again.
  if (isChatExists === undefined) {
    allChats.data.push(createdChat.data);
  }

  return {
    createdChat: createdChat.data,
    allChats: allChats.data,
  };
});

// Create group chat.
export const createGroupChat = createAsyncThunk('chat/createGroupChat', async ({ chatName, users }) => {
  let allChats = await axios.get('/api/chat');
  const createdGroupChat = await axios.post('/api/chat/group', { chatName, users });
  const isChatExists = allChats.data.find((chat) => chat._id === createdGroupChat.data._id);

  // If that chat already existed in database then we don't add it to our chats list again.
  if (isChatExists === undefined) {
    allChats.data.push(createdGroupChat.data);
  }

  return {
    createdGroupChat: createdGroupChat.data,
    allChats: allChats.data,
  };
});

// Add existing group chat to chat list.
export const accessGroupChat = createAsyncThunk('chat/accessGroupChat', async (groupId) => {
  const allChats = await axios.get('/api/chat');
  const existedGroupChat = await axios.get(`/api/chat/${groupId}`);
  const updatedAllChats = [...allChats.data, existedGroupChat.data];

  return updatedAllChats;
});

// Rename group chat.
export const renameGroupChat = createAsyncThunk('chat/renameGroupChat', async ({ chatId, chatName }) => {
  const { data } = await axios.put('/api/chat/group/rename', { chatId, chatName });

  return data;
});

// Add user to group chat.
export const addUserToGroupChat = createAsyncThunk('chat/addUserToGroupChat', async ({ chatId, userId }) => {
  const { data } = await axios.put('/api/chat/group/add', { chatId, userId });

  return data;
});

// Remove user from group chat.
export const removeUserFromGroupChat = createAsyncThunk('chat/removeUserFromGroupChat', async ({ chatId, userId, currentUserId }) => {
    const { data } = await axios.put('/api/chat/group/remove', { chatId, userId });

    if (userId === currentUserId) {
      return null;
    } else {
      return data;
    }
  }
);

// Create slice of the STORE for 'Chat'.
const chatSlice = createSlice({
  // Specify the name of this slice.
  name: 'chat',
  // Specify the initial STATE for this slice.
  initialState,
  // Specify the REDUCER for this slice.
  reducers: {
    // Reset entire 'chat' STATE.
    resetChatState: () => initialState,

    // Reset STATE for 'selected chat'.
    resetSelectedChatState: (state, action) => {
      // Mutating the STATE directly is possible due to 'redux-toolkit' using npm 'Immer' under the hood.
      state.selectedChat = action.payload;
    },

    // Set STATE for 'isUserOnline'.
    onlineUsers: (state, action) => {
      state.usersOnline = action.payload;
    },

    updateChatLastMessage: (state, action) => {
      const updatedChat = action.payload;

      state.chats = state.chats.map((chat) =>
        chat._id === updatedChat._id ? { ...chat, lastMessage: updatedChat.lastMessage } : chat
      );
    },
  },

  // Specify the EXTRA_REDUCERS.
  extraReducers: (builder) => {
    // Reset chat state when user signs out:
    builder.addCase(signout, () => initialState);

    // -------------------------------   FETCH CHATS   -------------------------------
    builder.addCase(fetchChats.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchChats.fulfilled, (state, action) => {
      state.loading = false;
      state.error = '';
      state.chats = action.payload;
    });

    builder.addCase(fetchChats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
      state.chats = [];
      state.selectedChat = null;
    });

    // -------------------------------   FETCH CHAT   -------------------------------
    builder.addCase(fetchChat.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchChat.fulfilled, (state, action) => {
      state.loading = false;
      state.error = '';
      state.selectedChat = action.payload;
    });

    builder.addCase(fetchChat.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
      state.selectedChat = null;
    });

    // -------------------------------   CREATE PRIVATE CHAT   -------------------------------
    builder.addCase(createPrivateChat.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(createPrivateChat.fulfilled, (state, action) => {
      state.loading = false;
      state.error = '';
      state.chats = action.payload?.allChats;
      // state.selectedChat = action.payload?.createdChat; // auto-redirect to created or existed chat.
    });

    builder.addCase(createPrivateChat.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
      // state.selectedChat = null;
    });

    // -------------------------------   CREATE GROUP CHAT   -------------------------------
    builder.addCase(createGroupChat.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(createGroupChat.fulfilled, (state, action) => {
      state.loading = false;
      state.error = '';
      state.chats = action.payload?.allChats;
      // state.selectedChat = action.payload?.createdGroupChat; // auto-redirect to created or existed chat.
    });

    builder.addCase(createGroupChat.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
      // state.selectedChat = null;
    });

    // -------------------------------   ADD EXISTING GROUP CHAT TO THE LIST   -------------------------------
    builder.addCase(accessGroupChat.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(accessGroupChat.fulfilled, (state, action) => {
      console.log('AP: ', action.payload)
      state.loading = false;
      state.error = '';
      state.chats = action.payload;
      // state.selectedChat = action.payload;
    });

    builder.addCase(accessGroupChat.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // -------------------------------   RENAME GROUP CHAT   -------------------------------
    builder.addCase(renameGroupChat.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(renameGroupChat.fulfilled, (state, action) => {
      state.loading = false;
      state.error = '';
      state.selectedChat = action.payload;
    });

    builder.addCase(renameGroupChat.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // -------------------------------   ADD USER TO GROUP CHAT   -------------------------------
    builder.addCase(addUserToGroupChat.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(addUserToGroupChat.fulfilled, (state, action) => {
      state.loading = false;
      state.error = '';
      state.selectedChat = action.payload;
    });

    builder.addCase(addUserToGroupChat.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // -------------------------------   REMOVE USER FROM GROUP CHAT   -------------------------------
    builder.addCase(removeUserFromGroupChat.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(removeUserFromGroupChat.fulfilled, (state, action) => {
      state.loading = false;
      state.error = '';
      state.selectedChat = action.payload;
    });

    builder.addCase(removeUserFromGroupChat.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
});

export const { resetChatState, resetSelectedChatState, onlineUsers, updateChatLastMessage } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;
