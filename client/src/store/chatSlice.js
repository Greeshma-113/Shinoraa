import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  typing: false,
  partnerOnline: false,
  activeChatPartnerTyping: false,
  pinnedMessages: [],
  unreadCount: 0,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages(state, action) {
      state.messages = action.payload;
    },
    addMessage(state, action) {
      const exists = state.messages.find(m => m._id === action.payload._id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    updateMessage(state, action) {
      const idx = state.messages.findIndex(m => m._id === action.payload._id);
      if (idx !== -1) {
        state.messages[idx] = { ...state.messages[idx], ...action.payload };
      }
    },
    deleteMessage(state, action) {
      state.messages = state.messages.filter(m => m._id !== action.payload);
    },
    setTyping(state, action) {
      state.activeChatPartnerTyping = action.payload;
    },
    setPartnerOnline(state, action) {
      state.partnerOnline = action.payload;
    },
    setPinnedMessages(state, action) {
      state.pinnedMessages = action.payload;
    },
    addReaction(state, action) {
      const { messageId, reaction, username } = action.payload;
      const msg = state.messages.find(m => m._id === messageId);
      if (msg) {
        if (!msg.reactions) msg.reactions = [];
        const existingReaction = msg.reactions.find(r => r.username === username);
        if (existingReaction) {
          existingReaction.reaction = reaction;
        } else {
          msg.reactions.push({ username, reaction });
        }
      }
    },
    clearUnread(state) {
      state.unreadCount = 0;
    },
    incrementUnread(state) {
      state.unreadCount += 1;
    }
  }
});

export const {
  setMessages,
  addMessage,
  updateMessage,
  deleteMessage,
  setTyping,
  setPartnerOnline,
  setPinnedMessages,
  addReaction,
  clearUnread,
  incrementUnread
} = chatSlice.actions;

export default chatSlice.reducer;
