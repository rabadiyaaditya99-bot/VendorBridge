const { z } = require("zod");

const approvalCreateSchema = z.object({
  rfqId: z
    .string({ required_error: "RFQ reference is required" })
    .min(1, "RFQ reference is required"),
  quotationId: z
    .string({ required_error: "Quotation reference is required" })
    .min(1, "Quotation reference is required"),
  remarks: z.string().optional().nullable(),
});

const approvalActionSchema = z.object({
  remarks: z
    .string({ required_error: "Remarks are required" })
    .min(3, "Remarks must be at least 3 characters")
    .trim(),
});

module.exports = {
  approvalCreateSchema,
  approvalActionSchema,
};
