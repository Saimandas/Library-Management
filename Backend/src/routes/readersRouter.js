import { Router } from "express";
import { currentUser, borrowBook, login, logout, register } from "../controllers/readersControllers.js";
import { checkIsLoggedIn } from "../middlewares/userAuth.js";

const readersRouter=Router();

readersRouter.route("/register").post(register);
readersRouter.route("/login").post(login);
readersRouter.route("/borrowBook").post(checkIsLoggedIn,borrowBook);
readersRouter.route("/current-reader").get(checkIsLoggedIn,currentUser);
readersRouter.route("/logout").post(checkIsLoggedIn,logout);

export default readersRouter;
