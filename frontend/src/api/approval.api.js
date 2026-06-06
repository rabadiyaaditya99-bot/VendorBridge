import api from "./axios";

export const getApprovals = (params) => api.get("/approvals", { params });
export const getApprovalById = (id) => api.get(`/approvals/${id}`);
export const requestApproval = (data) => api.post("/approvals", data);
export const approveRequest = (id, remarks) => api.patch(`/approvals/${id}/approve`, { remarks });
export const rejectRequest = (id, remarks) => api.patch(`/approvals/${id}/reject`, { remarks });
