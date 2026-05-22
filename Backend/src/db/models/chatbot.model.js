import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["user", "model"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const chatSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Chat = mongoose.model("Chat", chatSchema);
