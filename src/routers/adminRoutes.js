const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  isAdmin,
} = require("../middlewares/authMiddleware");

const {
  getPendingUsers,
  approveUser,
  deleteUser,
  getDashboardStats,
  getRecentActivities
} = require("../controllers/adminController");

router.get("/pending-users", authMiddleware, isAdmin, getPendingUsers);

router.put("/approve-user/:userId",authMiddleware,isAdmin,approveUser);
router.delete("/delete-user/:userId",authMiddleware,isAdmin,deleteUser);


router.get("/stats",authMiddleware, getDashboardStats);
router.get("/activity",authMiddleware,getRecentActivities);

module.exports = router;