const express = require("express");
const {
  getSummary,
  getVendorPerformance,
  getMonthlySpending,
  getProcurementStats,
} = require("../controllers/report.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.use(authMiddleware, authorize("ADMIN", "PROCUREMENT_OFFICER", "MANAGER"));

router.get("/summary", getSummary);
router.get("/vendor-performance", getVendorPerformance);
router.get("/monthly-spending", getMonthlySpending);
router.get("/procurement-stats", getProcurementStats);

module.exports = router;
