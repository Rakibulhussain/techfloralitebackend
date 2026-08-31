const express = require("express");

const router = express.Router();

const {
  createSlide,getAllSlides, getSlideById,
  updateSlide,
  toggleSlideStatus,
  deleteSlide,getActiveSlides
} = require("../controllers/slideShowController");

const upload = require("../middlewares/upload");



//admin side 
router.post(
  "/",
  upload.single("image"),
  createSlide
);



// Get active slides for public
router.get(
  "/active",
  getActiveSlides
);




//only for admin

router.get("/", getAllSlides);

// Get single - Admin
router.get(
  "/:id",
  getSlideById
);

// Update - Admin
router.put(
  "/:id",
  upload.single("image"),
  updateSlide
);

// Hide / Show - Admin
router.patch(
  "/:id/status",
  toggleSlideStatus
);

// Delete - Admin
router.delete(
  "/:id",
  deleteSlide
);




module.exports = router;