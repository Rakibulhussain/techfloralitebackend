const express = require("express");
const upload = require("../middlewares/upload");
const { authMiddleware } = require("../middlewares/authMiddleware");
const multer =require("multer");
// const upload = multer();
const {
  registerUser,
  loginUser,
    updateProfile,
    uploadProfileImage,
    getMyProfile,
    getAllUsers,
    createMultipleUsers,
    updatePassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register",upload.single("image"), registerUser);
router.post("/login", loginUser);

router.put("/password-update",authMiddleware,updatePassword),
router.put("/update-profile",authMiddleware, updateProfile);
router.post(
  "/upload-profile-image",
  authMiddleware,
  upload.single("image"),
  uploadProfileImage
);


router.get("/me", authMiddleware, getMyProfile);
router.get("/users", getAllUsers);
router.post("/create-multiple-users", createMultipleUsers);
module.exports = router;