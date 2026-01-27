import { configureStore } from '@reduxjs/toolkit';
import messageReducer from "../slice/messageReducer";

export const store = configureStore({
  reducer: {
    message: messageReducer,
  },
});

export default store;