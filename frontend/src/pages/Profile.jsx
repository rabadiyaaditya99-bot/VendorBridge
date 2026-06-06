import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import { updateProfile, uploadAvatar, deleteProfile } from "../api/user.api";
import { getMe } from "../api/auth.api";
import Card, { CardBody, CardHeader } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { formatDate } from "../utils/formatDate";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Pencil,
  X,
  Check,
  Lock,
  Camera,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-z0-9_]+$/, "Only lowercase, numbers, and underscores allowed")
    .transform(v => v.toLowerCase().trim()),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be at most 15 digits")
    .optional()
    .or(z.literal("")),
  currentPassword: z.string().optional().or(z.literal("")),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) return false;
  return true;
}, {
  message: "Current password is required to set a new password",
  path: ["currentPassword"],
});

export default function Profile() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [changePassword, setChangePassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmUsername, setDeleteConfirmUsername] = useState("");
  
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      phone: user?.phone || "",
      currentPassword: "",
      newPassword: "",
    },
  });

  const roleBadgeColor = {
    ADMIN: "purple",
    PROCUREMENT_OFFICER: "blue",
    VENDOR: "orange",
    MANAGER: "green",
  };

  const baseUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
  const avatarUrl = user?.avatar ? `${baseUrl}${user.avatar}` : null;

  const handleEdit = () => {
    setEditing(true);
    setSuccess("");
    setServerError("");
    reset({
      name: user?.name || "",
      username: user?.username || "",
      phone: user?.phone || "",
      currentPassword: "",
      newPassword: "",
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setChangePassword(false);
    setServerError("");
    reset();
  };

  const onSubmit = async (data) => {
    try {
      setServerError("");
      setSuccess("");

      const payload = {
        name: data.name,
        username: data.username,
        phone: data.phone,
      };

      if (changePassword && data.currentPassword && data.newPassword) {
        payload.currentPassword = data.currentPassword;
        payload.newPassword = data.newPassword;
      }

      await updateProfile(payload);

      // Refresh user data in context & localStorage
      const meRes = await getMe();
      localStorage.setItem("user", JSON.stringify(meRes.data.data.user));
      window.location.reload();
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Failed to update profile."
      );
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setServerError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setServerError("Image size must be less than 5MB.");
      return;
    }

    try {
      setUploading(true);
      setServerError("");
      setSuccess("");
      
      const formData = new FormData();
      formData.append("avatar", file);

      await uploadAvatar(formData);

      const meRes = await getMe();
      localStorage.setItem("user", JSON.stringify(meRes.data.data.user));
      setSuccess("Profile photo updated successfully!");
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      setServerError("");
      await deleteProfile();
      logout();
      window.location.href = "/login";
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to delete account.");
      setConfirmDelete(false);
      setDeleteConfirmUsername("");
    } finally {
      setDeleting(false);
    }
  };

  const fields = [
    { label: "Full Name", value: user?.name, icon: User },
    { label: "Username", value: user?.username ? `@${user.username}` : "Not set", icon: User },
    { label: "Email", value: user?.email, icon: Mail },
    { label: "Phone", value: user?.phone || "Not provided", icon: Phone },
    { label: "Member Since", value: formatDate(user?.createdAt), icon: Calendar },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500 mt-1">Your account information</p>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Pencil className="w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Success/Error messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}
      {serverError && !editing && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {serverError}
        </div>
      )}

      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* View Mode */}
      {!editing && (
        <>
          <Card>
            <CardHeader className="flex items-center gap-6">
              <div 
                onClick={handleAvatarClick}
                className="relative group w-20 h-20 rounded-full overflow-hidden cursor-pointer shadow-inner bg-gray-100 flex items-center justify-center border-2 border-white ring-2 ring-primary-500/20 transition-all duration-300"
                title="Click to change photo"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                ) : avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={user?.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-primary-700 font-bold text-2xl">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
                
                {!uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge color={roleBadgeColor[user?.role] || "gray"}>
                    <Shield className="w-3 h-3 mr-1" />
                    {user?.role}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardBody className="space-y-4">
              {fields.map((field, idx) => {
                const Icon = field.icon;
                return (
                  <div key={idx} className="flex items-center gap-4 py-2">
                    <div className="p-2 rounded-lg bg-gray-50">
                      <Icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{field.label}</p>
                      <p className="text-sm font-medium text-gray-900">{field.value}</p>
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 bg-red-50/35">
            <CardHeader className="flex items-center gap-2 pb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-950">Danger Zone</h3>
            </CardHeader>
            <CardBody>
              {!confirmDelete ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-red-950">Delete Account</h4>
                    <p className="text-xs text-red-700/80 mt-1">
                      Permanently delete your account. This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => setConfirmDelete(true)}
                    className="sm:self-center"
                  >
                    Delete Account
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800 font-medium">
                      Are you absolutely sure you want to delete your account?
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      This will delete your personal info, custom configurations, and sign-in credentials permanently.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-red-950">
                      To confirm deletion, please type your username <span className="font-mono bg-red-100 px-1.5 py-0.5 rounded text-red-900 border border-red-200">{user?.username}</span>:
                    </label>
                    <Input
                      type="text"
                      value={deleteConfirmUsername}
                      onChange={(e) => setDeleteConfirmUsername(e.target.value)}
                      placeholder="Type your username to confirm"
                      className="w-full text-sm border-red-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="danger"
                      loading={deleting}
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmUsername !== user?.username || deleting}
                    >
                      Yes, Delete Account
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setConfirmDelete(false);
                        setDeleteConfirmUsername("");
                      }}
                      disabled={deleting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}

      {/* Edit Mode */}
      {editing && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </CardHeader>

          <CardBody>
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                <div 
                  onClick={handleAvatarClick}
                  className="relative group w-16 h-16 rounded-full overflow-hidden cursor-pointer shadow-inner bg-gray-100 flex items-center justify-center border border-gray-200"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary-700 font-bold text-lg">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <button 
                    type="button"
                    onClick={handleAvatarClick}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Change photo
                  </button>
                  <p className="text-xs text-gray-500 mt-0.5">JPG, PNG or WEBP. Max 5MB.</p>
                </div>
              </div>

              <Input
                label="Full Name"
                type="text"
                placeholder="Your name"
                icon={User}
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="Username"
                type="text"
                placeholder="username"
                icon={User}
                error={errors.username?.message}
                {...register("username")}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm pl-10 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
              </div>

              <Input
                label="Phone"
                type="tel"
                placeholder="9876543210"
                icon={Phone}
                error={errors.phone?.message}
                {...register("phone")}
              />

              <div className="border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setChangePassword(!changePassword)}
                  className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  {changePassword ? "Cancel password change" : "Change password"}
                </button>
              </div>

              {changePassword && (
                <div className="space-y-4 animate-slide-up">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="Enter current password"
                    icon={Lock}
                    error={errors.currentPassword?.message}
                    {...register("currentPassword")}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Min 6 characters"
                    icon={Lock}
                    error={errors.newPassword?.message}
                    {...register("newPassword")}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={isSubmitting}>
                  <Check className="w-4 h-4" />
                  Save Changes
                </Button>
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
