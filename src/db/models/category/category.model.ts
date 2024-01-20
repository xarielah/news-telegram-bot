import { Schema, models, model } from "mongoose";

const categorySchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    categories: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);

export const Category = models.Category || model("Category", categorySchema);
