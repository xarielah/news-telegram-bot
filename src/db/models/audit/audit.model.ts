import { Schema, model, models } from "mongoose";

const auditSchema = new Schema(
  {
    initiator: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
    result: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Audit = models.Audit || model("Audit", auditSchema);
