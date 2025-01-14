import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState } from '@/src/interfaces/user';

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
      return { ...state, ...action.payload };
    },
    clearUser() {
      return { ...initialState };
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;

// userId=6839c4d5-5e3c-47da-aa49-e4a13e6d56a7&code=RDA0OEZBRkMyOUI3RDhBNTIxOUZCRjVFMDY0MTEzRjFFQ0FGOUEwQkU2MkMzREY5M0JGMDY1QkM1OUNGRUY5NjM1ODY5NEMyNDgzRTM0NUQ