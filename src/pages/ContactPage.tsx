import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa'; // Import react-icons

const Contact: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    console.log('Email:', email);
    console.log('Message:', message);
    alert('Cảm ơn bạn đã gửi tin nhắn!');
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <Card title="Liên Hệ Với Chúng Tôi">
        <p className="text-lg text-gray-700 mb-4 leading-relaxed">
          Chúng tôi luôn sẵn sàng hỗ trợ bạn trong mọi vấn đề liên quan đến sản phẩm và dịch vụ của Pulseras. Bạn có thể liên hệ với chúng tôi qua các kênh dưới đây hoặc gửi tin nhắn trực tiếp cho chúng tôi.
        </p>
      </Card>

      <Card title="Thông Tin Liên Hệ">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <FaEnvelope className="text-2xl text-blue-600" />
            <p className="text-lg text-gray-700">
              <strong>Email:</strong> support@pulseras.com
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <FaPhoneAlt className="text-2xl text-blue-600" />
            <p className="text-lg text-gray-700">
              <strong>Điện thoại:</strong> +84 123 456 789
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <FaMapMarkerAlt className="text-2xl text-blue-600" />
            <p className="text-lg text-gray-700">
              <strong>Địa chỉ:</strong> Số 123, Đường ABC, Quận 1, TP.HCM, Việt Nam
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-lg text-gray-700">
              <strong>Giờ làm việc:</strong> Thứ Hai - Thứ Sáu: 9:00 AM - 6:00 PM
            </p>
          </div>
        </div>
      </Card>

      <Card title="Gửi Tin Nhắn Cho Chúng Tôi">
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border-none bg-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Nhập tin nhắn của bạn"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-4 border-none bg-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleSubmit} className="mt-4 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 shadow-md text-white py-3 px-6 rounded-lg transition duration-300">
            Gửi Tin Nhắn
          </Button>
        </div>
      </Card>

      <Card title="Theo Dõi Chúng Tôi">
        <p className="text-lg text-gray-700">
          Hãy theo dõi chúng tôi trên các kênh mạng xã hội để cập nhật những sản phẩm mới nhất và các chương trình khuyến mãi đặc biệt:
        </p>
        <ul className="list-none flex justify-evenly p-0 mt-4 space-y-3">
          <li><a href="#" className="text-blue-600 hover:text-blue-700 transition duration-300"><FaFacebook className="inline-block mr-2" /> Facebook</a></li>
          <li><a href="#" className="text-blue-600 hover:text-blue-700 transition duration-300"><FaInstagram className="inline-block mr-2" /> Instagram</a></li>
          <li><a href="#" className="text-blue-600 hover:text-blue-700 transition duration-300"><FaTwitter className="inline-block mr-2" /> Twitter</a></li>
        </ul>
      </Card>
    </div>
  );
};

export default Contact;
