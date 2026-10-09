import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    branchName: { type: String, required: true, trim: true },
    branchAddress: { type: String, trim: true, default: "" },
    branchPhoneNumber: { type: String, trim: true, default: "" },
    branchEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Branch", branchSchema);