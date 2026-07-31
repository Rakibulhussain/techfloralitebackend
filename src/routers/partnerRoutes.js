const express = require("express");
const router = express.Router();

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const {
  createPartner,
  getPartners,
  getPartnerById,
  updatePartner,
  deletePartner,
} = require("../controllers/partnerController");

// Apply authentication & admin middleware globally to all partner routes

router.use(authMiddleware, isAdmin);

// Routes
router.post("/", createPartner);          // POST /api/partners
router.get("/", getPartners);             // GET /api/partners (Paginated + Search)
router.get("/:id", getPartnerById);       // GET /api/partners/:id
router.put("/:id", updatePartner);         // PUT /api/partners/:id
router.delete("/:id", deletePartner);     // DELETE /api/partners/:id

module.exports = router;