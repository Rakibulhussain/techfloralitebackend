const User = require("../models/User");
const Gallery = require("../models/Gallery");
const imagekit = require("../config/imagekit");

/* ==========================================================
UPLOAD IMAGE
========================================================== */
const uploadGalleryImage = async (req, res) => {
  try {
    const { title, category, description } = req.body;


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
UPLOAD VIDEO
========================================================== */
const uploadGalleryVideo = async (req, res) => {
  try {
    const { title, category, description } = req.body;


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

    const gallery = await Gallery.create({
      title,
      category,
      description,
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
    const { title, category, description } = req.body;


    const gallery = await Gallery.findById(id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    if (title) gallery.title = title;
    if (category) gallery.category = category;
    if (description !== undefined)
      gallery.description = description;

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
        gallery.thumbnailUrl =
          uploadedFile.thumbnailUrl || "";
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
GET ALL GALLERY ITEMS
========================================================== */
/* ==========================================================
   GET ALL GALLERY ITEMS WITH PAGINATION
========================================================== */
const getGallery = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;

    const skip = (page - 1) * limit;

    const total = await Gallery.countDocuments();

    const gallery = await Gallery.find()
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      count: gallery.length,
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
GET SINGLE GALLERY ITEM
========================================================== */
const getGalleryById = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
      .populate("uploadedBy", "name email");


    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    return res.status(200).json({
      success: true,
      gallery,
    });


  } catch (error) {
    console.error("Get Gallery By Id Error:", error);


    return res.status(500).json({
      success: false,
      message: error.message,
    });


  }
};

/* ==========================================================
GET IMAGES ONLY
========================================================== */
const getGalleryImages = async (req, res) => {
  try {
    const images = await Gallery.find({
      mediaType: "image",
    }).sort({ createdAt: -1 });

    
return res.status(200).json({
  success: true,
  total: images.length,
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
GET VIDEOS ONLY
========================================================== */
const getGalleryVideos = async (req, res) => {
  try {
    const videos = await Gallery.find({
      mediaType: "video",
    }).sort({ createdAt: -1 });


    return res.status(200).json({
      success: true,
      total: videos.length,
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
GET GALLERY BY CATEGORY
========================================================== */
const getGalleryByCategory = async (req, res) => {
  try {
    const { category } = req.params;


    const gallery = await Gallery.find({
      category,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: gallery.length,
      gallery,
    });


  } catch (error) {
    console.error("Category Gallery Error:", error);


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
  getGallery,
  getGalleryById,
  getGalleryImages,
  getGalleryVideos,
  getGalleryByCategory,
  deleteGalleryMedia,
};
