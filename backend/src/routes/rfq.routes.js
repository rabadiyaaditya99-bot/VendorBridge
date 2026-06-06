const express = require("express");
const {
  createRFQ,
  getRFQs,
  getRFQById,
  updateRFQ,
  deleteRFQ,
  assignVendors,
} = require("../controllers/rfq.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getRFQs);
router.get("/:id", getRFQById);

router.post("/", authorize("ADMIN", "PROCUREMENT_OFFICER"), createRFQ);
router.patch("/:id", authorize("ADMIN", "PROCUREMENT_OFFICER"), updateRFQ);
router.delete("/:id", authorize("ADMIN"), deleteRFQ);

router.post("/:id/assign-vendors", authorize("ADMIN", "PROCUREMENT_OFFICER"), assignVendors);

module.exports = router;
