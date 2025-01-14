import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState } from '../../interfaces/user';
import { setToken } from '@/app/actions';

const initialState: UserState = {
  token: null,
  expiresIn: null,
  isProfileCompleted: false,
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      const token = action.payload.token;
      if (token) {
        setToken(token);
      }
      console.log("moved from userSlice")
      console.log("action.payload", action.payload)
      return { ...state, ...action.payload };
    },
    clearUser() {
      return { ...initialState };
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
