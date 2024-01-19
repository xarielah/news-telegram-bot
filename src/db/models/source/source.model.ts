import { timeStamp } from "console";
import { Schema, model, models } from "mongoose";

const sourceSchema = new Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true,
    },
    sourceIds: {
      type: Array,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Source = models.Source || model("Source", sourceSchema);
