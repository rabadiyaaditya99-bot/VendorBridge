const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { updateProfileSchema } = require("../validations/profile.validation");

// GET /api/users — Admin only
const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(
      new ApiResponse(200, "Users fetched successfully.", { users })
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id — Admin only
const getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    res.status(200).json(
      new ApiResponse(200, "User fetched successfully.", { user })
    );
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:id/role — Admin only
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ["ADMIN", "PROCUREMENT_OFFICER", "VENDOR", "MANAGER"];

    if (!role || !validRoles.includes(role)) {
      throw new ApiError(400, "Invalid role. Must be ADMIN, PROCUREMENT_OFFICER, VENDOR, or MANAGER.");
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    res.status(200).json(
      new ApiResponse(200, "User role updated successfully.", { user })
    );
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/profile — Update own profile
const updateProfile = async (req, res, next) => {
  try {
    const validated = updateProfileSchema.parse(req.body);
    const updateData = {};

    if (validated.name) updateData.name = validated.name;
    if (validated.phone !== undefined) updateData.phone = validated.phone || null;

    if (validated.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: validated.username,
          NOT: { id: req.user.id },
        },
      });
      if (existingUser) {
        throw new ApiError(400, "Username is already taken.");
      }
      updateData.username = validated.username;
    }

    // Handle password change
    if (validated.newPassword && validated.currentPassword) {
      const userWithPassword = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      const isMatch = await bcrypt.compare(validated.currentPassword, userWithPassword.password);
      if (!isMatch) {
        throw new ApiError(400, "Current password is incorrect.");
      }

      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(validated.newPassword, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(
      new ApiResponse(200, "Profile updated successfully.", { user: updatedUser })
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/users/avatar — Upload profile photo
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "Please upload an image file.");
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(
      new ApiResponse(200, "Avatar uploaded successfully.", { user: updatedUser })
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/profile — Delete own profile
const deleteProfile = async (req, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    res.status(200).json(
      new ApiResponse(200, "Account deleted successfully.", null)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole, updateProfile, uploadAvatar, deleteProfile };
