import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter, FaClock } from 'react-icons/fa';

const Contact: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email:', email);
    console.log('Message:', message);
    alert('Cảm ơn bạn đã gửi tin nhắn! Chúng tôi sẽ phản hồi sớm nhất có thể.');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Liên Hệ Với Pulseras</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy kết nối với chúng tôi qua các kênh dưới đây.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Contact Information */}
        <div className="space-y-8">
          <Card className="p-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-blue-200">Thông Tin Liên Hệ</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaEnvelope className="text-xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Email</h3>
                  <a href="mailto:support@pulseras.com" className="text-blue-600 hover:text-blue-700 transition">
                    support@pulseras.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaPhoneAlt className="text-xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Điện thoại</h3>
                  <a href="tel:+84123456789" className="text-blue-600 hover:text-blue-700 transition">
                    +84 123 456 789
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaMapMarkerAlt className="text-xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Địa chỉ</h3>
                  <p className="text-gray-600">
                    Số 123, Đường ABC, Quận 1, TP.HCM, Việt Nam
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaClock className="text-xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Giờ làm việc</h3>
                  <p className="text-gray-600">
                    Thứ Hai - Thứ Sáu: 9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Social Media */}
          <Card className="p-8 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-purple-200">Theo Dõi Chúng Tôi</h2>
            <p className="text-gray-700 mb-6">
              Kết nối với chúng tôi trên mạng xã hội để cập nhật những sản phẩm mới nhất và ưu đãi đặc biệt:
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="bg-white p-4 rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                <FaFacebook className="text-2xl text-blue-600" />
              </a>
              <a href="#" className="bg-white p-4 rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                <FaInstagram className="text-2xl text-violet-600" />
              </a>
              <a href="#" className="bg-white p-4 rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                <FaTwitter className="text-2xl text-violet-500" />
              </a>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="p-8 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-green-200">Gửi Tin Nhắn</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email của bạn
              </label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Tin nhắn
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="Xin chào Pulseras, tôi muốn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]"
            >
              Gửi Tin Nhắn
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Contact;   