const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  isAdmin,
} = require("../middlewares/authMiddleware");

const {
  createNews,
  createCareer,
  getAllNews,
  getAllCareers,
    updateRegistryItem,
    deleteRegistryItem
} = require("../controllers/infoController");

// Public View Links (Frontend user view tab ke liye)
router.get("/news", getAllNews);
router.get("/career", getAllCareers);

// Protected Admin Links (Sirf authorized admins add kar sakein)
router.post("/news", authMiddleware, createNews);
router.post("/career", authMiddleware,  createCareer);
router.put("/:id", authMiddleware,  updateRegistryItem);
router.delete("/:id", authMiddleware,  deleteRegistryItem);

module.exports = router;