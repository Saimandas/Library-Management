import Books from "../models/booksModel.js";
import Category from "../models/categoryModel.js";
import User from "../models/userModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokensGenerator.js";

const addBook = asyncHandler(async (req, res) => {
    const {
        title,
        author,
        category,
        totalCopies,
        edition,
        isbn,
        publishedYear,
        publisher
    } = req.body;

    if (!title) throw new ApiError(400, "Title is required");
    if (!author) throw new ApiError(400, "Author is required");
    if (!category) throw new ApiError(400, "Category is required");
    if (!totalCopies) throw new ApiError(400, "Total copies required");
    if (!edition) throw new ApiError(400, "Edition is required");
    if (!isbn) throw new ApiError(400, "ISBN is required");
    if (!publishedYear) throw new ApiError(400, "Published year required");
    if (!publisher) throw new ApiError(400, "Publisher is required");

    const newBook = await Books.create({
        title,
        author,
        totalCopies,
        availableCopies: totalCopies,
        edition,
        isbn,
        publishedYear,
        publisher
    });

    const existingCategory = await Category.findOne({ name: category });

    if (!existingCategory) {
        const newCategory = await Category.create({ name: category });
        newBook.category = newCategory._id;
    } else {
        newBook.category = existingCategory._id;
    }

    const savedBook = await newBook.save();

    if (!savedBook) {
        throw new ApiError(500, "something went wrong in adding the book");
    }

    return res.status(201).json(
        new ApiResponse(201, savedBook, "book added successfully")
    );
});

const getCategoryList=asyncHandler(async(req,res)=>{
    const categories=await Category.find();
    if (!categories) {
        throw new ApiError(404,"no categories found");
    }
    return res.status(200).json(new ApiResponse(200,categories,"categories fetched successfully"));
})
const totalBooks=asyncHandler(async(req,res)=>{
    const total=await Books.countDocuments();
    return res.status(200).json(new ApiResponse(200,total,"total books fetched successfully"));
})

const totalUsers=asyncHandler(async(req,res)=>{
    const total=await User.countDocuments({isAdmin: { $ne: true } });
    return res.status(200).json(new ApiResponse(200,total,"total users fetched successfully"));
})

const getCurrentAdmin=asyncHandler(async(req,res)=>{
    const admin=req.admin;
    if (!admin) {
        throw new ApiError(404,"admin not found");
    }
    return res.status(200).json(new ApiResponse(200,admin,"current admin fetched successfully"));
})

const logout=asyncHandler(async(req,res)=>{
    const admin=req.admin;
    if (!admin) {
        throw new ApiError(404,"admin not found");
    }
    admin.refreshToken=null;
    await admin.save({validateBeforeSave:false});
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json(new ApiResponse(200,null,"admin logged out successfully"));
})

const getUsers=asyncHandler(async(req,res)=>{
    const users=await User.find({ isAdmin: { $ne: true } });
    if (!users) {
        throw new ApiError(404,"no users found");
    }
    return res.status(200).json(new ApiResponse(200,users,"users fetched successfully"));
})

const getBooks=asyncHandler(async(req,res)=>{
    const books=await Books.find().populate("category");
    if (!books) {
        throw new ApiError(404,"no books found");
    }
    return res.status(200).json(new ApiResponse(200,books,"books fetched successfully"));
})

export {addBook,getCategoryList,totalBooks,totalUsers,getCurrentAdmin,logout,getUsers,getBooks}