import Books from "../models/booksModel.js";
import Downloads from "../models/downloadsModel.js";
import User from "../models/userModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokensGenerator.js";
import { sendEmail } from "../utils/nodemailer.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const register = asyncHandler(async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
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
        lastName,
        isApproved: false
    });

    return res.status(201).json(new ApiResponse(201, user, "Registration successful. Await admin approval."));
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

    if (!existingUser.isApproved) {
        throw new ApiError(403, "Account pending admin approval");
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

const getMyDownloads = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const downloads = await Downloads.find({ userId })
        .populate("bookId", "title author coverImage pdfFile")
        .sort({ downloadedAt: -1 });

    return res.status(200).json(new ApiResponse(200, downloads, "Downloads fetched successfully"));
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

const getBooks = asyncHandler(async (req, res) => {
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

    const skip = (page - 1) * limit;

    const books = await Books.find(query)
        .populate("category", "name")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ title: 1 });

    const total = await Books.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, { books, total, page: parseInt(page), pages: Math.ceil(total / limit) }, "Books fetched successfully"));
});

const getBookById = asyncHandler(async (req, res) => {
    const book = await Books.findById(req.params.id).populate("category", "name");
    if (!book) {
        throw new ApiError(404, "Book not found");
    }
    return res.status(200).json(new ApiResponse(200, book, "Book fetched successfully"));
});

const readBook = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const book = await Books.findById(id);
    if (!book) {
        throw new ApiError(404, "Book not found");
    }

    if (!book.pdfFile) {
        throw new ApiError(404, "PDF not available for this book");
    }

    const pdfPath = path.join(__dirname, '..', '..', 'uploads', 'pdfs', book.pdfFile);

    if (!fs.existsSync(pdfPath)) {
        throw new ApiError(404, "PDF file not found on server");
    }

    const fileBuffer = fs.readFileSync(pdfPath);
    res.set("Content-Type", "application/pdf");
    res.set("Content-Length", fileBuffer.length);
    res.set("Content-Disposition", "inline");
    res.status(200).send(fileBuffer);
});

const downloadBook = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const book = await Books.findById(id);
    if (!book) {
        throw new ApiError(404, "Book not found");
    }

    if (!book.pdfFile) {
        throw new ApiError(404, "PDF not available for this book");
    }

    const pdfPath = path.join(__dirname, '..', '..', 'uploads', 'pdfs', book.pdfFile);

    if (!fs.existsSync(pdfPath)) {
        throw new ApiError(404, "PDF file not found on server");
    }

    await Downloads.create({ userId, bookId: id });

    const filename = `${book.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    res.download(pdfPath, filename);
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email, isAdmin: { $ne: true } });
    if (!user) {
        return res.status(200).json(new ApiResponse(200, null, "If the email exists, a reset link has been sent"));
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Use this link: ${resetUrl}. Expires in 1 hour.`,
        html: `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset your password. Expires in 1 hour.</p>`
    });

    return res.status(200).json(new ApiResponse(200, null, "If the email exists, a reset link has been sent"));
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
        isAdmin: { $ne: true }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired reset token");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json(new ApiResponse(200, null, "Password reset successfully"));
});

export {
    register, login, currentUser, getMyDownloads, logout,
    getBooks, getBookById, readBook, downloadBook,
    forgotPassword, resetPassword
};
