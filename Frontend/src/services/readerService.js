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

export const borrowBook = async (bookId) => {
  try {
    const res = await api.post("/readers/borrow-book", { bookId });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const returnBook = async (transactionId) => {
  try {
    const res = await api.post("/readers/return-book", { transactionId });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getMyTransactions = async () => {
  try {
    const res = await api.get("/readers/my-transactions");
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getMyBorrows = async () => {
  try {
    const res = await api.get("/readers/my-borrows");
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

export default api;