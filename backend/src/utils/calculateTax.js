/**
 * Calculates tax and total amount based on price, quantity, and tax rate
 * @param {number} quantity Product/service quantity
 * @param {number} unitPrice Price per unit
 * @param {number} taxPercentage Tax rate percentage (e.g. 18.0)
 * @returns {Object} { amount, taxAmount, totalAmount }
 */
const calculateTax = (quantity, unitPrice, taxPercentage = 18.0) => {
  const amount = quantity * unitPrice;
  const taxAmount = (amount * taxPercentage) / 100;
  const totalAmount = amount + taxAmount;

  return {
    amount: parseFloat(amount.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  };
};

module.exports = calculateTax;
