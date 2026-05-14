import { Router } from "express";
import { upload } from "../utils/multerUpload.js";
import {
    adminLogin, addBook, updateBook, deleteBook,
    getCategoryList, getCurrentAdmin,
    getUsers, getUserById, updateUser, deleteUser, toggleUserStatus,
    getBooks, getBookById,
    addCategory, deleteCategory,
    logout, getPendingUsers, approveUser, getDashboardStats,
    getRecentDownloads, getAllDownloads,
    forgotPassword, resetPassword
} from "../controllers/AdminControllers.js";
import { checkIsAdmin } from "../middlewares/adminAuth.js";

const adminRouter = Router();

adminRouter.route("/login").post(adminLogin);
adminRouter.route("/forgot-password").post(forgotPassword);
adminRouter.route("/reset-password/:token").post(resetPassword);
adminRouter.route("/add-book").post(checkIsAdmin, upload.single("pdfFile"), addBook);
adminRouter.route("/categories").get(getCategoryList);
adminRouter.route("/categories").post(checkIsAdmin, addCategory);
adminRouter.route("/categories/:id").delete(checkIsAdmin, deleteCategory);
adminRouter.route("/current-admin").get(checkIsAdmin, getCurrentAdmin);
adminRouter.route("/users/pending").get(checkIsAdmin, getPendingUsers);
adminRouter.route("/users/:id/approve").put(checkIsAdmin, approveUser);
adminRouter.route("/users").get(checkIsAdmin, getUsers);
adminRouter.route("/users/:id").get(checkIsAdmin, getUserById);
adminRouter.route("/users/:id").put(checkIsAdmin, updateUser);
adminRouter.route("/users/:id").delete(checkIsAdmin, deleteUser);
adminRouter.route("/users/:id/toggle-status").put(checkIsAdmin, toggleUserStatus);
adminRouter.route("/books").get(checkIsAdmin, getBooks);
adminRouter.route("/books/:id").get(checkIsAdmin, getBookById);
adminRouter.route("/books/:id").put(checkIsAdmin, upload.single("pdfFile"), updateBook);
adminRouter.route("/books/:id").delete(checkIsAdmin, deleteBook);
adminRouter.route("/stats").get(checkIsAdmin, getDashboardStats);
adminRouter.route("/downloads").get(checkIsAdmin, getAllDownloads);
adminRouter.route("/downloads/recent").get(checkIsAdmin, getRecentDownloads);
adminRouter.route("/logout").post(checkIsAdmin, logout);

export default adminRouter;
