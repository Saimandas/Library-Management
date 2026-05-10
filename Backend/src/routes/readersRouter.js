import { Router } from "express";
import { currentUser, borrowBook, returnBook, login, logout, register, getMyTransactions, getMyBorrows } from "../controllers/readersControllers.js";
import { checkIsLoggedIn } from "../middlewares/userAuth.js";

const readersRouter = Router();

readersRouter.route("/register").post(register);
readersRouter.route("/login").post(login);
readersRouter.route("/current-reader").get(checkIsLoggedIn, currentUser);
readersRouter.route("/borrow-book").post(checkIsLoggedIn, borrowBook);
readersRouter.route("/return-book").post(checkIsLoggedIn, returnBook);
readersRouter.route("/my-transactions").get(checkIsLoggedIn, getMyTransactions);
readersRouter.route("/my-borrows").get(checkIsLoggedIn, getMyBorrows);
readersRouter.route("/logout").post(checkIsLoggedIn, logout);

readersRouter.route("/books").get(async (req, res) => {
    const Books = (await import("../models/booksModel.js")).default;
    const Category = (await import("../models/categoryModel.js")).default;
    const { search, category, page = 1, limit = 12 } = req.query;

    const query = {};

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { author: { $regex: search, $options: "i" } }
        ];
    }

    if (category) {
        query.category = category;
    }

    query.availableCopies = { $gt: 0 };

    const skip = (page - 1) * limit;

    const books = await Books.find(query)
        .populate("category", "name")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ title: 1 });

    const total = await Books.countDocuments(query);

    res.status(200).json({
        success: true,
        data: { books, total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
});

readersRouter.route("/books/:id").get(async (req, res) => {
    const Books = (await import("../models/booksModel.js")).default;
    const book = await Books.findById(req.params.id).populate("category", "name");
    if (!book) {
        return res.status(404).json({ success: false, message: "Book not found" });
    }
    res.status(200).json({ success: true, data: book });
});

export default readersRouter;