import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Initial STATE for 'Chat'.
const initialState = {
  loading: false,
  error: '',
  chats: [],
  selectedChat: null
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

// Create new 1-on-1 chat or return existed chat.
export const createPrivateChat = createAsyncThunk('chat/createPrivateChat', async (userId) => {
  try {
    let allChats = await axios.get('http://localhost:5000/api/chat');
    console.log('FETCH_CHATS: ', allChats.data);

    const createdChat = await axios.post('http://localhost:5000/api/chat', { userId });
    console.log('CREATED_CHAT: ', createdChat.data);

    const isChatExists = allChats.data.find((chat) => chat._id === createdChat.data._id);
    console.log('CHECK: ', isChatExists);

    // If that chat already existed in database then we don't add it to our chats list again. 
    if (isChatExists === undefined) {
      allChats.data.push(createdChat.data);
    };

    return { createdChat: createdChat.data, allChats: allChats.data };
  } catch (err) {
    console.error(err);
  };
});

// Create group chat.
export const createGroupChat = createAsyncThunk('chat/createGroupChat', async ({ chatName, users }) => {
  try {
    let allChats = await axios.get('http://localhost:5000/api/chat');
    console.log('FETCH_CHATS: ', allChats.data);

    const createdGroupChat = await axios.post('http://localhost:5000/api/chat/group', { chatName, users });
    console.log('CREATED_GROUP_CHAT: ', createdGroupChat.data);

    const isChatExists = allChats.data.find((chat) => chat._id === createdGroupChat.data._id);
    console.log('CHECK: ', isChatExists);

    // If that chat already existed in database then we don't add it to our chats list again. 
    if (isChatExists === undefined) {
      allChats.data.push(createdGroupChat.data);
    };

    return { createdGroupChat: createdGroupChat.data, allChats: allChats.data };
  } catch (err) {
    console.error(err);
  };
});

// Rename group chat.
export const renameGroupChat = createAsyncThunk('chat/renameGroupChat', async ({ chatId, chatName }) => {
  try {
    const renamedGroupChat = await axios.put('http://localhost:5000/api/chat/group/rename', { chatId, chatName });
    console.log('RENAMED_GROUP_CHAT: ', renamedGroupChat.data);

    return renamedGroupChat.data;
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
      state.selectedChat = null
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
      state.chats = [...state.chats],
      state.selectedChat = action.payload
    });

    builder.addCase(fetchChat.rejected, (state, action) => {
      state.loading = false,
      state.error = action.error.message,
      state.chats = [...state.chats],
      state.selectedChat = null
    });

    // -------------------------------   CREATE 1-on-1 CHAT   -------------------------------

    builder.addCase(createPrivateChat.pending, (state, action) => {
      state.loading = true
    });

    builder.addCase(createPrivateChat.fulfilled, (state, action) => {
      console.log('ACTION_PAYLOAD_CREATE_PRIVATE_CHAT: ', action.payload.createdChat)
      state.loading = false,
      state.error = '',
      state.chats = action.payload.allChats,
      state.selectedChat = [action.payload.createdChat]
    });

    builder.addCase(createPrivateChat.rejected, (state, action) => {
      state.loading = false,
      state.error = action.error.message,
      state.chats = [...state.chats],
      state.selectedChat = null
    });

    // -------------------------------   CREATE GROUP CHAT   -------------------------------

    builder.addCase(createGroupChat.pending, (state, action) => {
      state.loading = true
    });

    builder.addCase(createGroupChat.fulfilled, (state, action) => {
      console.log('ACTION_PAYLOAD_CREATE_GROUP_CHAT: ', action.payload.createdGroupChat)
      state.loading = false,
      state.error = '',
      state.chats = action.payload.allChats,
      state.selectedChat = [action.payload.createdGroupChat]
    });

    builder.addCase(createGroupChat.rejected, (state, action) => {
      state.loading = false,
      state.error = action.error.message,
      state.chats = [...state.chats],
      state.selectedChat = null
    });

    // -------------------------------   RENAME GROUP CHAT   -------------------------------

    builder.addCase(renameGroupChat.pending, (state, action) => {
      state.loading = true
    });

    builder.addCase(renameGroupChat.fulfilled, (state, action) => {
      console.log('ACTION_PAYLOAD_RENAME: ', action.payload)
      state.loading = false,
      state.error = '',
      state.selectedChat = [action.payload]
    });

    builder.addCase(renameGroupChat.rejected, (state, action) => {
      state.loading = false,
      state.error = action.error.message
    });
  },
});

export const { resetSelectedChatState } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;