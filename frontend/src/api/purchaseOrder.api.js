import api from "./axios";

export const getPurchaseOrders = (params) => api.get("/purchase-orders", { params });
export const getPurchaseOrderById = (id) => api.get(`/purchase-orders/${id}`);
export const generatePurchaseOrder = (data) => api.post("/purchase-orders", data);
export const updatePOStatus = (id, status) => api.patch(`/purchase-orders/${id}/status`, { status });
