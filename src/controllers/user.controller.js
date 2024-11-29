 import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudnary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

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

    User.findByIdAndUpdate(req.user._id,
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

    export { registerUser , loginUser , logoutUser } ;