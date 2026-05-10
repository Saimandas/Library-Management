import { Router } from "express";
import { addBook, getCategoryList, getCurrentAdmin, getUsers,logout, totalBooks, totalUsers,getBooks } from "../controllers/AdminControllers.js";
import { checkIsAdmin } from "../middlewares/adminAuth.js";
import { login } from "../controllers/readersControllers.js";
const adminRouter=Router();

adminRouter.route("/login").post(login);
adminRouter.route("/add-book").post(addBook);
adminRouter.route("/categories").get(getCategoryList);
adminRouter.route("/total-books").get(totalBooks);
adminRouter.route("/total-users").get(totalUsers);
adminRouter.route("/current-admin").get(checkIsAdmin,getCurrentAdmin);
adminRouter.route("/users").get(checkIsAdmin,getUsers);
adminRouter.route("/books").get(checkIsAdmin,getBooks);
adminRouter.route("/logout").post(checkIsAdmin,logout);
export default adminRouter;
