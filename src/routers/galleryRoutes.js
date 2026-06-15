const express = require("express");
const upload = require("../middlewares/upload");
const { authMiddleware } = require("../middlewares/authMiddleware");

const {
  uploadGalleryImage,
  uploadGalleryVideo,
  updateGalleryMedia,
  deleteGalleryMedia,
  getGalleryImages,
  getGalleryVideos,
  getAllGallery 
} = require("../controllers/galleryController");


const router = express.Router();


/* ==========================================================
   UPLOAD
========================================================== */

// Upload Image
router.post(
  "/upload-image",
  authMiddleware,
  upload.single("image"),
  uploadGalleryImage
);

// Upload Video
router.post(
  "/upload-video",
  authMiddleware,
  upload.single("video"),
  uploadGalleryVideo
);

/* ==========================================================
   UPDATE
========================================================== */

// Update Image/Video + Details
router.put(
  "/:id",
  authMiddleware,
  upload.single("media"),
  updateGalleryMedia
);

/* ==========================================================
   GET
========================================================== */



// Get Images Only
router.get("/images", getGalleryImages);

// Get Videos Only
router.get("/videos", getGalleryVideos);


router.get("/", getAllGallery);

/* ==========================================================
   DELETE
========================================================== */

// Delete Gallery Item
router.delete(
  "/:id",
  authMiddleware,
  deleteGalleryMedia
);

module.exports = router;