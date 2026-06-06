import api from "./axios";

export const getRFQs = (params) => api.get("/rfqs", { params });
export const getRFQById = (id) => api.get(`/rfqs/${id}`);
export const createRFQ = (data) => api.post("/rfqs", data);
export const updateRFQ = (id, data) => api.patch(`/rfqs/${id}`, data);
export const deleteRFQ = (id) => api.delete(`/rfqs/${id}`);
export const assignVendors = (id, vendorIds) => api.post(`/rfqs/${id}/assign-vendors`, { vendorIds });
