import Branch from "../models/Branch.js";
import mongoose from "mongoose";

const handleValidationError = (err) => {
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return { status: 400, message: messages.join(", ") };
  }
  return { status: 500, message: err.message || "Internal Server Error" };
};

export const getBranches = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    // Limit ko default 4 set kiya gaya hai (max 50 limit rakhi hai safety ke liye)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 4));
    const search = req.query.search ? req.query.search.trim() : "";

    const query = search
      ? { branchName: { $regex: search, $options: "i" } }
      : {};

    const [total, branches] = await Promise.all([
      Branch.countDocuments(query),
      Branch.find(query)
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const hasMore = page < totalPages; // Infinite scroll ke liye helpful flag

    return res.status(200).json({
      success: true,
      data: branches,
      pagination: {
        total,
        pages: totalPages,
        currentPage: page,
        limit,
        hasMore, // Ye frontend ko batayega ki aur data bacha hai ya nahi
      },
    });
  } catch (error) {
    console.error("Error in getBranches:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createBranch = async (req, res) => {
  try {
    const newBranch = await Branch.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Branch created successfully!",
      data: newBranch,
    });
  } catch (error) {
    const errorResponse = handleValidationError(error);
    return res.status(errorResponse.status).json({ success: false, message: errorResponse.message });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid branch ID format" });
    }

    const updatedBranch = await Branch.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedBranch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Branch updated successfully!",
      data: updatedBranch,
    });
  } catch (error) {
    const errorResponse = handleValidationError(error);
    return res.status(errorResponse.status).json({ success: false, message: errorResponse.message });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid branch ID format" });
    }

    const deletedBranch = await Branch.findByIdAndDelete(id);
    if (!deletedBranch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    return res.status(200).json({ success: true, message: "Branch deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteBranch:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};