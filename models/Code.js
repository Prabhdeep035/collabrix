import mongoose from "mongoose";

const CodeSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true
    },

    language: {
      type: String,
      required: true
    },

    code: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

CodeSchema.index({ chatId: 1, language: 1 }, { unique: true });

export default mongoose.models.Code ||
  mongoose.model("Code", CodeSchema);