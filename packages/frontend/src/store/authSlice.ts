import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  user: string;
}

const initialState: AuthState = {
  isLoggedIn: false,
  token: null, // Initialize with null, as redux-persist will rehydrate this
  user: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; user: string }>) => {
      state.isLoggedIn = true;
      state.token = action.payload?.token;
      state.user = action.payload?.user;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.token = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
