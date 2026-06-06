/**
 * Generates a unique invoice number
 * Format: INV-YYYY-XXXX (where XXXX is a random 4 digit number)
 * @returns {string}
 */
const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${randomDigits}`;
};

module.exports = generateInvoiceNumber;
