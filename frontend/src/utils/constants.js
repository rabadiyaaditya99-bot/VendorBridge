export const ROLES = {
  ADMIN: "ADMIN",
  PROCUREMENT_OFFICER: "PROCUREMENT_OFFICER",
  VENDOR: "VENDOR",
  MANAGER: "MANAGER",
};

export const STATUS_COLORS = {
  // Vendor Status
  ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  INACTIVE: "bg-gray-100 text-gray-800 border-gray-200",
  BLACKLISTED: "bg-rose-100 text-rose-800 border-rose-200",
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",

  // RFQ Status
  DRAFT: "bg-slate-100 text-slate-800 border-slate-200",
  SENT: "bg-sky-100 text-sky-800 border-sky-200",
  QUOTATION_RECEIVED: "bg-indigo-100 text-indigo-800 border-indigo-200",
  UNDER_COMPARISON: "bg-blue-100 text-blue-800 border-blue-200",
  APPROVAL_PENDING: "bg-orange-100 text-orange-800 border-orange-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-rose-100 text-rose-800 border-rose-200",
  CLOSED: "bg-violet-100 text-violet-800 border-violet-200",

  // Quotation Status
  SUBMITTED: "bg-sky-100 text-sky-800 border-sky-200",
  SHORTLISTED: "bg-blue-100 text-blue-800 border-blue-200",
  // REJECTED, APPROVED are shared from RFQ list

  // Purchase Order Status
  GENERATED: "bg-slate-100 text-slate-800 border-slate-200",
  // SENT, ACCEPTED, CLOSED/COMPLETED, CANCELLED
  ACCEPTED: "bg-teal-100 text-teal-800 border-teal-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",

  // Invoice Status
  PAID: "bg-emerald-100 text-emerald-800 border-emerald-200",
  OVERDUE: "bg-red-100 text-red-800 border-red-200",
};
