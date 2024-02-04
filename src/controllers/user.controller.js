import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async(userId) =>
{
    try{
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken}

    } catch(error){
        throw new ApiError(500,"somtjing went wrong  while enerating tokens")
    }
}

const registerUser = asyncHandler ( async (req,res) => {
   
   
    // get user details from frontend
   // validation --not empty
   // check if user already exists ; username , email
   // check for images , check for avatar
   // upload them to cloudinary, avatar
   // create user object --create entry in db
   // remove passowrd and refresh token filed from res
   // check for user creation 
   // return res

    const { fullname , email , username , password } = req.body
    console.log("email",email);

    if(
        [fullname,email,username,password].some((field) => 
        field?.trim() === "")
    ) {
        throw new ApiError(400,"Allfields are required")
    }

    const existedUser = await User.findOne({
        $or : [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409,"user already exisited")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path

    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"avatar is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"someting went wronf while regstering user")
    }

    return res.status(201).json(
        new ApiResponse(200,"user registered succesfully")
    )

})

const loginUser = asyncHandler(async (req,res) => {

    const {email,username,password} = req.body

    if(!username || !email){
        throw new ApiError(400,"username or emial is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(401,"user does not exsist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(402,"invalid user creds")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens (user._id)

    const loggedInUser = await User.findById(user._id).select("-password - refreshToken")

    const options = {
        httpOnly: true,
        secure: true 
    }

    return res
    .status(200)
    .cookie("access token",accessToken,options)
    .cookie("refresh toekn",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "user logged in succesfully"
        )
    )
})


const logoutUser = asyncHandler(async(req,res) => {
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },{
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true 
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out "))
    
})

const refreshAccessToken = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401<"unauthorzied request")
    }

   try{
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401,"invalid refresh token")
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"refresh token is expired or used")
    }

    const options = {
        httpOnly:true,
        secure: true
    }

    const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshTokenefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {accessToken,newRefreshToken:
            newRefreshToken},
            "Access token refreshed"
        )
    )}
    catch(error){
        throw new ApiError(401,error?.message || "INvalide refesh token")
    }
})  

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(401,"invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})
    
    return res.status(200)
    .json(new ApiResponse(200,"passowrd changed succesfully"))


})


const getCurrentUser =asyncHandler(async(req,res) => {
    return res
    .status
    .json(200,req.user,"Current user fetched successfully")
})

const UpdateAccountDetails = asyncHandler(async(req,res) => {
    const{fullname, email} = req.body

    if(!fullname || !email){
        throw new ApiError(401,"all fields are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .staus(200)
    .json(new ApiResponse(200,user,"Account details updated succesfully"))


        
})

const updateUserAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.files?.path

    if(!avatarLocalPath){
        throw ApiError(402,"Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw ApiError(401,"error while uplaoding avatar")

    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,

        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}

    ).select("-password")

    return res
    .staus(200)
    .json(
        new ApiResponse(200,user,"avatar updated succesfuuly")
        )
})

const updateUserCoverImage = asyncHandler(async(req,res) => {
    const coverImageLocalPath = req.files?.path

    if(!coverImageLocalPathLocalPath){
        throw ApiError(402,"cover iamge file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPathLocalPath)

    if(!coverImage.url){
        throw ApiError(401,"error while uplaoding cover image")

    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,

        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}

    ).select("-password")

    return res
    .staus(200)
    .json(
        new ApiResponse(200,user,"cover image updated succesfuuly")
        )

})

const getUserChannelProfile = asyncHandler(async(req,res) => {
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(401,"Username not found")

    }

    const channel = await User.aggregate([
        {
           $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localFiled: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            lookup: {
                from: "subscriptions",
                localFiled: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields : {
                subscribersCount: {
                    $size: "subscribers"
                },
                channelsSubscribedToCount:{
                    $size: "$subscriedTo"
                },
                isSubscribed:{
                    $cond: {
                     if: { $in:[req.user?._id,"sunscribers"]}    
                }
            }
        }
    },
    {
        $project: {
            fullname: 1,
            username: 1,
            subscribersCount: 1,
            channelsSubscribedToCount: 1,
            avatar: 1,
            coverImage: 1,
            email: 1,
            isSubscribed: 1

        }
    }

    ])

    if(!channel?.length){
        throw new ApiError(404,"channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"user channel fetched succesfully")
    )
})



export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    UpdateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile
}


// USER is mongoose wala
// user is tumhara wala