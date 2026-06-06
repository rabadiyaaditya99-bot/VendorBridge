const express = require("express");
const { getAllUsers, getUserById, updateUserRole, updateProfile, uploadAvatar, deleteProfile } = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

// Profile updates — any authenticated user
router.patch("/profile", authMiddleware, updateProfile);
router.post("/avatar", authMiddleware, upload.single("avatar"), uploadAvatar);
router.delete("/profile", authMiddleware, deleteProfile);

// Admin only routes below
router.use(authMiddleware, authorize("ADMIN"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id/role", updateUserRole);

module.exports = router;
