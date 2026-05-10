import Books from "../models/booksModel.js";
import Transactions from "../models/TransactionsModel.js";
import User from "../models/userModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokensGenerator.js";
import bcrypt from "bcryptjs";

const register = asyncHandler(async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName
    });

    return res.status(201).json(new ApiResponse(201, user, "User registered successfully"));
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        throw new ApiError(400, "Invalid credentials");
    }

    if (existingUser.isAdmin) {
        throw new ApiError(403, "Admin users must login via admin portal");
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
        throw new ApiError(400, "Invalid credentials");
    }

    const accesTokenOptions = {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60
    };

    const refreshTokenOptions = {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 10
    };

    const accessToken = generateAccessToken(existingUser);
    const refreshToken = generateRefreshToken(existingUser);

    if (!accessToken || !refreshToken) {
        throw new ApiError(500, "Token generation failed");
    }

    await User.findByIdAndUpdate(existingUser._id, { refreshToken }, { validateBeforeSave: false });

    return res.status(200)
        .cookie("accessToken", accessToken, accesTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(new ApiResponse(200, existingUser, "User logged in successfully"));
});

const currentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(new ApiResponse(200, user, "Current user fetched successfully"));
});

const borrowBook = asyncHandler(async (req, res) => {
    const { bookId } = req.body;
    const userId = req.user._id;

    if (!bookId) {
        throw new ApiError(400, "Book ID is required");
    }

    const existingBook = await Books.findById(bookId);
    if (!existingBook) {
        throw new ApiError(404, "Book not found");
    }

    if (existingBook.availableCopies === 0) {
        throw new ApiError(400, "No copies available");
    }

    const activeTransaction = await Transactions.findOne({
        userId,
        bookId,
        transactionType: "borrow",
        returnDate: null
    });

    if (activeTransaction) {
        throw new ApiError(400, "You already have this book borrowed");
    }

    const issuedDate = new Date();
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 14);

    const transaction = await Transactions.create({
        userId,
        bookId,
        transactionType: "borrow",
        issuedDate,
        returnDate
    });

    if (!transaction) {
        throw new ApiError(500, "Transaction failed");
    }

    await Books.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 } });

    const populatedTransaction = await Transactions.findById(transaction._id)
        .populate("bookId", "title author")
        .populate("userId", "username email");

    return res.status(200).json(new ApiResponse(200, populatedTransaction, "Book borrowed successfully"));
});

const returnBook = asyncHandler(async (req, res) => {
    const { transactionId } = req.body;
    const userId = req.user._id;

    if (!transactionId) {
        throw new ApiError(400, "Transaction ID is required");
    }

    const transaction = await Transactions.findById(transactionId);
    if (!transaction) {
        throw new ApiError(404, "Transaction not found");
    }

    if (transaction.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not the owner of this transaction");
    }

    if (transaction.transactionType === "return") {
        throw new ApiError(400, "Book already returned");
    }

    await Transactions.findByIdAndUpdate(transactionId, { transactionType: "return" });
    await Books.findByIdAndUpdate(transaction.bookId, { $inc: { availableCopies: 1 } });

    return res.status(200).json(new ApiResponse(200, null, "Book returned successfully"));
});

const getMyTransactions = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const transactions = await Transactions.find({ userId })
        .populate("bookId", "title author isbn coverImage")
        .sort({ issuedDate: -1 });

    console.log("User transactions:", transactions);

    return res.status(200).json(new ApiResponse(200, transactions, "Transactions fetched successfully"));
});

const getMyBorrows = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const activeBorrows = await Transactions.find({
        userId,
        transactionType: "borrow"
    }).populate("bookId", "title author isbn coverImage availableCopies");

    return res.status(200).json(new ApiResponse(200, activeBorrows, "Active borrows fetched successfully"));
});

const logout = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await User.findByIdAndUpdate(user._id, { refreshToken: null }, { validateBeforeSave: false });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
});

export { register, login, currentUser, borrowBook, returnBook, getMyTransactions, getMyBorrows, logout };