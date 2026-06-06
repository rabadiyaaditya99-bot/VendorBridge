const prisma = require("../config/db");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

// GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    res.status(200).json(new ApiResponse(200, "Notifications retrieved.", notifications));
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new ApiError(404, "Notification not found.");
    }

    if (notification.userId !== req.user.id) {
      throw new ApiError(403, "Access denied. This notification does not belong to you.");
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.status(200).json(new ApiResponse(200, "Notification marked as read.", updated));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
