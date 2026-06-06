const express = require("express");
const { getActivityLogs } = require("../controllers/activity.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.use(authMiddleware, authorize("ADMIN", "PROCUREMENT_OFFICER", "MANAGER"));

router.get("/", getActivityLogs);

module.exports = router;
