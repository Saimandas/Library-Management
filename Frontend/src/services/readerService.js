import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export const loginUser = async (email, password) => {
  try {
    const res = await api.post("/readers/login", { email, password });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const registerUser = async (userData) => {
  try {
    const res = await api.post("/readers/register", userData);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await api.get("/readers/current-reader");
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const logoutUser = async () => {
  try {
    const res = await api.post("/readers/logout");
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getAllBooks = async (params = {}) => {
  try {
    const res = await api.get("/readers/books", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getBookById = async (id) => {
  try {
    const res = await api.get(`/readers/books/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getMyDownloads = async () => {
  try {
    const res = await api.get("/readers/my-downloads");
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await api.post("/readers/forgot-password", { email });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const resetPassword = async (token, password) => {
  try {
    const res = await api.post(`/readers/reset-password/${token}`, { password });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export default api;
