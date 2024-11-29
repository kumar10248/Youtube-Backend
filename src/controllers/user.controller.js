 import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudnary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens= async(userId)=>{

    try{
        const user= await User.findById(userId);
        const accessToken= user.generateAccessToken();
        const refreshToken= user.generateRefreshToken();

        user.refreshToken=refreshToken;
        await user.save({ validateBeforeSave: false });

        return {accessToken,refreshToken}

    }catch(error){
        throw new ApiError(500,"Something went wrong while generating tokens")
    }
}

 const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({meassage: "ok"});

// get user details from frontend
// validation - not empty
//check if user already exists: email, username
//check for images, check for avatar
// upload them to cloudinary, avatar, coverImage
//create user object  - create entry in db
// remove password and refreshToken fields from the response
//check for user creation
//send response to frontend

const {fullName,email,username,password }=req.body
console.log("email: ",email);

if(
    [fullName,email,username,password].some((field)=>
        field?.trim()==="" )
){
    throw new ApiError(400,"All fields are required !")

}
const userExist = await User.findOne({
    $or:[{ username },{ email }]
})

if(userExist){
    throw new ApiError(409," User with email or username already exist")
}
console.log(req.files)
const avatarLocalPath= req.files?.avatar[0]?.path;
// const coverImageLocalPath= req.files?.coverImage[0]?.path;

let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    coverImageLocalPath=req.files.coverImage[0].path;
}

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar is required")
}

const avatar= await uploadOnCloudinary(avatarLocalPath);
const coverImage= await uploadOnCloudinary(coverImageLocalPath);

if(!avatar){
    throw new ApiError(400,"avatar file is required");

}

const user = await User.create({
    fullName,
    email,
    username:username.toLowerCase(),
    password,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",
})

const userCreated = await User.findById(user._id).select("-password -refreshToken");

if(!userCreated){
    throw new ApiError(500,"Something went wrong while registering the user")  
}

res.status(201).json(
    new ApiResponse(200,userCreated,"User registered successfully" )
);

 });

 const loginUser= asyncHandler(async(req,res)=>{
//req body -data
//username or email
// find user
//check password
//generate jwt token-access token, refresh token
//send cookies to frontend
const {username,email,password}=req.body;

if(!(username || email)){
    throw new ApiError(400,"Username or email is required")
}

const user= await User.findOne({
    $or:[{username},{email}]
})

if(!user){
    throw new ApiError(404,"User not found")    
}

const isPasswordValid = await user.isPasswordCorrect(password);

if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials")
}

const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

const options ={
    httpOnly:true,
    secure:true

}

return res.status(200)
.cookie("accessToken", accessToken,options)
.cookie("refreshToken", refreshToken,options)
.json(
    new ApiResponse(
        200,
        {
            user:loggedInUser,accessToken,refreshToken
        },
        "User logged In successfully"
    )
)

 })

const logoutUser = asyncHandler(async(req,res)=>{
    console.log("logout")
   await User.findByIdAndUpdate(req.user._id,
        {
       $unset:{
        refreshToken:1
       }

    },
    {
        new:true
    
    }
    )
    const options ={
        httpOnly:true,
        secure:true
    
    }

    return res.status(200)  
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully")
)
})

const refreshAccessToken= asyncHandler(async(req,res)=>{
const incomingRefreshToken= req.cookies.refreshToken||req.body.refreshToken;

if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request")

}

try {
    const decodedToken = jwt.verify(
        incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET,
    
    )
    
    const user= await User.findById(decodedToken?._id);
    
    if(!user){
        throw new ApiError(401,"Invalid refresh token")
    
    }
    
    if(incomingRefreshToken!==user?.refreshToken){
        throw new ApiError(401,"Refresh token is expired or used")
    
    }
    
    const options ={
        httpOnly:true,
        secure:true
    }
    
    const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
    
    return res
    .status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken", newRefreshToken,options)
    .json(
        new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"access Token refreshed successfully")
    )
    
} catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh token")
    
}

})

const changeCurrentPassword= asyncHandler(async(req,res)=>{
const {oldPassword,newPassword}=req.body;
const user=await User.findById(req.user._id) ;


if(!user){
    throw new ApiError(404,"User not found")
}

const isPasswordValid = await user.isPasswordCorrect(oldPassword);  

if(!isPasswordValid){
    throw new ApiError(401,"Invalid current password")  
}

user.password=newPassword;
await user.save({ validateBeforeSave: false });

return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))
    
})

const currentUser= asyncHandler(async(req,res)=>{
return res
.status(200)
.json(new ApiResponse(200,req.user,"User details fetched successfully"))  


})

const updateAccountDetails= asyncHandler(async(req,res)=>{

    const {fullName,email}=req.body;

    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }
    
    const user= await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {
            new:true,
     
        }
    ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200,user,"User details updated successfully")) 
})

const updateUserAvatar= asyncHandler(async(req,res)=>{
    const avatarLocalPath= req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

const avatar= await uploadOnCloudinary(avatarLocalPath);

if(!avatar.url){
    throw new ApiError(400,"Error while uploading avatar file");
}

const user = await User.findByIdAndUpdate(req.user?._id,
    {
        $set:{
            avatar:avatar.url
        }
    },
    {
        new:true
    }
).select("-password")   

return res
.status(200)
.json(new ApiResponse(200,user,"Avatar updated successfully"))

})

const updateUserCoverImage= asyncHandler(async(req,res)=>{
    const coverLocalPath= req.file?.path;
    if(!coverLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

const cover= await uploadOnCloudinary(coverLocalPath);

if(!cover.url){
    throw new ApiError(400,"Error while uploading cover file");
}

const user = await User.findByIdAndUpdate(req.user?._id,
    {
        $set:{
            coverImage:cover.url
        }
    },
    {
        new:true
    }
).select("-password")   

return res
.status(200)
.json(new ApiResponse(200,user,"Cover image updated successfully"))

})

const getUserChannelProfile= asyncHandler(async(req,res)=>{

    const {username}=req.params;
    if(!username){
        throw new ApiError(400,"Username is missing")

    }

  const channel =   await User.aggregate([

        {
            $match:{
                username:username?.toLowerCase()
            }


        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo" 
            }
        },
        {
            $addFields:{
                subscriberCount:{$size:"$subscribers"},
                channelSubscribedToCount:{$size:"$subscribedTo"},
                isSubscribed:{

                   $cond:{
                    if:{ $in:[req.user?._id,"$subscribers.subscriber"]},
                    then:true,
                    else:false

                   }
                }

            }
        },

        {
            $project:{
               fullName:1,
                username:1,
                avatar:1,
                coverImage:1,
                subscriberCount:1,
                channelSubscribedToCount:1,
                isSubscribed:1

            }
        }

    ])

    if(!channel?.length){   
        throw new ApiError(404,"Channel not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,channel[0],"User Channel fetched successfully"))
})

    export { registerUser ,
             loginUser ,
             logoutUser, 
             refreshAccessToken,
             changeCurrentPassword,
             currentUser,
             updateAccountDetails,
             updateUserAvatar,
             updateUserCoverImage,
             getUserChannelProfile
        }; 