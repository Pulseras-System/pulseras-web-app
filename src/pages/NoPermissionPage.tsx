import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import NotFoundGif from "../assets/images/404.gif"; 

const NoPermission: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="max-w-2xl w-full text-center bg-gray-50 p-8 shadow-lg">
        <img
          src={NotFoundGif}
          alt="Not Found"
          className="mx-auto mb-4 w-full h-1/2 object-contain"
        />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Truy cập bị từ chối</h1>
        <p className="text-gray-600 mb-6">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ với quản trị viên nếu bạn nghĩ đây là lỗi.
        </p>
        <Button
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md"
        >
          Quay về trước
        </Button>
      </Card>
    </div>
  );
};

export default NoPermission;
