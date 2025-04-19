import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import { auth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "../configs/firebaseConfig";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleGoogleRegister = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      console.log("Google Register Success:", result.user);
      console.log("JWT Token:", token);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 to-purple-300 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Đăng ký</h1>
        <p className="text-center text-gray-500 mb-6">Tạo tài khoản để bắt đầu hành trình của bạn</p>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input id="fullName" type="text" placeholder="Nhập họ và tên của bạn" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Nhập email của bạn" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button className="w-full bg-red-500 hover:bg-red-600 text-white transition duration-200">
            Tạo tài khoản
          </Button>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="mx-4 text-sm text-gray-500 whitespace-nowrap">hoặc đăng ký bằng</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <div className="flex space-x-4">
          <Button
            variant="outline"
            className="flex-1 bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
            onClick={handleGoogleRegister}
          >
            <FcGoogle className="mr-2 text-lg" /> Google
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
            onClick={handleFacebookRegister}
          >
            <FaFacebook className="mr-2 text-lg text-blue-600" /> Facebook
          </Button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-red-500 font-medium hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
