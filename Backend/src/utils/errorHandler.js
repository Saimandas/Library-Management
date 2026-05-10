import { ApiResponse } from "./apiResponse.js";

function errorHandler(err,req,res,next){
    console.error(err);
    const statusCode=err.statusCode || 500;
    return res.status(statusCode).json(new ApiResponse(statusCode,null,err.message || "Internal Server Error",false));
}

export { errorHandler }