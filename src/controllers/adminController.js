const User = require("../models/User");
const Gallery = require("../models/Gallery");
const InfoRegistry = require("../models/InfoRegistry");
const Contact = require("../models/Contact"); 

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const imagekit = require("../config/imagekit");

const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find(
      { isActive: false },
      "-password"
    );

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isActive: true,
      },
      {
        new: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User approved successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Dashboard ke liye analytics data compile karne wala controller
const getDashboardStats = async (req, res) => {
  try {
    // Parallel queries execute ho rahi hain database performance maintain karne ke liye
    const [totalUsers, teamMembers, galleryImages, uniqueDepartments, recentActiveUsers] = await Promise.all([
      // 1. Total registered users count
      User.countDocuments(),
      
      // 2. Active employees count
      User.countDocuments({ role: "user", isActive: true }),
      
      // 3. Gallery Images count (Aapke schema ke 'mediaType' field ke hisab se)
      Gallery.countDocuments({ mediaType: "image" }), 
      
      // 4. Unique departments list length
      User.distinct("department", { department: { $ne: "" } }),
      
      // 5. Top 5 recent active users
      User.find({ isActive: true })
        .select("name email designation department imageUrl")
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Frontend (Dashboard.jsx) ke state parameters ke sath exact mapping payload
    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        teamMembers: teamMembers || 0,
        galleryImages: galleryImages || 0,
        departments: uniqueDepartments.length || 0
      },
      recentUsers: recentActiveUsers || [] 
    });

  } catch (error) {
    console.error("Dashboard Stats Controller Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error: " + error.message 
    });
  }
};




// @desc    Get top 10 recent system-wide activities
// @route   GET /api/v1/dashboard/recent-activities
// @access  Private/Admin
const getRecentActivities = async (req, res) => {
  try {
    // Parallel operations execute karte hain response speed badhane ke liye
    const [recentUsers, recentInfo, recentMedia, recentContacts] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(10).lean(),
      InfoRegistry.find().sort({ createdAt: -1 }).limit(10).populate("uploadedBy", "name email").lean(),
      Gallery.find().sort({ createdAt: -1 }).limit(10).lean(),
      Contact.find().sort({ createdAt: -1 }).limit(10).lean()
    ]);

    const activityMatrix = [];

    // 1. User Schema Transformation
    recentUsers.forEach((user) => {
      activityMatrix.push({
        id: user._id,
        type: "USER_REGISTRATION",
        category: "System Access",
        title: `New account created by ${user.name}`,
        subtitle: `Email: ${user.email} | Role: ${user.role}`,
        status: user.approvalStatus, // pending, approved, rejected
        timestamp: user.createdAt,
        meta: { email: user.email, isActive: user.isActive }
      });
    });

    // 2. InfoRegistry (News / Jobs) Transformation
    recentInfo.forEach((item) => {
      const isJob = item.contentType === "Job";
      activityMatrix.push({
        id: item._id,
        type: isJob ? "JOB_OPENING" : "NEWS_ANNOUNCEMENT",
        category: item.contentType,
        title: isJob ? `New Opening: ${item.designation}` : `News: ${item.title}`,
        subtitle: isJob ? `Dept: ${item.department} | Openings: ${item.noOfOpenings}` : `Timeline: ${item.timelineDate}`,
        status: isJob ? (item.isActive ? "Active" : "Inactive") : item.status,
        timestamp: item.createdAt,
        meta: { uploadedBy: item.uploadedBy?.name || "System" }
      });
    });

    // 3. Gallery & Events Transformation
    recentMedia.forEach((media) => {
      activityMatrix.push({
        id: media._id,
        type: media.displayIn === "Event" ? "EVENT_MEDIA" : "GALLERY_MEDIA",
        category: media.displayIn,
        title: `Media uploaded: ${media.title}`,
        subtitle: `Category: ${media.category} | Type: ${media.mediaType}`,
        status: media.isFeatured ? "Featured" : "Standard",
        timestamp: media.createdAt,
        meta: { uploader: media.uploadedByName, url: media.mediaUrl }
      });
    });

    // 4. Contact Form Inquiries Transformation
    recentContacts.forEach((contact) => {
      activityMatrix.push({
        id: contact._id,
        type: "SUPPORT_INQUIRY",
        category: "Inbound Lead",
        title: `Inquiry received from ${contact.fullName}`,
        subtitle: `Subject: ${contact.subject}`,
        status: contact.status, // Pending, In Progress, Resolved
        timestamp: contact.createdAt,
        meta: { email: contact.email, phone: contact.phoneNumber }
      });
    });

    // All-time sorting mechanism based on epoch time difference
    const sortedTimeline = activityMatrix
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10); // Sirf top 10 trace filter records nikalenge

    return res.status(200).json({
      success: true,
      count: sortedTimeline.length,
      data: sortedTimeline
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to compile tracking pipeline matrices",
      error: error.message
    });
  }
};



module.exports = {
  getPendingUsers,
  approveUser,
    deleteUser,
  getDashboardStats,
  getRecentActivities
};