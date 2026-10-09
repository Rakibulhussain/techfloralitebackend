/**
 * @file partner.routes.js
 * @description Routes for Partner and Branch management.
 */

import express from "express";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import {
  // Partner Controllers
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  getPublicPartners,
  getPublicPartnersDetails
} from "../controllers/partnerController.js";

const router = express.Router();

// ==================== Public Partner Routes ====================
// @route   GET /api/partners/public
// @desc    Get limited public partner listings
router.get("/public", getPublicPartners);
router.get("/public-url-logo", getPublicPartnersDetails);
// ==================== Partner Admin Routes ====================

// @route   GET /api/partners
// @desc    Get all partners (Admin)
router.get("/", authMiddleware, isAdmin, getPartners);

// @route   POST /api/partners
// @desc    Create a new partner (Admin)
router.post("/", authMiddleware, isAdmin, createPartner);

// @route   GET /api/partners/:id
// @desc    Get a single partner by ID (Admin) (MUST BE AFTER /branches ROUTES)
router.get("/:id", authMiddleware, isAdmin, getPartnerById);

// @route   PUT /api/partners/:id
// @desc    Update a partner by ID (Admin)
router.put("/:id", authMiddleware, isAdmin, updatePartner);

// @route   DELETE /api/partners/:id
// @desc    Delete a partner by ID (Admin)
router.delete("/:id", authMiddleware, isAdmin, deletePartner);

export default router;