/**
 * Generates a unique purchase order number
 * Format: PO-YYYY-XXXX (where XXXX is a random 4 digit number)
 * @returns {string}
 */
const generatePONumber = () => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `PO-${year}-${randomDigits}`;
};

module.exports = generatePONumber;
