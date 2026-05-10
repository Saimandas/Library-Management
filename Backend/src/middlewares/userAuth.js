import { keys } from "../constants/keys.js";
import User from '../models/userModel.js';
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokensGenerator.js";
import jwt from 'jsonwebtoken';

const checkIsLoggedIn=asyncHandler(async(req,res,next)=>{
    const accessToken=req.cookies.accessToken;
    if (!accessToken) {
        const refreshToken=req.cookies.refreshToken;
        if (!refreshToken) {
            throw new ApiError(400,"Please Login Again");
        }
        const user=await User.findOne({refreshToken});
        if (!user) {
            throw new ApiError(400,"Please Login Again");
        }
        if (user.isActive === false) {
            throw new ApiError(403,"Account is suspended");
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
        req.user=user;
        return next();
    }
    const decodedToken=jwt.verify(accessToken,keys.ACCESS_TOKEN_SECRET);
    const user=await User.findById(decodedToken._id);
    if (!user) {
        throw new ApiError(403,"User is not logged in");
    }
    if (user.isActive === false) {
        throw new ApiError(403,"Account is suspended");
    }
    req.user=user;
    return next();
})

export {checkIsLoggedIn}