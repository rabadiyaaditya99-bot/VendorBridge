import api from "./axios";

export const getDashboardStats = () => api.get("/dashboard/stats");

export const getAllUsers = () => api.get("/users");

export const updateUserRole = (id, role) => api.patch(`/users/${id}/role`, { role });
