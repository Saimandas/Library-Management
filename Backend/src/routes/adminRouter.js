import { Router } from "express";
import {
    adminLogin, addBook, getCategoryList, getCurrentAdmin, getUsers,
    getUserById, updateUser, deleteUser, toggleUserStatus,
    getBooks, getBookById, updateBook, deleteBook,
    getRecentTransactions, getAllTransactions,
    totalBooks, totalUsers, totalTransactions,
    addCategory, deleteCategory,
    logout
} from "../controllers/AdminControllers.js";
import { checkIsAdmin } from "../middlewares/adminAuth.js";

const adminRouter = Router();

adminRouter.route("/login").post(adminLogin);
adminRouter.route("/add-book").post(checkIsAdmin, addBook);
adminRouter.route("/categories").get(getCategoryList);
adminRouter.route("/categories").post(checkIsAdmin, addCategory);
adminRouter.route("/categories/:id").delete(checkIsAdmin, deleteCategory);
adminRouter.route("/total-books").get(checkIsAdmin, totalBooks);
adminRouter.route("/total-users").get(checkIsAdmin, totalUsers);
adminRouter.route("/total-transactions").get(checkIsAdmin, totalTransactions);
adminRouter.route("/current-admin").get(checkIsAdmin, getCurrentAdmin);
adminRouter.route("/users").get(checkIsAdmin, getUsers);
adminRouter.route("/users/:id").get(checkIsAdmin, getUserById);
adminRouter.route("/users/:id").put(checkIsAdmin, updateUser);
adminRouter.route("/users/:id").delete(checkIsAdmin, deleteUser);
adminRouter.route("/users/:id/toggle-status").put(checkIsAdmin, toggleUserStatus);
adminRouter.route("/books").get(checkIsAdmin, getBooks);
adminRouter.route("/books/:id").get(checkIsAdmin, getBookById);
adminRouter.route("/books/:id").put(checkIsAdmin, updateBook);
adminRouter.route("/books/:id").delete(checkIsAdmin, deleteBook);
adminRouter.route("/transactions").get(checkIsAdmin, getAllTransactions);
adminRouter.route("/recent-transactions").get(checkIsAdmin, getRecentTransactions);
adminRouter.route("/logout").post(checkIsAdmin, logout);

export default adminRouter;