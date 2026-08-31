const imagekit = require("../config/imagekit");
const SlideShow = require("../models/slideShow");

// CREATE SLIDE  //admin controller 
// POST /api/slides
const createSlide = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      order,
      isActive,
    } = req.body;

    // Validate title
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Validate image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Slide image is required",
      });
    }

    // Duration in seconds
    const slideDuration = Number(duration || 5);

    if (
      !Number.isFinite(slideDuration) ||
      slideDuration < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Duration must be at least 1 second",
      });
    }

    // Display order
    const slideOrder = Number(order || 0);

    if (
      !Number.isFinite(slideOrder) ||
      slideOrder < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Order must be a valid number",
      });
    }

    // Upload image to ImageKit
    const uploadResponse = await imagekit.upload({
      file: req.file.buffer,
      fileName: `slide-${Date.now()}-${req.file.originalname}`,
      folder: "/slideShowImages",
    });

    // Create slide in MongoDB
    const slide = await SlideShow.create({
      title: title.trim(),

      description: description
        ? description.trim()
        : "",

      imageUrl: uploadResponse.url,

      imageFileId: uploadResponse.fileId,

      duration: slideDuration,

      order: slideOrder,

      isActive:
        isActive === undefined
          ? true
          : isActive === true ||
            isActive === "true",
    });

    return res.status(201).json({
      success: true,
      message: "Slide created successfully",
      data: slide,
    });
  } catch (error) {
    console.error("Create Slide Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create slide",
      error: error.message,
    });
  }
};



//admin controller 
const getAllSlides = async (req, res) => {
  try {
    // Page
    const page = Math.max(
      Number.parseInt(req.query.page) || 1,
      1
    );

    // Limit
    const limit = Math.min(
      Math.max(
        Number.parseInt(req.query.limit) || 10,
        1
      ),
      100
    );

    const skip = (page - 1) * limit;

    // Total slides
    const totalSlides = await SlideShow.countDocuments();

    // Get slides
    const slides = await SlideShow.find()
      .sort({
        order: 1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(
      totalSlides / limit
    );

    return res.status(200).json({
      success: true,

      data: slides,

      pagination: {
        currentPage: page,
        limit,
        totalItems: totalSlides,
        totalPages,

        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error(
      "Get All Slides Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch slides",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE SLIDE
// GET /api/slides/:id
// =====================================================
const getSlideById = async (req, res) => {
  try {
    const { id } = req.params;

    const slide = await SlideShow.findById(id).lean();

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: "Slide not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: slide,
    });
  } catch (error) {
    console.error("Get Slide Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch slide",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE SLIDE
// PUT /api/slides/:id
// =====================================================
const updateSlide = async (req, res) => {
  try {
    const { id } = req.params;

    const slide = await SlideShow.findById(id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: "Slide not found",
      });
    }

    const {
      title,
      description,
      duration,
      order,
      isActive,
    } = req.body;

    // -----------------------------
    // TITLE
    // -----------------------------
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      slide.title = title.trim();
    }

    // -----------------------------
    // DESCRIPTION
    // -----------------------------
    if (description !== undefined) {
      slide.description = description.trim();
    }

    // -----------------------------
    // DURATION
    // -----------------------------
    if (duration !== undefined) {
      const newDuration = Number(duration);

      if (
        !Number.isFinite(newDuration) ||
        newDuration < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Duration must be at least 1 second",
        });
      }

      slide.duration = newDuration;
    }

    // -----------------------------
    // ORDER
    // -----------------------------
    if (order !== undefined) {
      const newOrder = Number(order);

      if (
        !Number.isFinite(newOrder) ||
        newOrder < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Order must be a valid number",
        });
      }

      slide.order = newOrder;
    }

    // -----------------------------
    // ACTIVE STATUS
    // -----------------------------
    if (isActive !== undefined) {
      slide.isActive =
        isActive === true ||
        isActive === "true";
    }

    // =================================================
    // NEW IMAGE
    // =================================================
    if (req.file) {
      // Upload new image first
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: `slide-${Date.now()}-${req.file.originalname}`,
        folder: "/slides",
      });

      // Save old file ID before changing it
      const oldFileId = slide.imageFileId;

      // Update MongoDB with new image
      slide.imageUrl = uploadResponse.url;
      slide.imageFileId = uploadResponse.fileId;

      await slide.save();

      // Delete old ImageKit image
      if (oldFileId) {
        try {
          await imagekit.deleteFile(oldFileId);
        } catch (imageError) {
          console.error(
            "Old ImageKit image delete failed:",
            imageError.message
          );
        }
      }
    } else {
      // No new image
      await slide.save();
    }

    return res.status(200).json({
      success: true,
      message: "Slide updated successfully",
      data: slide,
    });
  } catch (error) {
    console.error("Update Slide Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update slide",
      error: error.message,
    });
  }
};


// =====================================================
// HIDE / SHOW SLIDE
// PATCH /api/slides/:id/status
// =====================================================
const toggleSlideStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const slide = await SlideShow.findById(id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: "Slide not found",
      });
    }

    slide.isActive = !slide.isActive;

    await slide.save();

    return res.status(200).json({
      success: true,
      message: slide.isActive
        ? "Slide activated successfully"
        : "Slide hidden successfully",

      data: {
        _id: slide._id,
        isActive: slide.isActive,
      },
    });
  } catch (error) {
    console.error(
      "Toggle Slide Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update slide status",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE SLIDE
// DELETE /api/slides/:id
// =====================================================
const deleteSlide = async (req, res) => {
  try {
    const { id } = req.params;

    const slide = await SlideShow.findById(id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: "Slide not found",
      });
    }

    // Delete image from ImageKit
    if (slide.imageFileId) {
      try {
        await imagekit.deleteFile(
          slide.imageFileId
        );
      } catch (imageError) {
        console.error(
          "ImageKit delete failed:",
          imageError.message
        );
      }
    }

    // Delete slide from MongoDB
    await slide.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Slide deleted successfully",
    });
  } catch (error) {
    console.error("Delete Slide Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete slide",
      error: error.message,
    });
  }
};



// =====================================================
// GET ACTIVE SLIDES
// GET /api/slide/active?limit=5
// =====================================================
const getActiveSlides = async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(
        Number.parseInt(req.query.limit) || 5,
        1
      ),
      50
    );

    const slides = await SlideShow.find({
      isActive: true,
    })
      .sort({
        order: 1,
        createdAt: -1,
      })
      .limit(limit)
      .select(
        "title description imageUrl duration order"
      )
      .lean();

    return res.status(200).json({
      success: true,
      count: slides.length,
      data: slides,
    });
  } catch (error) {
    console.error(
      "Get Active Slides Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active slides",
      error: error.message,
    });
  }
};





module.exports = {
  createSlide,
   getAllSlides,
   getSlideById,
  updateSlide,
  toggleSlideStatus,
  deleteSlide,
  getActiveSlides,

};