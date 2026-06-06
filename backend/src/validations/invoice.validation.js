const { z } = require("zod");

const invoiceCreateSchema = z.object({
  poId: z
    .string({ required_error: "Purchase Order reference is required" })
    .min(1, "Purchase Order reference is required"),
  dueDate: z
    .string({ required_error: "Due date is required" })
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    }, {
      message: "Due date must be a future date",
    }),
});

module.exports = {
  invoiceCreateSchema,
};
