// import { Router } from "express";
const Router = require("express").Router();
import { registerUser } from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js"

// const router = Router()


// ye tph tune bola abhi router.require ..ok

Router.post("/new", async(req,res) => {
   
        const {newBook} = req.body;
        // await console.log(newBook); 
        return res.json({message: "book was added!!"});
    
});

Router.get("/",  (req, res)=>{
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


export default Router; 

