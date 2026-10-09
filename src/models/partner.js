const mongoose = require("mongoose");



const partnerSchema = new mongoose.Schema(
  {
    // Partner Basic Information
    partnerName: {
      type: String,
      required: [true, "Partner name is required"],
      trim: true,
      index: true,
    },
    partnerType: {
      type: String,
      required: [true, "Partner type is required"],
      trim: true,
      enum: {
        values: ["Vendor", "Supplier", "Affiliate", "Distributor", "Other"],
        message: "{VALUE} is not a valid partner type",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    partnerPhoneNumber: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]*$/, "Please fill a valid phone number"],
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
    partnerLogoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending"],
      default: "Active",
    },

  },
  {
    timestamps: true,
  }
);

partnerSchema.index({ partnerName: 1, partnerType: 1 });

module.exports = mongoose.model("Partner", partnerSchema);