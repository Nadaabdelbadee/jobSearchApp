import mongoose from "mongoose";
import { status } from "../../enums/enums.js";

const chatSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        message: { type: String, required: true },
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const chatModel = mongoose.model.Chat || mongoose.model("Chat", chatSchema);

export default chatModel;
