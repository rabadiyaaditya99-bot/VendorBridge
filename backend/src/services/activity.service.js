const prisma = require("../config/db");
const { getIO } = require("../socket/socket");

/**
 * Creates an activity log entry
 * @param {string} userId User performing the action
 * @param {string} action Description of action (e.g. 'Created RFQ')
 * @param {string} module Module category (e.g. 'RFQ', 'VENDOR', 'INVOICE')
 * @param {string} description Detailed description of action
 */
const logActivity = async (userId, action, module, description) => {
  try {
    if (!userId) return null;
    
    return await prisma.activityLog.create({
      data: {
        userId,
        action,
        module,
        description,
      },
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    return null;
  }
};

/**
 * Creates a notification and sends it via Socket.IO
 * @param {string} userId User receiving the notification
 * @param {string} title Notification title
 * @param {string} message Notification body message
 */
const createNotification = async (userId, title, message) => {
  try {
    if (!userId) return null;

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        isRead: false,
      },
    });

    // Real-time socket broadcast to the user's room
    try {
      const io = getIO();
      io.to(userId).emit("new-notification", notification);
      console.log(`Notification socket emitted to room user ${userId}: ${title}`);
    } catch (socketErr) {
      // socket.io might not be initialized during test runs
      console.warn("Socket.io not available for notification emission.");
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

module.exports = {
  logActivity,
  createNotification,
};
