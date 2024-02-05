import mongoose, {Schema} from "mongoose";

const tweetSchema = new Schema({
    content:{
        type:String,
        required:True
    },
    owner:{
        type: Schema.Types.ObjectId,  //this is a reference to the user model.ty
        ref:"User"
    }

},{
    timestamps: true // Saves createdAt and updatedAt as dates. Creates them

})

export const Tweet = mongoose.model("tweet",tweetSchema)