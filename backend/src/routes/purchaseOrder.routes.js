const express = require("express");
const {
  generatePurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePOStatus,
} = require("../controllers/purchaseOrder.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getPurchaseOrders);
router.get("/:id", getPurchaseOrderById);

router.post("/", authorize("ADMIN", "PROCUREMENT_OFFICER"), generatePurchaseOrder);
router.patch("/:id/status", updatePOStatus); // Checked in controller for vendor limits

module.exports = router;
