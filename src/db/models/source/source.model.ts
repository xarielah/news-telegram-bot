import { timeStamp } from "console";
import { Schema, model, models } from "mongoose";

const sourceSchema = new Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true,
    },
    sources: {
      type: Array,
      required: true,
    },
    pageSize: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

export const Source = models.Source || model("Source", sourceSchema);
