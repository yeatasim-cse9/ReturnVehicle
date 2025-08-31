import React from "react";
import { useAuth } from "../context/AuthContext";
import { googleProvider } from "../lib/firebase";
import { setUserRole } from "../services/authApi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";

export default function GoogleButton({
  label = "Continue with Google",
  selectedRole = "user",
}) {
  const { loginGoogle, syncWhoAmI } = useAuth();
  const navigate = useNavigate();

  const handleGoogle = async () => {
    try {
      // ... (your logic remains the same)
      await loginGoogle(googleProvider);
      await setUserRole(selectedRole);
      await syncWhoAmI();

      toast.success(`Signed in as ${selectedRole}`);

      if (selectedRole === "driver") navigate("/driver/dashboard");
      else navigate("/user/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || err?.message || "Google sign-in failed"
      );
    }
  };

  return (
    <button
      onClick={handleGoogle}
      className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-800 hover:bg-slate-50 transition"
      aria-label={label}
      type="button"
    >
      <FaGoogle className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}
