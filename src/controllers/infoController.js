const InfoRegistry = require("../models/InfoRegistry");

// =========================================================================
// 1. CREATE CONTROLLERS
// =========================================================================

// @desc    Create a News Announcement
// @route   POST /api/info/news
// @access  Private/Admin
const createNews = async (req, res) => {
  try {
    const { title, description, timelineDate, status } = req.body;

    // Validation Check
    if (!title || !description || !timelineDate) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields for News (title, description, timelineDate)",
      });
    }

    const newsPost = await InfoRegistry.create({
      contentType: "News",
      title,
      description,
      timelineDate,
      status: status || "Active",
      uploadedBy: req.user._id, // Auth middleware se milega
    });

    res.status(201).json({
      success: true,
      message: "News announcement posted successfully",
      data: newsPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a Career/Job Opening
// @route   POST /api/info/career
// @access  Private/Admin
const createCareer = async (req, res) => {
  try {
    const { designation, noOfOpenings, department, isActive } = req.body;

    // Validation Check
    if (!designation || noOfOpenings === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide designation and number of openings",
      });
    }

    const careerPost = await InfoRegistry.create({
      contentType: "Job",
      designation,
      noOfOpenings,
      department: department || "General Operations",
      isActive: isActive !== undefined ? isActive : true,
      uploadedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Job opening posted successfully",
      data: careerPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// =========================================================================
// 2. GET CONTROLLERS (With 20 Items Limit & Pagination)
// =========================================================================

// @desc    Get All News Announcements (Max 20)
// @route   GET /api/info/news?page=1
// @access  Public
const getAllNews = async (req, res) => {
  try {
    // Dynamic page support (Default page 1)
    const page = parseInt(req.query.page) || 1;
    const limit = 20; // 🔥 STRICT LIMIT SET TO 20
    const skip = (page - 1) * limit;

    // Latests updates pehle dikhane ke liye -1 sorting aur limit lagayi
    const newsFeed = await InfoRegistry.find({ contentType: "News" })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Total counts checks for frontend page math tracking
    const totalNews = await InfoRegistry.countDocuments({ contentType: "News" });

    res.status(200).json({
      success: true,
      count: newsFeed.length,
      totalRecords: totalNews,
      currentPage: page,
      totalPages: Math.ceil(totalNews / limit),
      data: newsFeed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get All Active Career Openings (Max 20)
// @route   GET /api/info/career?page=1
// @access  Public
const getAllCareers = async (req, res) => {
  try {
    // Dynamic page support (Default page 1)
    const page = parseInt(req.query.page) || 1;
    const limit = 20; // 🔥 STRICT LIMIT SET TO 20
    const skip = (page - 1) * limit;

    // Sirf Active positions aur max 20 limit fetch
    const careerOpenings = await InfoRegistry.find({ 
      contentType: "Job", 
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalJobs = await InfoRegistry.countDocuments({ contentType: "Job", isActive: true });

    res.status(200).json({
      success: true,
      count: careerOpenings.length,
      totalRecords: totalJobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      data: careerOpenings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================================
// 3. UPDATE CONTROLLERS
// =========================================================================

// @desc    Update a specific News or Job Registry Item
// @route   PUT /api/info/:id
// @access  Private/Admin
const updateRegistryItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Pehle verify karein ki item database me exist karta hai ya nahi
    let item = await InfoRegistry.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Requested content item registry not found.",
      });
    }

    // Dynamic field tracking update context selection match
    const updatedItem = await InfoRegistry.findByIdAndUpdate(
      id,
      { $set: req.body }, // Body me jo bhi parameters aayenge unhe set karega
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `${updatedItem.contentType} metrics record updated successfully!`,
      data: updatedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================================
// 4. DELETE CONTROLLERS
// =========================================================================

// @desc    Delete a specific News or Job Registry Item completely
// @route   DELETE /api/info/:id
// @access  Private/Admin
const deleteRegistryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await InfoRegistry.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Registry context target document not found.",
      });
    }

    // Document remove processing operation
    await InfoRegistry.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `${item.contentType} record systematically flushed from the registry.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createNews,
  createCareer,
  getAllNews,
  getAllCareers,
  updateRegistryItem,
  deleteRegistryItem
}