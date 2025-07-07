import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import AuthService from "@/services/AuthService";

const ResetPasswordConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (message) {
      // Navigate to login page after 2 seconds to allow user to see success message
      const timer = setTimeout(() => {
        navigate("/login");
      }, 2000);
      return () => clearTimeout(timer); // Cleanup timer on component unmount
    }
  }, [message, navigate]);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError("Invalid or missing token.");
      setIsLoading(false);
      return;
    }

    try {
      await AuthService.resetPassword(token, newPassword);
      setMessage("Password reset successfully. Navigating to login page...");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to reset password. The token may be invalid or expired.";
      setError(errorMessage);
      console.error("Reset Password Error:", err.response?.data, err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/40 blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white/40 blur-xl"></div>
      <div className="absolute top-1/4 right-1/4 w-24 h-24 rounded-full bg-white/30 blur-lg"></div>
      <div className="absolute bottom-1/3 left-1/3 w-20 h-20 rounded-full bg-white/30 blur-lg"></div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 w-full max-w-md border border-violet-100 relative z-10">
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 11c0 1.104-.896 2-2 2s-2-.896-2-2 2-4 2-4 2 2.896 2 4zm0 0c0 1.104-.896 2-2 2s-2-.896-2-2m0 0c0-1.104.896-2 2-2s2 .896 2 2zm0 0v6m-8 3h16"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-center mt-6 mb-2 text-violet-900">Set New Password</h1>
        <p className="text-center text-violet-600 mb-6">Enter your new password below</p>

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-sm font-medium text-violet-700">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none transition duration-150 border-violet-200 bg-violet-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-violet-700">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none transition duration-150 border-violet-200 bg-violet-50/50"
            />
          </div>

          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-violet-500 hover:bg-violet-600 text-white transition duration-200 shadow-md hover:shadow-lg"
            disabled={isLoading || !token}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <p className="text-center text-sm text-violet-600 mt-6">
          Back to{" "}
          <Link to="/login" className="text-violet-700 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordConfirmPage;