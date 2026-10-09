/**
 * @file branch.routes.js
 * @description Routes for independent Branch management.
 */

import express from "express";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} from "../controllers/branchController.js"; // Adjust the path if your controller file has a different name

const router = express.Router();

// @route   GET /api/branches
// @desc    Get all branches with search & pagination (Admin)
router.get("/",  getBranches);

// @route   POST /api/branches
// @desc    Create a new branch (Admin)
router.post("/", authMiddleware, isAdmin, createBranch);

// @route   PUT /api/branches/:id
// @desc    Update a branch by ID (Admin)
router.put("/:id", authMiddleware, isAdmin, updateBranch);

// @route   DELETE /api/branches/:id
// @desc    Delete a branch by ID (Admin)
router.delete("/:id", authMiddleware, isAdmin, deleteBranch);

export default router;