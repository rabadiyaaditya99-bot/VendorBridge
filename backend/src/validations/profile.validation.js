const { z } = require("zod");

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .trim()
    .optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores")
    .trim()
    .toLowerCase()
    .optional(),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be at most 15 digits")
    .optional()
    .or(z.literal("")),
  currentPassword: z
    .string()
    .optional()
    .or(z.literal("")),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .max(100)
    .optional()
    .or(z.literal("")),
}).refine((data) => {
  // If newPassword provided, currentPassword is required
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to set a new password",
  path: ["currentPassword"],
});

module.exports = { updateProfileSchema };
