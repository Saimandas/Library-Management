import { keys } from "../constants/keys.js";
import User from "../models/userModel.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokensGenerator.js";
import jwt from 'jsonwebtoken';

const checkIsAdmin=asyncHandler(async(req,res,next)=>{
    const accessToken=req.cookies.accessToken;
    if (!accessToken) {
        const refreshToken=req.cookies.refreshToken;
        const user=await User.findOne({refreshToken});
        if (!user?.isAdmin) {
            throw new ApiError(403,"Only admin can access this route");
        }
        if (!refreshToken || !user) {
            throw new ApiError(400,"Please Login Again");
        }
        const newRefreshToken=generateRefreshToken(user);
        const newAccessToken=generateAccessToken(user);
        user.refreshToken=newRefreshToken;
        await user.save({validateBeforeSave:false});
        res.cookie("refreshToken",newRefreshToken,{
            httpOnly:true,
            secure:false,
            maxAge:1000*60*60*24*10
        });
        res.cookie("accessToken",newAccessToken,{
            httpOnly:true,
            secure:false,
            maxAge:1000*60*60
        });
        req.admin=user;
         next();
         return;
    }
    const decodedToken=jwt.verify(accessToken,keys.ACCESS_TOKEN_SECRET);
    const user=await User.findById(decodedToken._id);
    console.log("decoded User",user);
    
    if (!user || user.isAdmin===false) {
        throw new ApiError(403,"Only admin can access this route");
    }
    req.admin=user;
    next();
     return;
})

export {checkIsAdmin}