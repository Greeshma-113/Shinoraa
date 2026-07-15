import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import memoryReducer from './memorySlice';
import plannerReducer from './plannerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    memory: memoryReducer,
    planner: plannerReducer,
  },
});
export default store;
