import { Router } from "express";
import {
    register, login, currentUser, getMyDownloads, logout,
    getBooks, getBookById, readBook, downloadBook,
    forgotPassword, resetPassword
} from "../controllers/readersControllers.js";
import { checkIsLoggedIn } from "../middlewares/userAuth.js";

const readersRouter = Router();

readersRouter.route("/register").post(register);
readersRouter.route("/login").post(login);
readersRouter.route("/forgot-password").post(forgotPassword);
readersRouter.route("/reset-password/:token").post(resetPassword);
readersRouter.route("/current-reader").get(checkIsLoggedIn, currentUser);
readersRouter.route("/my-downloads").get(checkIsLoggedIn, getMyDownloads);
readersRouter.route("/logout").post(checkIsLoggedIn, logout);
readersRouter.route("/books").get(getBooks);
readersRouter.route("/books/:id").get(getBookById);
readersRouter.route("/books/:id/read").get(readBook);
readersRouter.route("/books/:id/download").get(checkIsLoggedIn, downloadBook);

export default readersRouter;
