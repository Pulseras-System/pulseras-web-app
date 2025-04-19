import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaHandsHelping, FaPaintBrush, FaRecycle, FaUsers } from 'react-icons/fa';

const AboutUs: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Về Chúng Tôi</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Khám phá câu chuyện đằng sau những chiếc vòng tay thủ công độc đáo của Pulseras
        </p>
      </div>

      {/* Introduction Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2 border-blue-200">Giới Thiệu Về Pulseras</h2>
        <div className="space-y-4">
          <p className="text-lg text-gray-700 leading-relaxed">
            Pulseras là thương hiệu chuyên cung cấp các sản phẩm vòng tay thủ công, được tạo ra từ tình yêu và niềm đam mê nghệ thuật. Chúng tôi tin rằng mỗi sản phẩm vòng tay mang đậm dấu ấn cá nhân, không chỉ là món đồ trang sức mà còn là một câu chuyện, một biểu tượng của những kỷ niệm quý giá.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Với đội ngũ thợ thủ công tài năng và sự sáng tạo không ngừng, Pulseras cam kết mang đến những sản phẩm vòng tay tinh tế, độc đáo và chất lượng. Chúng tôi luôn nỗ lực cải tiến quy trình sản xuất và bảo vệ môi trường thông qua việc sử dụng nguyên liệu bền vững.
          </p>
        </div>
      </Card>

      {/* Vision & Mission Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Vision Card */}
        <Card className="p-6 rounded-xl border-l-4 border-blue-500 hover:shadow-lg transition-all">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaPaintBrush className="text-2xl text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Tầm Nhìn Của Pulseras</h2>
              <p className="text-gray-700 leading-relaxed">
                Tầm nhìn của chúng tôi là trở thành một trong những thương hiệu vòng tay thủ công hàng đầu, nơi mỗi khách hàng có thể tìm thấy sản phẩm phù hợp với phong cách và câu chuyện riêng của mình.
              </p>
            </div>
          </div>
        </Card>

        {/* Mission Card */}
        <Card className="p-6 rounded-xl border-l-4 border-green-500 hover:shadow-lg transition-all">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <FaRecycle className="text-2xl text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Sứ Mệnh Của Pulseras</h2>
              <p className="text-gray-700 leading-relaxed">
                Sứ mệnh của chúng tôi là đem lại những sản phẩm chất lượng, độc đáo, và thân thiện với môi trường. Mỗi chiếc vòng tay được tạo ra là một phần trong việc bảo vệ thiên nhiên.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Core Values Card */}
      <Card className="p-8 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2 border-purple-200">Giá Trị Cốt Lõi Của Pulseras</h2>
        <ul className="grid sm:grid-cols-2 gap-6">
          <li className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-100 p-2 rounded-full">
              <FaHandsHelping className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Tinh Thần Sáng Tạo</h3>
              <p className="text-gray-600 text-sm mt-1">Khuyến khích sự sáng tạo và đổi mới trong từng sản phẩm</p>
            </div>
          </li>
          <li className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-100 p-2 rounded-full">
              <FaHandsHelping className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Chất Lượng Đỉnh Cao</h3>
              <p className="text-gray-600 text-sm mt-1">Đảm bảo mỗi sản phẩm đều đạt tiêu chuẩn chất lượng cao nhất</p>
            </div>
          </li>
          <li className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-100 p-2 rounded-full">
              <FaHandsHelping className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Bảo Vệ Môi Trường</h3>
              <p className="text-gray-600 text-sm mt-1">Ưu tiên sử dụng nguyên liệu bền vững và tái chế</p>
            </div>
          </li>
          <li className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-100 p-2 rounded-full">
              <FaUsers className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Cộng Đồng</h3>
              <p className="text-gray-600 text-sm mt-1">Xây dựng cộng đồng yêu thích nghệ thuật thủ công</p>
            </div>
          </li>
        </ul>
      </Card>

      {/* CTA Button */}
      <div className="text-center">
        <Button 
          onClick={() => alert('Learn more clicked')} 
          className="mt-6 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          Tìm Hiểu Thêm
        </Button>
      </div>
    </div>
  );
};

export default AboutUs;