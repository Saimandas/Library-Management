import { createSlice } from "@reduxjs/toolkit";
import api from "../services/readerService";

const getInitialState = () => {
  const user = localStorage.getItem("user");
  return {
    user: user ? JSON.parse(user) : null,
    isAuthenticated: !!user,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;

export const logoutAdmin = () => async (dispatch) => {
  try {
    await api.post("/admin/logout");
  } catch (err) {
    console.error("Admin logout error:", err);
  }
  dispatch(clearUser());
};

export default authSlice.reducer;