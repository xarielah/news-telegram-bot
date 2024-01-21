import { Schema, models, model } from "mongoose";

const categorySchema = new Schema(
  {
    userId: {
      type: Number,
      unique: true,
      required: true,
    },
    pageSize: {
      type: Number,
      default: 5,
    },
    categories: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);

export const Category = models.Category || model("Category", categorySchema);
