import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';    

export const verifyJWT= asyncHandler(async(req,_,next)=>{

      try {
          const token= req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ","");
          if(!token){
              throw new ApiError(401,"Unauthorized request")
  
          }
  
      const decodedInformation =   jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
       console.log("decodedInformation info")      
  const user = await User.findById(decodedInformation._id).select("-password -refreshToken")
  
  if(!user){
      throw new ApiError(401,"Invalid Access Token")
  
  }
  
  req.user=user;

  next();
      } 
      catch (error) {
      throw  new ApiError(401,error?.message||"Invalid access token")
      }

      
})