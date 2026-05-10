import jwt from 'jsonwebtoken'
import {keys} from '../constants/keys.js'
function generateAccessToken(user){
    const email=user.email;
    const _id=user._id.toString();
    const obj={
        email,
        _id
    };
    return jwt.sign(
        obj,
        keys.ACCESS_TOKEN_SECRET,
        { expiresIn: keys.ACCESS_TOKEN_EXPIRY }
    );
}
function generateRefreshToken(user){
    const email=user.email;
    const _id=user._id.toString();
    console.log(email,_id);
    const obj={
        email,
        _id
    };
    return jwt.sign(
        obj,
        keys.REFRESH_TOKEN_SECRET,
        { expiresIn: keys.REFRESH_TOKEN_EXPIRY }
    );
}
export {generateAccessToken,generateRefreshToken}