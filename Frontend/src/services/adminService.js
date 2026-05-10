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
    const res = await api.post("/admin/add-book", bookData);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const updateBook = async (id, bookData) => {
  try {
    const res = await api.put(`/admin/books/${id}`, bookData);
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

export const getStats = async () => {
  try {
    const [books, users, transactions] = await Promise.all([
      api.get("/admin/total-books"),
      api.get("/admin/total-users"),
      api.get("/admin/total-transactions"),
    ]);
    return {
      totalBooks: books.data.data,
      totalUsers: users.data.data,
      totalTransactions: transactions.data.data,
    };
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getRecentTransactions = async (limit = 10) => {
  try {
    const res = await api.get("/admin/recent-transactions", { params: { limit } });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getAllTransactions = async (params = {}) => {
  try {
    const res = await api.get("/admin/transactions", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};