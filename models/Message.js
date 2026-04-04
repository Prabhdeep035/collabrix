import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
{
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  content: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ["text", "image", "file"],
    default: "text"
  },

  // for "delete for me"
  deletedFor: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
 
  isDeleted: {
    type: Boolean,
    default: false
  },

  seenBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]

},
{ timestamps: true }
);

export default mongoose.models.Message||mongoose.model("Message",MessageSchema);
