import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
import userReducer  from '@/src/services/slices/userSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
