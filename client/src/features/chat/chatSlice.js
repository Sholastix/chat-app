import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Initial STATE for 'Chat'.
const initialState = {
  loading: false,
  error: '',
  chats: [],
  selectedChat: null
};

export const createPrivateChat = createAsyncThunk('chat/createPrivateChat', async (userId) => {
  try {
    // Return newly created 1-on-1 chat.
    const { data } = await axios.post('http://localhost:5000/api/chat', { userId });

    // // If that chat already in our chats list then we just update the chats list. 
    // if (chats.find((chat) => chat._id === data._id)) {
    //   setChats([data, ...chats]);
    // };

    return data;
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
  reducers: {},
  // Specify the EXTRA_REDUCERS.
  extraReducers: (builder) => {
    // -------------------------------   CREATE 1-on-1 CHAT   -------------------------------

    // Commented because we set initial STATE value of 'loading' to 'true'.
    builder.addCase(createPrivateChat.pending, (state, action) => {
      state.loading = true
    });

    builder.addCase(createPrivateChat.fulfilled, (state, action) => {
      state.loading = false,
      state.error = '',
      state.chats = [],
      state.selectedChat = action.payload
    });

    builder.addCase(createPrivateChat.rejected, (state, action) => {
      state.loading = false,
      state.error = action.error.message,
      state.chats = [],
      state.selectedChat = null
    });
  },
});

export const chatReducer = chatSlice.reducer;