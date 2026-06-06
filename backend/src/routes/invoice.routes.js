const express = require("express");
const {
  generateInvoice,
  getInvoices,
  getInvoiceById,
  getInvoicePDFFile,
  emailInvoice,
  updateInvoiceStatus,
} = require("../controllers/invoice.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getInvoices);
router.get("/:id", getInvoiceById);
router.get("/:id/pdf", getInvoicePDFFile);

router.post("/", authorize("ADMIN", "PROCUREMENT_OFFICER"), generateInvoice);
router.post("/:id/send-email", authorize("ADMIN", "PROCUREMENT_OFFICER"), emailInvoice);
router.patch("/:id/status", authorize("ADMIN", "PROCUREMENT_OFFICER"), updateInvoiceStatus);

module.exports = router;
