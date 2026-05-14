import Books from "../models/booksModel.js";
import Category from "../models/categoryModel.js";
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

const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const admin = await User.findOne({ email, isAdmin: true });
    if (!admin) {
        throw new ApiError(401, "Invalid admin credentials");
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid admin credentials");
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

    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);

    if (!accessToken || !refreshToken) {
        throw new ApiError(500, "Token generation failed");
    }

    await User.findByIdAndUpdate(admin._id, { refreshToken }, { validateBeforeSave: false });

    return res.status(200)
        .cookie("accessToken", accessToken, accesTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(new ApiResponse(200, admin, "Admin logged in successfully"));
});

const addBook = asyncHandler(async (req, res) => {
    const {
        title, author, category, edition, isbn, publishedYear, publisher, coverImage, description, pages
    } = req.body;

    if (!title) throw new ApiError(400, "Title is required");
    if (!author) throw new ApiError(400, "Author is required");
    if (!category) throw new ApiError(400, "Category is required");
    if (!edition) throw new ApiError(400, "Edition is required");
    if (!publishedYear) throw new ApiError(400, "Published year required");
    if (!publisher) throw new ApiError(400, "Publisher is required");

    const newBook = new Books({
        title, author, edition, isbn, publishedYear, publisher, coverImage, description, pages
    });

    if (req.file) {
        newBook.pdfFile = req.file.filename;
        newBook.fileSize = req.file.size;
    }

    const existingCategory = await Category.findOne({ name: category });
    if (!existingCategory) {
        const newCategory = await Category.create({ name: category });
        newBook.category = newCategory._id;
    } else {
        newBook.category = existingCategory._id;
    }

    const savedBook = await newBook.save();
    if (!savedBook) {
        throw new ApiError(500, "Failed to add book");
    }

    const populatedBook = await Books.findById(savedBook._id).populate("category");

    return res.status(201).json(new ApiResponse(201, populatedBook, "Book added successfully"));
});

const updateBook = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        title, author, category, edition, isbn, publishedYear, publisher, coverImage, description, pages
    } = req.body;

    const book = await Books.findById(id);
    if (!book) {
        throw new ApiError(404, "Book not found");
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (edition) book.edition = edition;
    if (isbn) book.isbn = isbn;
    if (publishedYear) book.publishedYear = publishedYear;
    if (publisher) book.publisher = publisher;
    if (coverImage) book.coverImage = coverImage;
    if (description) book.description = description;
    if (pages) book.pages = pages;

    if (req.file) {
        if (book.pdfFile) {
            const oldPdfPath = path.join(__dirname, '..', '..', 'uploads', 'pdfs', book.pdfFile);
            if (fs.existsSync(oldPdfPath)) {
                fs.unlinkSync(oldPdfPath);
            }
        }
        book.pdfFile = req.file.filename;
        book.fileSize = req.file.size;
    }

    if (category) {
        const existingCategory = await Category.findOne({ name: category });
        if (!existingCategory) {
            const newCategory = await Category.create({ name: category });
            book.category = newCategory._id;
        } else {
            book.category = existingCategory._id;
        }
    }

    await book.save();

    const updatedBook = await Books.findById(id).populate("category", "name");
    return res.status(200).json(new ApiResponse(200, updatedBook, "Book updated successfully"));
});

const deleteBook = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const book = await Books.findById(id);
    if (!book) {
        throw new ApiError(404, "Book not found");
    }

    if (book.pdfFile) {
        const pdfPath = path.join(__dirname, '..', '..', 'uploads', 'pdfs', book.pdfFile);
        if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
        }
    }

    await Books.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, null, "Book deleted successfully"));
});

const getCategoryList = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ name: 1 });
    if (!categories) {
        throw new ApiError(404, "No categories found");
    }
    return res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

const getCurrentAdmin = asyncHandler(async (req, res) => {
    const admin = req.admin;
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }
    return res.status(200).json(new ApiResponse(200, admin, "Current admin fetched"));
});

const getUsers = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 10 } = req.query;

    const query = { isAdmin: { $ne: true } };

    if (search) {
        query.$or = [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } }
        ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
        .select("-password -refreshToken")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, { users, total, page: parseInt(page), pages: Math.ceil(total / limit) }, "Users fetched successfully"));
});

const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const downloads = await Downloads.find({ userId: id })
        .populate("bookId", "title author")
        .sort({ downloadedAt: -1 });

    return res.status(200).json(new ApiResponse(200, { user, downloads }, "User fetched successfully"));
});

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, username, email } = req.body;

    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    const updatedUser = await User.findById(id).select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await User.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

const toggleUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json(new ApiResponse(200, user, "User status updated"));
});

const getBooks = asyncHandler(async (req, res) => {
    const { search, category, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { author: { $regex: search, $options: "i" } },
            { isbn: { $regex: search, $options: "i" } }
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
        .sort({ createdAt: -1 });

    const total = await Books.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, { books, total, page: parseInt(page), pages: Math.ceil(total / limit) }, "Books fetched successfully"));
});

const getBookById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const book = await Books.findById(id).populate("category", "name");
    if (!book) {
        throw new ApiError(404, "Book not found");
    }

    return res.status(200).json(new ApiResponse(200, book, "Book fetched successfully"));
});

const addCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        throw new ApiError(400, "Category name is required");
    }

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existing) {
        throw new ApiError(400, "Category already exists");
    }

    const category = await Category.create({ name });
    return res.status(201).json(new ApiResponse(201, category, "Category added successfully"));
});

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    const booksInCategory = await Books.countDocuments({ category: id });
    if (booksInCategory > 0) {
        throw new ApiError(400, "Cannot delete category with books");
    }

    await Category.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, null, "Category deleted successfully"));
});

const logout = asyncHandler(async (req, res) => {
    const admin = req.admin;
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    await User.findByIdAndUpdate(admin._id, { refreshToken: null }, { validateBeforeSave: false });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json(new ApiResponse(200, null, "Admin logged out successfully"));
});

const getPendingUsers = asyncHandler(async (req, res) => {
    const pending = await User.find({ isAdmin: { $ne: true }, isApproved: false })
        .select("-password -refreshToken")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, pending, "Pending users fetched"));
});

const approveUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { approved } = req.body;

    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (approved) {
        user.isApproved = true;
        user.approvalDate = new Date();
        user.isActive = true;
    }

    await user.save();

    const status = approved ? "approved" : "rejected";

    await sendEmail({
        to: user.email,
        subject: `Account ${status}`,
        text: `Your account has been ${status}. You can now login.`,
        html: `<p>Your account has been <strong>${status}</strong>. You can now login.</p>`
    });

    return res.status(200).json(new ApiResponse(200, user, `User ${status} successfully`));
});

const getDashboardStats = asyncHandler(async (req, res) => {
    const totalBooks = await Books.countDocuments();
    const totalUsers = await User.countDocuments({ isAdmin: { $ne: true } });
    const totalDownloads = await Downloads.countDocuments();
    const pendingApprovals = await User.countDocuments({ isAdmin: { $ne: true }, isApproved: false });

    return res.status(200).json(new ApiResponse(200, {
        totalBooks, totalUsers, totalDownloads, pendingApprovals
    }, "Stats fetched"));
});

const getRecentDownloads = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const downloads = await Downloads.find()
        .populate("userId", "username email firstName lastName")
        .populate("bookId", "title author")
        .sort({ downloadedAt: -1 })
        .limit(parseInt(limit));

    return res.status(200).json(new ApiResponse(200, downloads, "Recent downloads fetched"));
});

const getAllDownloads = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const downloads = await Downloads.find()
        .populate("userId", "username email")
        .populate("bookId", "title author")
        .sort({ downloadedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Downloads.countDocuments();

    return res.status(200).json(new ApiResponse(200, { downloads, total, page: parseInt(page), pages: Math.ceil(total / limit) }, "Downloads fetched"));
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const admin = await User.findOne({ email, isAdmin: true });
    if (!admin) {
        return res.status(200).json(new ApiResponse(200, null, "If the email exists, a reset link has been sent"));
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpires = Date.now() + 3600000;
    await admin.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
        to: admin.email,
        subject: "Admin Password Reset Request",
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

    const admin = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
        isAdmin: true
    });

    if (!admin) {
        throw new ApiError(400, "Invalid or expired reset token");
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    return res.status(200).json(new ApiResponse(200, null, "Password reset successfully"));
});

export {
    adminLogin, addBook, updateBook, deleteBook,
    getCategoryList, getCurrentAdmin,
    getUsers, getUserById, updateUser, deleteUser, toggleUserStatus,
    getBooks, getBookById,
    addCategory, deleteCategory,
    logout, getPendingUsers, approveUser, getDashboardStats,
    getRecentDownloads, getAllDownloads,
    forgotPassword, resetPassword
};
