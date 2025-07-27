import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaFacebook, FaInstagram, FaClock } from 'react-icons/fa';
import FeedbackService from '@/services/FeedbackService';

const Contact: React.FC = () => {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Lấy thông tin user từ localStorage khi component mount
  useEffect(() => {
    const accountData = localStorage.getItem('account');
    if (accountData) {
      try {
        const account = JSON.parse(accountData);
        if (account.fullName) {
          setUserName(account.fullName);
        }
        if (account.email) {
          setUserEmail(account.email);
        }
      } catch (error) {
        console.error('Error parsing account data from localStorage:', error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userEmail || !userName || !subject || !content) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    setIsLoading(true);
    
    try {
      await FeedbackService.send({
        userEmail,
        userName,
        subject,
        content
      });
      
      alert('Cảm ơn bạn đã gửi tin nhắn! Chúng tôi sẽ phản hồi sớm nhất có thể.');
      
      // Reset form
      setUserEmail('');
      setUserName('');
      setSubject('');
      setContent('');
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
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
                  <a href="mailto:pulserasvietnamm@gmail.com" className="text-blue-600 hover:text-blue-700 transition">
                    pulserasvietnamm@gmail.com
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
              <a
                href="https://www.facebook.com/profile.php?id=61577138272493"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-4 rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <FaFacebook className="text-2xl text-blue-600" />
              </a>
              <a href="https://www.instagram.com/pulserasvnn/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-4 rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                <FaInstagram className="text-2xl text-violet-600" />
              </a>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="p-8 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-green-200">Gửi Tin Nhắn</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                id="userName"
                placeholder="Nguyễn Văn A"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                disabled={!!userName && !!localStorage.getItem('account')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {!!userName && !!localStorage.getItem('account') && (
                <p className="text-sm text-gray-500 mt-1">Thông tin từ tài khoản đã đăng nhập</p>
              )}
            </div>

            <div>
              <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email của bạn
              </label>
              <input
                type="email"
                id="userEmail"
                placeholder="your@email.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
                disabled={!!userEmail && !!localStorage.getItem('account')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {!!userEmail && !!localStorage.getItem('account') && (
                <p className="text-sm text-gray-500 mt-1">Thông tin từ tài khoản đã đăng nhập</p>
              )}
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Chủ đề
              </label>
              <input
                type="text"
                id="subject"
                placeholder="Tôi muốn hỏi về sản phẩm..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung tin nhắn
              </label>
              <textarea
                id="content"
                rows={5}
                placeholder="Xin chào Pulseras, tôi muốn..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang gửi...' : 'Gửi Tin Nhắn'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Contact;   