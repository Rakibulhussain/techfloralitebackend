const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    // adding this field to differentiate between event and gallery media 
    // this will help in filtering the media based on the display type like if it is for event or gallery
    // this will be used in the frontend to display the media in the respective sections
   
    displayIn:{
      type: String,
      enum:["Event","Gallery"],
      default:"Gallery"
    },

    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    mediaUrl: {
      type: String,
      required: true,
    },

    thumbnailUrl: {
      type: String,
      default: "",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    uploadedByName: {
      type: String,
    },

    imageFileId: String,
    fileId: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Gallery", gallerySchema);