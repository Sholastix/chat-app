import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Initial STATE for 'Chat'.
const initialState = {
  loading: false,
  error: '',
  chats: [],
  selectedChat: null,
  notifications: []
};

// Get all chats of the current user.
export const fetchChats = createAsyncThunk('chat/fetchChats', async () => {
  try {
    const { data } = await axios.get('http://localhost:5000/api/chat');

    return data;
  } catch (err) {
    console.error(err);
  };
});

// Get one specific chat of the current user.
export const fetchChat = createAsyncThunk('chat/fetchChat', async (chatId) => {
  try {
    const { data } = await axios.get(`http://localhost:5000/api/chat/${chatId}`);

    return data;
  } catch (err) {
    console.error(err);
  };
});

// Create new private chat or return it if it exists already.
export const createPrivateChat = createAsyncThunk('chat/createPrivateChat', async (userId) => {
  try {
    let allChats = await axios.get('http://localhost:5000/api/chat');

    const createdChat = await axios.post('http://localhost:5000/api/chat', { userId });

    const isChatExists = allChats.data.find((chat) => chat._id === createdChat.data._id);
    console.log('IS_PRIVATE_CHAT_EXISTS: ', isChatExists);

    // If that chat already existed in database then we don't add it to our chats list again. 
    if (isChatExists === undefined) {
      allChats.data.push(createdChat.data);
    };

    return {
      createdChat: createdChat.data,
      allChats: allChats.data
    };
  } catch (err) {
    console.error(err);
  };
});

// Create group chat.
export const createGroupChat = createAsyncThunk('chat/createGroupChat', async ({ chatName, users }) => {
  try {
    let allChats = await axios.get('http://localhost:5000/api/chat');

    const createdGroupChat = await axios.post('http://localhost:5000/api/chat/group', { chatName, users });

    const isChatExists = allChats.data.find((chat) => chat._id === createdGroupChat.data._id);
    console.log('IS_GROUP_CHAT_EXISTS: ', isChatExists);

    // If that chat already existed in database then we don't add it to our chats list again. 
    if (isChatExists === undefined) {
      allChats.data.push(createdGroupChat.data);
    };

    return {
      createdGroupChat: createdGroupChat.data,
      allChats: allChats.data
    };
  } catch (err) {
    console.error(err);
  };
});

// Rename group chat.
export const renameGroupChat = createAsyncThunk('chat/renameGroupChat', async ({ chatId, chatName }) => {
  try {
    const { data } = await axios.put('http://localhost:5000/api/chat/group/rename', { chatId, chatName });

    return data;
  } catch (err) {
    console.error(err);
  };
});

// Add user to group chat.
export const addUserToGroupChat = createAsyncThunk('chat/addUserToGroupChat', async ({ chatId, userId }) => {
  try {
    const { data } = await axios.put('http://localhost:5000/api/chat/group/add', { chatId, userId });

    return data;
  } catch (err) {
    console.error(err);
  };
});

// Remove user from group chat.
export const removeUserFromGroupChat = createAsyncThunk('chat/removeUserFromGroupChat', async ({ chatId, userId, currentUserId }) => {
  try {
    const { data } = await axios.put('http://localhost:5000/api/chat/group/remove', { chatId, userId });
    console.log('REMOVE_USER_FROM_GROUP_CHAT: ', data);

    if (userId === currentUserId) {
      return null;
    } else {
      return data;
    };
  } catch (err) {
    console.error(err);
  };
});

// Create slice of the STORE for 'Chat'.
const chatSlice = createSlice({
  // Specify the name of this slice.
  name: 'chat',
  // Specify the initial STATE for this slice.
  initialState,
  // Specify the REDUCER for this slice.
  reducers: {
    // Reset STATE for 'selected chat'.
    resetSelectedChatState: (state, action) => {
      // Mutating the STATE directly is possible due to 'redux-toolkit' using npm 'Immer' under the hood.
      state.selectedChat = action.payload
    },

    // Set STATE for 'notifications'.
    resetNotifications: (state, action) => {
      if (Array.isArray(action.payload) === false) {
        state.notifications = [...state.notifications, action.payload];
      } else {
        state.notifications = action.payload;
      };
    },
  },

  // Specify the EXTRA_REDUCERS.
  extraReducers: (builder) => {
    // -------------------------------   FETCH CHATS   -------------------------------

    builder.addCase(fetchChats.pending, (state, action) => {
      state.loading = true
    });

    builder.addCase(fetchChats.fulfilled, (state, action) => {
      console.log('ACTION_PAYLOAD_FETCH_CHATS: ', action.payload)
      state.loading = false,
      state.error = '',
      state.chats = action.payload
    });

    builder.addCase(fetchChats.rejected, (state, action) => {
      state.loading = false,
      state.error = action.error.message,
      state.chats = [],
      state.selectedChat = null
    });

    // -------------------------------   FETCH CHAT   -------------------------------

    builder.addCase(fetchChat.pending, (state, action) => {
      state.loading = true
    });

    builder.addCase(fetchChat.fulfilled, (state, action) => {
      console.log('ACTION_PAYLOAD_FETCH_CHAT: ', action.payload)
      state.loading = false,
      state.error = '',
      // state.chats = [...state.chats],
      state.selectedChat = action.payload
    });

    builder.addCase(fetchChat.rejected, (state, action) => {
      state.loading = false,
      state.error = action.error.message,
      // state.chats = [...state.chats],
      state.selectedChat = null
    });

    // -------------------------------   CREATE PRIVATE CHAT   -------------------------------

    builder.addCase(createPrivateChat.pending, (state, action) => {
      state.loading = true
    });

    builder.addCase(createPrivateChat.fulfilled, (state, action) => {
      console.log('ACTION_PAYLOAD_ALL_CHATS: ', action.payload?.allChats)
      console.log('ACTION_PAYLOAD_CREATE_PRIVATE_CHAT: ', action.payload?.createdChat)
      state.loading = false,
      state.error = '',
      state.chats = action.payload?.allChats,
      state.selectedChat = action.payload?.createdChat
    });

    builder.addCase(createPrivateChat.rejected, (state, action) => {
      state.loading = false,
      state.error = action.error.message,
      // state.chats = [...state.chats],
      state.selectedChat = null
    });

    // -------------------------------   CREATE GROUP CHAT   -------------------------------

    builder.addCase(createGroupChat.pending, (state, action) => {
      state.loading = true
    });

    builder.addCase(createGroupChat.fulfilled, (state, action) => {
      console.log('ACTION_PAYLOAD_ALL_CHATS: ', action.payload?.allChats)
      console.log('ACTION_PAYLOAD_CREATE_GROUP_CHAT: ', action.payload?.createdGroupChat)
      state.loading = false,
      state.error = '',
      state.chats = action.payload?.allChats,
      state.selectedChat = action.payload?.createdGroupChat
    });

    builder.addCase(createGroupChat.rejected, (state, action) => {
      state.loading = false,
      state.error = action.error.message,
      // state.chats = [...state.chats],
      state.selectedChat = null
    });

    // -------------------------------   RENAME GROUP CHAT   -------------------------------

    builder.addCase(renameGroupChat.pending, (state, action) => {
      state.loading = true
    });

    builder.addCase(renameGroupChat.fulfilled, (state, action) => {
      console.log('ACTION_PAYLOAD_RENAME_GROUP_CHAT: ', action.payload)
      state.loading = false,
      state.error = '',
      state.selectedChat = action.payload
    });

    builder.addCase(renameGroupChat.rejected, (state, action) => {
      state.loading = false,
      state.error = action.error.message
    });

    // -------------------------------   ADD USER TO GROUP CHAT   -------------------------------

    builder.addCase(addUserToGroupChat.pending, (state, action) => {
      state.loading = true
    });

    builder.addCase(addUserToGroupChat.fulfilled, (state, action) => {
      console.log('ACTION_PAYLOAD_ADD_USER_TO_GROUP_CHAT: ', action.payload)
      state.loading = false,
      state.error = '',
      state.selectedChat = action.payload
    });

    builder.addCase(addUserToGroupChat.rejected, (state, action) => {
      state.loading = false,
      state.error = action.error.message
    });

    // -------------------------------   REMOVE USER FROM GROUP CHAT   -------------------------------

    builder.addCase(removeUserFromGroupChat.pending, (state, action) => {
      state.loading = true
    });

    builder.addCase(removeUserFromGroupChat.fulfilled, (state, action) => {
      console.log('ACTION_PAYLOAD_REMOVE_USER_FROM_GROUP_CHAT: ', action.payload)
      state.loading = false,
      state.error = '',
      state.selectedChat = action.payload
    });

    builder.addCase(removeUserFromGroupChat.rejected, (state, action) => {
      state.loading = false,
      state.error = action.error.message
    });
  },
});

export const { resetSelectedChatState, resetNotifications } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;