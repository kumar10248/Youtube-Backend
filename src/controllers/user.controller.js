 import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

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
const userExist = User.findOne({
    $or:[{ username },{ email }]
})

if(userExist){
    throw new ApiError(409," User with email or username already exist")
}

const avatarLocalPath= req.files?.avatar[0]?.path;
const coverImageLocalPath= req.files?.coverImage[0]?.path;

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

    export { registerUser };