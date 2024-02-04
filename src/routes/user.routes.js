 import { Router } from "express";
const Router = require("express").Router();
import { loginUser, logoutUser, registerUser,refreshAccessToken } from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()


// ye tph tune bola abhi router.require ..ok

router.post("/new", async(req,res) => {
   
        const {newBook} = req.body;
        // await console.log(newBook); 
        return res.json({message: "book was added!!"});
    
});

router.get("/",  (req, res)=>{
    return res.json({message: "celina"});

})


// router.route("/register").post(
//     upload.fields([
//         {
//             name: "avatar",
//             maxCount: 1
//         },
//         {
//             name: "coverImage",
//             maxCount: 1
//         } 
//     ]),
//     registerUser
//     )

    // yaha se post hua tha 

router.route("/login").post(loginUser)

// secured routes

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default Router; 

