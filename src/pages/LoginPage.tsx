import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import { auth, GoogleAuthProvider, signInWithPopup } from "../configs/firebaseConfig";
import AuthService from "@/services/AuthService";
import OrderService from "@/services/OrderService";
import OrderDetailService from "@/services/OrderDetailService";
import { getLandingPathByRole } from "@/utils/roleRedirect";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Đăng nhập với Google
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();
      await AuthService.googleLogin(token); // Gọi service để lưu token và account

      const accountStr = localStorage.getItem('account');
      if (accountStr) {
        const account = JSON.parse(accountStr);
        const orderId = await (await OrderService.getByAccountId(account.id)).find((o: any) => o.status === 1);
        if (orderId) {
          const amount = await OrderDetailService.countAmount(orderId.id);
          localStorage.setItem('amount', amount.toString());
        }
      }

      const path = await getLandingPathByRole();
      navigate(path, { replace: true });
      window.location.reload(); // Reload to ensure state is updated
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  // Đăng nhập với Facebook
  const handleFacebookLogin = async () => {
    window.alert("Chức năng đăng nhập Facebook đang được phát triển.");
  };

  // Đăng nhập với tài khoản hệ thống
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await AuthService.login({ username, password });

      const accountStr = localStorage.getItem('account');
      if (accountStr) {
        const account = JSON.parse(accountStr);
        const orderId = await (await OrderService.getByAccountId(account.id)).find((o: any) => o.status === 1);
        if (orderId) {
          const amount = await OrderDetailService.countAmount(orderId.id);
          localStorage.setItem('amount', amount.toString());
        }
      }


      const path = await getLandingPathByRole();
      navigate(path, { replace: true });
      window.location.reload(); // Reload to ensure state is updated

    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  relative overflow-hidden">
      {/* Decorative cloud elements */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/40 blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white/40 blur-xl"></div>
      <div className="absolute top-1/4 right-1/4 w-24 h-24 rounded-full bg-white/30 blur-lg"></div>
      <div className="absolute bottom-1/3 left-1/3 w-20 h-20 rounded-full bg-white/30 blur-lg"></div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 w-full max-w-md border border-violet-100 relative z-10">
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-center mt-6 mb-2 text-violet-900">Đăng nhập</h1>
        <p className="text-center text-violet-600 mb-6">Hãy nhập thông tin của bạn để đăng nhập</p>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-medium text-violet-700">Tên đăng nhập</Label>
            <Input
              id="username"
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none transition duration-150 border-violet-200 bg-violet-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-violet-700">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pr-10 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none transition duration-150 border-violet-200 bg-violet-50/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-violet-500 hover:text-violet-700 transition-colors duration-150"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-violet-600 hover:text-violet-800 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <Button className="w-full bg-violet-500 hover:bg-violet-600 text-white transition duration-200 shadow-md hover:shadow-lg" type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-violet-200"></div>
          <span className="mx-4 text-sm text-violet-500 whitespace-nowrap">hoặc đăng nhập bằng</span>
          <div className="flex-grow h-px bg-violet-200"></div>
        </div>

        <div className="flex space-x-4">
          <Button
            variant="outline"
            className="flex-1 bg-white text-gray-800 border border-violet-200 hover:bg-violet-50 transition duration-150"
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="mr-2 text-lg" /> Google
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-white text-gray-800 border border-violet-200 hover:bg-violet-50 transition duration-150"
            onClick={handleFacebookLogin}
          >
            <FaFacebook className="mr-2 text-lg text-blue-600" /> Facebook
          </Button>
        </div>

        <p className="text-center text-sm text-violet-600 mt-6">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-violet-700 font-medium hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;