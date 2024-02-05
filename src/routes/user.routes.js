 import { Router } from "express";
import { loginUser,
         logoutUser, 
         registerUser,
         refreshAccessToken, 
         changeCurrentPassword, 
         getCurrentUser, 
         UpdateAccountDetails, 
         updateUserAvatar, 
         updateUserCoverImage, 
         getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";


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
router.route("change-password").post(verifyJWT,changeCurrentPassword)
router.route("/cuurent-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,UpdateAccountDetails)

router.route("/avatar").patch(verifyJWT,upload.single
("avatar"),updateUserAvatar)
router.route("/cover-iamge").patch(verifyJWT,upload.
    single("coverImage"),updateUserCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)


export default Router; 

// s