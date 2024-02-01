import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"

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

    const existedUser = User.findOne({
        $or : [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409,"user already exisited")
    }

    
})

export {
    registerUser,
}
