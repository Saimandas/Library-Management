import api from "./readerService";

export const loginAdmin = async (email, password) => {
  try {
    const res = await api.post("/admin/login", { email, password });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getCurrentAdmin = async () => {
  try {
    const res = await api.get("/admin/current-admin");
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const logoutAdmin = async () => {
  try {
    const res = await api.post("/admin/logout");
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getBooks = async (params = {}) => {
  try {
    const res = await api.get("/admin/books", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getBookById = async (id) => {
  try {
    const res = await api.get(`/admin/books/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const addBook = async (bookData) => {
  try {
    const res = await api.post("/admin/add-book", bookData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const updateBook = async (id, bookData) => {
  try {
    const res = await api.put(`/admin/books/${id}`, bookData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const deleteBook = async (id) => {
  try {
    const res = await api.delete(`/admin/books/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getCategories = async () => {
  try {
    const res = await api.get("/admin/categories");
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const addCategory = async (name) => {
  try {
    const res = await api.post("/admin/categories", { name });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const deleteCategory = async (id) => {
  try {
    const res = await api.delete(`/admin/categories/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getUsers = async (params = {}) => {
  try {
    const res = await api.get("/admin/users", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getUserById = async (id) => {
  try {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const res = await api.put(`/admin/users/${id}`, userData);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const toggleUserStatus = async (id) => {
  try {
    const res = await api.put(`/admin/users/${id}/toggle-status`);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getPendingUsers = async () => {
  try {
    const res = await api.get("/admin/users/pending");
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const approveUser = async (id, approved) => {
  try {
    const res = await api.put(`/admin/users/${id}/approve`, { approved });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getStats = async () => {
  try {
    const res = await api.get("/admin/stats");
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getRecentDownloads = async (limit = 10) => {
  try {
    const res = await api.get("/admin/downloads/recent", { params: { limit } });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getAllDownloads = async (params = {}) => {
  try {
    const res = await api.get("/admin/downloads", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const adminForgotPassword = async (email) => {
  try {
    const res = await api.post("/admin/forgot-password", { email });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const adminResetPassword = async (token, password) => {
  try {
    const res = await api.post(`/admin/reset-password/${token}`, { password });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};
