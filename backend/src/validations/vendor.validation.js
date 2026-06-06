const { z } = require("zod");

const vendorCreateSchema = z.object({
  companyName: z
    .string({ required_error: "Company name is required" })
    .min(2, "Company name must be at least 2 characters")
    .trim(),
  contactPerson: z
    .string({ required_error: "Contact person is required" })
    .min(2, "Contact person must be at least 2 characters")
    .trim(),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
  phone: z
    .string({ required_error: "Phone number is required" })
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .trim(),
  gstNumber: z
    .string({ required_error: "GST number is required" })
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST number format")
    .trim()
    .toUpperCase(),
  category: z
    .string({ required_error: "Category is required" })
    .min(2, "Category is required")
    .trim(),
  address: z
    .string({ required_error: "Address is required" })
    .min(5, "Address must be at least 5 characters")
    .trim(),
  city: z
    .string({ required_error: "City is required" })
    .min(2, "City is required")
    .trim(),
  state: z
    .string({ required_error: "State is required" })
    .min(2, "State is required")
    .trim(),
  pincode: z
    .string({ required_error: "Pincode is required" })
    .regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits")
    .trim(),
  status: z.enum(["ACTIVE", "INACTIVE", "BLACKLISTED", "PENDING"]).optional(),
  rating: z.number().min(0).max(5).optional(),
});

const vendorUpdateSchema = vendorCreateSchema.partial();

module.exports = {
  vendorCreateSchema,
  vendorUpdateSchema,
};
