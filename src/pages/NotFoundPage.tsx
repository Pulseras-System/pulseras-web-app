import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import NotFoundGif from "../assets/images/404.gif"; 

const NotFound404: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="max-w-lg w-1/2 text-center p-8 bg-gray-50 shadow-lg">
        <img
          src={NotFoundGif}
          alt="Not Found"
          className="mx-auto mb-4 w-full h-1/2 object-contain"
        />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">404 - Không tìm thấy trang</h1>
        <p className="text-gray-600 mb-6">
          Trang bạn đang tìm kiếm không tồn tại. Có thể đường dẫn đã sai hoặc trang đã bị xóa.
        </p>
        <Button
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md"
        >
          Quay về trang trước
        </Button>
      </Card>
    </div>
  );
};

export default NotFound404;
