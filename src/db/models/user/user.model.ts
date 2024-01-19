import mongoose, { Schema, model } from "mongoose";

const registeredUserSchema = new Schema(
  {
    active: {
      type: Boolean,
      default: true,
    },
    chatId: {
      type: Number,
      required: true,
    },
    username: {
      type: String,
      required: false,
    },
    userId: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const RegisteredUser =
  mongoose.models.RegisteredUser ||
  model("RegisteredUser", registeredUserSchema);
