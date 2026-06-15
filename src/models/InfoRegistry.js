const mongoose = require("mongoose");

const infoRegistrySchema = new mongoose.Schema(
  {
    // 🔥 Discriminator Type Key: Pata lagane ke liye ki ye News hai ya Job
    contentType: {
      type: String,
      required: true,
      enum: ["News", "Job"],
    },

    // ==========================================
    // 1. News & Announcements Fields
    // ==========================================
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      required: function () {
        return this.contentType === "News"; // Sirf News hone par required hoga
      },
    },
    description: {
      type: String,
      trim: true,
      required: function () {
        return this.contentType === "News"; // Sirf News hone par required hoga
      },
    },
    timelineDate: {
      type: String,
      trim: true,
      placeholder: "e.g., January 2026",
      required: function () {
        return this.contentType === "News"; // Sirf News hone par required hoga
      },
    },
    status: {
      type: String,
      enum: ["Active", "Archived", "Draft"],
      default: "Active",
    },

    // ==========================================
    // 2. Current Openings (Jobs) Fields
    // ==========================================
    designation: {
      type: String,
      trim: true,
      required: function () {
        return this.contentType === "Job"; // Sirf Job opening hone par required hoga
      },
    },
    noOfOpenings: {
      type: Number,
      min: [0, "Openings cannot be negative"],
      default: 0,
      required: function () {
        return this.contentType === "Job"; // Sirf Job opening hone par required hoga
      },
    },
    department: {
      type: String,
      trim: true,
      default: "General Operations", // e.g., HR, Sales, Technology
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ==========================================
    // Common System Tracking Properties
    // ==========================================
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  
  { timestamps: true }
);

// Database indexing query speed optimize karne ke liye
infoRegistrySchema.index({ contentType: 1 });

module.exports = mongoose.model("InfoRegistry", infoRegistrySchema);