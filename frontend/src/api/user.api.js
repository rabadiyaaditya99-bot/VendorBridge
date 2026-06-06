import api from "./axios";

export const updateProfile = (data) => api.patch("/users/profile", data);

export const uploadAvatar = (formData) => api.post("/users/avatar", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export const deleteProfile = () => api.delete("/users/profile");
