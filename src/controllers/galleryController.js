const User = require("../models/User");
const Gallery = require("../models/Gallery");
const imagekit = require("../config/imagekit");

/* ==========================================================
UPLOAD IMAGE
========================================================== */
const uploadGalleryImage = async (req, res) => {
  try {
    const { title, category, description, displayIn } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const uploadedImage = await imagekit.upload({
      file: req.file.buffer,
      fileName: `gallery-${Date.now()}-${req.file.originalname}`,
      folder: "/techfloraGallery/gallery",
      useUniqueFileName: true,
    });

    const gallery = await Gallery.create({
      title,
      category,
      description,
      displayIn: displayIn || "Gallery",
      mediaType: "image",
      mediaUrl: uploadedImage.url,
      fileId: uploadedImage.fileId,
      uploadedBy: user._id,
      uploadedByName: user.name,
    });

    return res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      gallery,
    });
  } catch (error) {
    console.error("Image Upload Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
UPLOAD VIDEO (FIXED: Added displayIn field save)
========================================================== */
const uploadGalleryVideo = async (req, res) => {
  try {
    const { title, category, description, displayIn } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video is required",
      });
    }

    if (!req.file.mimetype.startsWith("video/")) {
      return res.status(400).json({
        success: false,
        message: "Only video files are allowed",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const uploadedVideo = await imagekit.upload({
      file: req.file.buffer,
      fileName: `video-${Date.now()}-${req.file.originalname}`,
      folder: "/techfloraGallery/video",
      useUniqueFileName: true,
    });

    // FIXED: Save displayIn parameter
    const gallery = await Gallery.create({
      title,
      category,
      description,
      displayIn: displayIn || "Gallery",
      mediaType: "video",
      mediaUrl: uploadedVideo.url,
      fileId: uploadedVideo.fileId,
      thumbnailUrl: uploadedVideo.thumbnailUrl || "",
      uploadedBy: user._id,
      uploadedByName: user.name,
    });

    return res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      gallery,
    });
  } catch (error) {
    console.error("Video Upload Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
UPDATE GALLERY ITEM
========================================================== */
const updateGalleryMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, displayIn } = req.body;

    const gallery = await Gallery.findById(id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    if (title) gallery.title = title;
    if (category) gallery.category = category;

    if (displayIn && ["Event", "Gallery"].includes(displayIn)) {
      gallery.displayIn = displayIn;
    }

    if (description !== undefined) {
      gallery.description = description;
    }

    if (req.file) {
      if (gallery.fileId) {
        try {
          await imagekit.deleteFile(gallery.fileId);
        } catch (err) {
          console.log("Old file delete failed:", err.message);
        }
      }

      const uploadedFile = await imagekit.upload({
        file: req.file.buffer,
        fileName: `${Date.now()}-${req.file.originalname}`,
        folder:
          gallery.mediaType === "image"
            ? "/techfloraGallery/gallery"
            : "/techfloraGallery/video",
        useUniqueFileName: true,
      });

      gallery.mediaUrl = uploadedFile.url;
      gallery.fileId = uploadedFile.fileId;

      if (gallery.mediaType === "video") {
        gallery.thumbnailUrl = uploadedFile.thumbnailUrl || "";
      }
    }

    await gallery.save();

    return res.status(200).json({
      success: true,
      message: "Gallery updated successfully",
      gallery,
    });
  } catch (error) {
    console.error("Update Gallery Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
GET IMAGES ONLY (With Full Pagination & Fallback Filter)
========================================================== */
const getGalleryImages = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 16);
    const { displayIn } = req.query;

    const filter = { mediaType: "image" };
    
    // Allows matching exact category OR legacy items without explicit displayIn field
    if (displayIn) {
      filter.$or = [
        { displayIn: displayIn },
        { displayIn: { $exists: false } },
      ];
    }

    const skip = (page - 1) * limit;

    const [images, totalCount] = await Promise.all([
      Gallery.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Gallery.countDocuments(filter),
    ]);

    const hasMore = skip + images.length < totalCount;

    return res.status(200).json({
      success: true,
      total: totalCount,
      hasMore,
      images,
    });
  } catch (error) {
    console.error("Get Images Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
GET VIDEOS ONLY (FIXED: Added Full Pagination & Skip)
========================================================== */
const getGalleryVideos = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 5);
    const { displayIn } = req.query;

    const filter = { mediaType: "video" };

    if (displayIn) {
      filter.$or = [
        { displayIn: displayIn },
        { displayIn: { $exists: false } },
      ];
    }

    const skip = (page - 1) * limit;

    const [videos, totalCount] = await Promise.all([
      Gallery.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Gallery.countDocuments(filter),
    ]);

    const hasMore = skip + videos.length < totalCount;

    return res.status(200).json({
      success: true,
      total: totalCount,
      hasMore,
      videos,
    });
  } catch (error) {
    console.error("Get Videos Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
GET ALL GALLERY ITEMS
========================================================== */
const getAllGallery = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;

    const gallery = await Gallery.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      total: gallery.length,
      gallery,
    });
  } catch (error) {
    console.error("Get Gallery Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
DELETE GALLERY ITEM
========================================================== */
const deleteGalleryMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const gallery = await Gallery.findById(id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    if (gallery.fileId) {
      await imagekit.deleteFile(gallery.fileId);
    }

    await Gallery.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Gallery item deleted successfully",
    });
  } catch (error) {
    console.error("Delete Gallery Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadGalleryImage,
  uploadGalleryVideo,
  updateGalleryMedia,
  getGalleryImages,
  getGalleryVideos,
  getAllGallery,
  deleteGalleryMedia,
};