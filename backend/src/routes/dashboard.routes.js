const express = require("express");
const { getDashboardStats } = require("../controllers/dashboard.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.get("/stats", authMiddleware, authorize("ADMIN"), getDashboardStats);

module.exports = router;
