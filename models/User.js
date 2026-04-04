import mongoose from "mongoose";

const UserSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true,
        minlength:2
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    avatar:{
        type:String,
        default:""
    },
    createdAt:{
        type:Date,
        default:Date.now,
    }
},{timestamps:true})

export default mongoose.models.User||mongoose.model("User",UserSchema);
