const express = require("express");
const {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
} = require("../controllers/vendor.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

// All vendor routes require authentication
router.use(authMiddleware);

router.get("/", getVendors);
router.get("/:id", getVendorById);

// Mutation routes locked to ADMIN or PROCUREMENT_OFFICER
router.post("/", authorize("ADMIN", "PROCUREMENT_OFFICER"), createVendor);
router.patch("/:id", authorize("ADMIN", "PROCUREMENT_OFFICER"), updateVendor);
router.delete("/:id", authorize("ADMIN", "PROCUREMENT_OFFICER"), deleteVendor);

module.exports = router;
