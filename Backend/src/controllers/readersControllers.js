
import User from "../models/userModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokensGenerator.js";

const register=asyncHandler(async(req,res)=>{
    const {username,email,password,firstName,lastName}=req.body;
    console.log(req.body);

    if(!email || !password || !firstName || !lastName || !username){
        throw new ApiError(400,"Please provide all fields");
    }
    const existingUser=await User.findOne({email});
    if(existingUser){
        throw new ApiError(400,"User already exists");
    }
    const user=await User.create({username,email,password,firstName,lastName});
    if (!user) {
        throw new ApiError(500,"User registration failed");
    }
    return res.status(201).json(new ApiResponse(201,user,"User registered successfully"))
});

const login=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        throw new ApiError(400,"Please provide all fields");
    }
    const existingUser=await User.findOne({email});
    if(!existingUser){
        throw new ApiError(400,"User not found");
    }
    const isMatch= existingUser.password === password;
    if(!isMatch){
        throw new ApiError(400,"Invalid credentials");
    }
    const accesTokenOptions={
        httpOnly:true,
        secure:false,
         maxAge:1000*60*60

    }
    const refreshTokenOptions={
        httpOnly:true,
            secure:false,
            maxAge:1000*60*60*24*10
    }
    const accessToken=generateAccessToken(existingUser);
    const refreshToken=generateRefreshToken(existingUser);
    if (!accessToken || !refreshToken) {
        throw new ApiError(500,"Something went wrong in generating tokens");
    }
    await existingUser.updateOne({refreshToken},{validateBeforeSave:false});
    return res.status(200)
    .cookie("accessToken",accessToken,accesTokenOptions)
    .cookie("refreshToken",refreshToken,refreshTokenOptions)
    .json(new ApiResponse(200,existingUser,"User logged in successfully"));

});

const currentUser=asyncHandler(async(req,res)=>{
    const user=req.user;
    if(!user){
        throw new ApiError(404,"User not found");
    }
    return res.status(200).json(new ApiResponse(200,user,"Current user fetched successfully"));
})
const borrowBook=asyncHandler(async(req,res)=>{
    const {bookId,issueDate,returnDate}=req.body;
    const userId=req.user._id;
    if( !bookId || !issueDate || !returnDate){
        throw new ApiError(400,"Please provide all fields");
    }
    const existingBook=await Books.findById(bookId);
    if(!existingBook){
        throw new ApiError(400,"Book not found");
    }
    if(existingBook.availableCopies===0){
        throw new ApiError(400,"No copies available");
    }
    const transaction=await Transactions.create({
        userId,
        bookId,
        transactionType:"borrow",
        issueDate,
        returnDate
    });
    if(!transaction){
        throw new ApiError(500,"Something went wrong");
    }
    await existingBook.updateOne({$inc:{availableCopies:-1}});
    return res.status(200).json(new ApiResponse(200,transaction,"Book borrowed successfully"));
})

const returnBook=asyncHandler(async(req,res)=>{
    const {transactionId}=req.body;
    const userId=req.user._id;  
    const transaction=await Transactions.findById(transactionId);
    if(!transaction){
        throw new ApiError(404,"Transaction not found");
    }
    if(transaction.userId.toString()!==userId.toString()){
        throw new ApiError(403,"You are not the owner of this transaction");
    }
    await transaction.updateOne({transactionType:"return"});
    await Books.findByIdAndUpdate(transaction.bookId,{$inc:{availableCopies:1}});
    return res.status(200).json(new ApiResponse(200,null,"Book returned successfully"));
})

const logout=asyncHandler(async(req,res)=>{
    const user=req.user;
    if(!user){
        throw new ApiError(404,"User not found");
    }
    user.refreshToken=null;
    await user.save({validateBeforeSave:false});
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json(new ApiResponse(200,null,"User logged out successfully"));
})
export { register, login, borrowBook, currentUser, logout };