import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
{
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  ],

  isGroup: {
    type: Boolean,
    default: false
  },

  name: {
    type: String,
    default: null   
  },

  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null  
  },

  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  },
  avatar:{
        type:String,
        default:""
  }

},
{ timestamps: true }
);

export default mongoose.models.Chat||mongoose.model("Chat",ChatSchema);
