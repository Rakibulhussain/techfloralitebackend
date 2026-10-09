/**
 * @file partner.controller.js
 * @description Controller handling CRUD operations for Partners and their nested Branches.
 */

import Partner from "../models/partner.js";
import mongoose from "mongoose";

/**
 * Helper function to handle Mongoose validation and duplicate key errors.
 */
const handleValidationError = (err) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return { status: 400, message: `A partner with this ${field} already exists.` };
  }
  
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return { status: 400, message: messages.join(", ") };
  }
  
  return { status: 500, message: err.message || "Internal Server Error" };
};

// ==================== Partner Controllers ====================
// get only active partners for public listing 
//partner name and partnerlogourl

export const getPublicPartnersDetails = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const reqLimit = parseInt(req.query.limit, 10) || 10;
    const MAX_LIMIT = 30;
    const limit = Math.min(Math.max(1, reqLimit), MAX_LIMIT);
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : "";

    const query = {
      status: "Active",
      ...(search && {
        $or: [
          { partnerName: { $regex: search, $options: "i" } },
          { partnerType: { $regex: search, $options: "i" } },
        ],
      }),
    };

    const [partners, totalRecords] = await Promise.all([
      Partner.find(query)
        // Added partnerLogoUrl to the selected fields
        .select("partnerName partnerType partnerLogoUrl partnerWebsite partnerAddress branches -_id")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Partner.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      meta: {
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        limit,
      },
      data: partners,
    });
  } catch (error) {
    console.error("Error fetching public partners:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve records. Please try again later.",
    });
  }
};



export const getPartners = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = req.query.search ? req.query.search.trim() : "";
    const status = req.query.status;

    const query = {};
    
    if (status && ["Active", "Inactive", "Pending"].includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { partnerName: { $regex: search,$options: "i" } },
        { email: { $regex: search,$options: "i" } },
        { partnerType: { $regex: search,$options: "i" } },
      ];
    }

    const [total, partners] = await Promise.all([
      Partner.countDocuments(query),
      Partner.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: partners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error("Error in getPartners:", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve partners" });
  }
};

export const getPartnerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid partner ID format" });
    }

    const partner = await Partner.findById(id).lean();

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    return res.status(200).json({
      success: true,
      data: partner,
    });
  } catch (err) {
    console.error("Error in getPartnerById:", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve partner" });
  }
};

export const createPartner = async (req, res) => {
  try {
    const partner = await Partner.create(req.body);
    
    return res.status(201).json({
      success: true,
      data: partner,
      message: "Partner created successfully",
    });
  } catch (err) {
    const errorResponse = handleValidationError(err);
    return res.status(errorResponse.status).json({ success: false, message: errorResponse.message });
  }
};

export const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid partner ID format" });
    }

    const partner = await Partner.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    return res.status(200).json({
      success: true,
      data: partner,
      message: "Partner updated successfully",
    });
  } catch (err) {
    const errorResponse = handleValidationError(err);
    return res.status(errorResponse.status).json({ success: false, message: errorResponse.message });
  }
};

export const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid partner ID format" });
    }

    const partner = await Partner.findByIdAndDelete(id);

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Partner deleted successfully",
    });
  } catch (err) {
    console.error("Error in deletePartner:", err);
    return res.status(500).json({ success: false, message: "Failed to delete partner" });
  }
};

export const getPublicPartners = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const reqLimit = parseInt(req.query.limit, 10) || 10;
    const MAX_LIMIT = 20;
    const limit = Math.min(Math.max(1, reqLimit), MAX_LIMIT);
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : "";

    const query = {
      status: "Active",
      ...(search && {
        $or: [
          { partnerName: { $regex: search,$options: "i" } },
          { partnerType: { $regex: search,$options: "i" } },
        ],
      }),
    };

    const [partners, totalRecords] = await Promise.all([
      Partner.find(query)
        .select("partnerName partnerType partnerWebsite partnerAddress branches -_id")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Partner.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      meta: {
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        limit,
      },
      data: partners,
    });
  } catch (error) {
    console.error("Error fetching public partners:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve records. Please try again later.",
    });
  }
};




