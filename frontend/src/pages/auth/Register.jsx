import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { registerSchema } from "../../validations/authSchema";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function Register() {
  const [serverError, setServerError] = useState("");
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = data;
      await registerUser(userData);
      navigate("/dashboard");
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
      <p className="text-gray-500 mb-6">Get started with your free account</p>

      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={User}
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Username"
          type="text"
          placeholder="username"
          icon={User}
          error={errors.username?.message}
          {...register("username")}
        />

        <Input
          label="Phone (optional)"
          type="tel"
          placeholder="9876543210"
          icon={Phone}
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Min 6 characters"
          icon={Lock}
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter password"
          icon={Lock}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" loading={isSubmitting} className="w-full">
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
