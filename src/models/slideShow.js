const mongoose = require("mongoose");

const slideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    imageFileId: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
      default: 5,
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Slide", slideSchema);