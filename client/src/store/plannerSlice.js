import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  events: [],
  tasks: [],
  shoppingList: [],
  loading: false,
};

const plannerSlice = createSlice({
  name: 'planner',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setEvents(state, action) {
      state.events = action.payload;
    },
    addEvent(state, action) {
      state.events.push(action.payload);
      state.events.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    },
    deleteEvent(state, action) {
      state.events = state.events.filter(e => e._id !== action.payload);
    },
    setPlannerLists(state, action) {
      const items = action.payload;
      state.tasks = items.filter(i => i.type === 'task');
      state.shoppingList = items.filter(i => i.type === 'shopping');
    },
    addItem(state, action) {
      const item = action.payload;
      if (item.type === 'task') state.tasks.push(item);
      else if (item.type === 'shopping') state.shoppingList.push(item);
    },
    updateItem(state, action) {
      const item = action.payload;
      const arr = item.type === 'task' ? state.tasks : state.shoppingList;
      const idx = arr.findIndex(i => i._id === item._id);
      if (idx !== -1) arr[idx] = item;
    },
    removeItem(state, action) {
      const { id, type } = action.payload;
      if (type === 'task') {
        state.tasks = state.tasks.filter(i => i._id !== id);
      } else {
        state.shoppingList = state.shoppingList.filter(i => i._id !== id);
      }
    }
  }
});

export const {
  setLoading,
  setEvents,
  addEvent,
  deleteEvent,
  setPlannerLists,
  addItem,
  updateItem,
  removeItem
} = plannerSlice.actions;

export default plannerSlice.reducer;
