import api from "./axios";

export const getQuotations = () => api.get("/quotations");
export const getQuotationById = (id) => api.get(`/quotations/${id}`);
export const getQuotationsByRFQ = (rfqId) => api.get(`/quotations/rfq/${rfqId}`);
export const submitQuotation = (data) => api.post("/quotations", data);
export const updateQuotation = (id, data) => api.patch(`/quotations/${id}`, data);
export const shortlistQuotation = (id) => api.post(`/quotations/${id}/shortlist`);
