import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import { auth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "../configs/firebaseConfig";
import AuthService from "@/services/AuthService";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State cho form
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleRegister = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      await AuthService.googleLogin(token); // Gọi service để lưu token và account
      navigate("/"); // Chuyển hướng về trang chính sau khi đăng nhập thành công
      window.location.reload();
    } catch (error) {
      console.error("Google Register Error:", error);
    }
  };

  const handleFacebookRegister = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      console.log("Facebook Register Success:", result.user);
      console.log("JWT Token:", token);
    } catch (error) {
      console.error("Facebook Register Error:", error);
    }
  };

  // Hàm xử lý đăng ký
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName || !username || !phone || !email || !password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    try {
      // Gọi API đăng ký
      await AuthService.signup({
        fullName,
        password,
        username,
        phone,
        email,
        roleId: 0,
        status: 1,
      });
      // Hiển thị alert thông báo đăng ký thành công
      window.alert("Đăng ký thành công!");
      navigate("/login");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative cloud elements */}
      <div className="absolute top-20 left-20 w-36 h-36 rounded-full bg-white/40 blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-white/40 blur-xl"></div>
      <div className="absolute top-1/3 right-1/3 w-28 h-28 rounded-full bg-white/30 blur-lg"></div>
      <div className="absolute bottom-1/4 left-1/4 w-24 h-24 rounded-full bg-white/30 blur-lg"></div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 w-full max-w-md border border-violet-100 relative z-10">
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-center mt-6 mb-2 text-violet-900">Đăng ký</h1>
        <p className="text-center text-violet-600 mb-6">Tạo tài khoản để bắt đầu hành trình của bạn</p>

        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm font-medium text-violet-700">Họ và tên</Label>
            <Input 
              id="fullName" 
              type="text" 
              placeholder="Nhập họ và tên của bạn" 
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none transition duration-150 border-violet-200 bg-violet-50/50"
            />
          </div>

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
            <Label htmlFor="phone" className="text-sm font-medium text-violet-700">Số điện thoại</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="Số điện thoại" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none transition duration-150 border-violet-200 bg-violet-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-violet-700">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Nhập email của bạn" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none transition duration-150 border-violet-200 bg-violet-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-violet-700">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
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

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-violet-700">Xác nhận mật khẩu</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="pr-10 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none transition duration-150 border-violet-200 bg-violet-50/50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-violet-500 hover:text-violet-700 transition-colors duration-150"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {success && (
            <div className="text-green-600 text-sm text-center">{success}</div>
          )}

          <div className="pt-2">
            <Button
              className="w-full bg-violet-500 hover:bg-violet-600 text-white transition duration-200 shadow-md hover:shadow-lg h-11"
              type="submit"
              disabled={loading}
            >
              {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
            </Button>
          </div>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-violet-200"></div>
          <span className="mx-4 text-sm text-violet-500 whitespace-nowrap">hoặc đăng ký bằng</span>
          <div className="flex-grow h-px bg-violet-200"></div>
        </div>

        <div className="flex space-x-4">
          <Button
            variant="outline"
            className="flex-1 bg-white text-gray-800 border border-violet-200 hover:bg-violet-50 transition duration-150"
            onClick={handleGoogleRegister}
          >
            <FcGoogle className="mr-2 text-lg" /> Google
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-white text-gray-800 border border-violet-200 hover:bg-violet-50 transition duration-150"
            onClick={handleFacebookRegister}
          >
            <FaFacebook className="mr-2 text-lg text-blue-600" /> Facebook
          </Button>
        </div>

        <p className="text-center text-sm text-violet-600 mt-6">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-violet-700 font-medium hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;