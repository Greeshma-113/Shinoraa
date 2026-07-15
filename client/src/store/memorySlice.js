import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  memories: [],
  stickyNotes: [],
  secretLetters: [],
  loveNotes: [],
  loading: false,
};

const memorySlice = createSlice({
  name: 'memory',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setMemories(state, action) {
      state.memories = action.payload;
    },
    addMemory(state, action) {
      state.memories.unshift(action.payload);
    },
    updateMemory(state, action) {
      const idx = state.memories.findIndex(m => m._id === action.payload._id);
      if (idx !== -1) state.memories[idx] = action.payload;
    },
    deleteMemory(state, action) {
      state.memories = state.memories.filter(m => m._id !== action.payload);
    },
    setNotes(state, action) {
      const notes = action.payload;
      state.stickyNotes = notes.filter(n => n.type === 'sticky');
      state.secretLetters = notes.filter(n => n.type === 'secret');
      state.loveNotes = notes.filter(n => n.type === 'love');
    },
    addNote(state, action) {
      const note = action.payload;
      if (note.type === 'sticky') state.stickyNotes.push(note);
      else if (note.type === 'secret') state.secretLetters.unshift(note);
      else if (note.type === 'love') state.loveNotes.unshift(note);
    },
    updateNote(state, action) {
      const note = action.payload;
      let targetArray = null;
      if (note.type === 'sticky') targetArray = state.stickyNotes;
      else if (note.type === 'secret') targetArray = state.secretLetters;
      else if (note.type === 'love') targetArray = state.loveNotes;
      
      if (targetArray) {
        const idx = targetArray.findIndex(n => n._id === note._id);
        if (idx !== -1) targetArray[idx] = note;
      }
    },
    deleteNote(state, action) {
      const { id, type } = action.payload;
      if (type === 'sticky') {
        state.stickyNotes = state.stickyNotes.filter(n => n._id !== id);
      } else if (type === 'secret') {
        state.secretLetters = state.secretLetters.filter(n => n._id !== id);
      } else if (type === 'love') {
        state.loveNotes = state.loveNotes.filter(n => n._id !== id);
      }
    }
  }
});

export const {
  setLoading,
  setMemories,
  addMemory,
  updateMemory,
  deleteMemory,
  setNotes,
  addNote,
  updateNote,
  deleteNote
} = memorySlice.actions;

export default memorySlice.reducer;
