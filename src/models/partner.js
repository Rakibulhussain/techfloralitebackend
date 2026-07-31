const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    partnerName: {
      type: String,
      required: [true, "Partner name is required"],
      trim: true,
    },
    partnerType: {
      type: String,
      enum: ["Vendor", "Supplier", "Affiliate", "Other"],
      default: "Vendor",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    partnerPhoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    partnerWebsite: {
      type: String,
      trim: true,
      default: "",
    },
    partnerAddress: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Partner", partnerSchema);