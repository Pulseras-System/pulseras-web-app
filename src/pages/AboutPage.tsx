import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaHandsHelping, FaPaintBrush, FaRecycle, FaUsers } from 'react-icons/fa'; // Import react-icons

const AboutUs: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <Card title="Giới Thiệu Về Pulseras">
        <p className="text-lg text-gray-700 mb-4 leading-relaxed">
          Pulseras là thương hiệu chuyên cung cấp các sản phẩm vòng tay thủ công, được tạo ra từ tình yêu và niềm đam mê nghệ thuật. Chúng tôi tin rằng mỗi sản phẩm vòng tay mang đậm dấu ấn cá nhân, không chỉ là món đồ trang sức mà còn là một câu chuyện, một biểu tượng của những kỷ niệm quý giá.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
          Với đội ngũ thợ thủ công tài năng và sự sáng tạo không ngừng, Pulseras cam kết mang đến những sản phẩm vòng tay tinh tế, độc đáo và chất lượng. Chúng tôi luôn nỗ lực cải tiến quy trình sản xuất và bảo vệ môi trường thông qua việc sử dụng nguyên liệu bền vững.
        </p>
      </Card>

      <Card title="Tầm Nhìn Của Pulseras">
        <div className="flex items-center space-x-4">
          <FaPaintBrush className="text-3xl text-blue-600" />
          <p className="text-lg text-gray-700 leading-relaxed">
            Tầm nhìn của chúng tôi là trở thành một trong những thương hiệu vòng tay thủ công hàng đầu, nơi mỗi khách hàng có thể tìm thấy sản phẩm phù hợp với phong cách và câu chuyện riêng của mình. Chúng tôi muốn kết nối những người yêu thích nghệ thuật thủ công, chia sẻ niềm đam mê và tạo ra những sản phẩm mang ý nghĩa sâu sắc.
          </p>
        </div>
      </Card>

      <Card title="Sứ Mệnh Của Pulseras">
        <div className="flex items-center space-x-4">
          <FaRecycle className="text-3xl text-green-600" />
          <p className="text-lg text-gray-700 leading-relaxed">
            Sứ mệnh của chúng tôi là đem lại những sản phẩm chất lượng, độc đáo, và thân thiện với môi trường. Mỗi chiếc vòng tay được tạo ra không chỉ mang giá trị thẩm mỹ mà còn là một phần trong việc bảo vệ thiên nhiên. Chúng tôi cam kết phát triển sản phẩm từ nguyên liệu tái chế, giảm thiểu tác động tiêu cực lên môi trường.
          </p>
        </div>
      </Card>

      <Card title="Giá Trị Cốt Lõi Của Pulseras">
        <ul className="list-disc pl-6 space-y-3 text-lg text-gray-700">
          <li><FaHandsHelping className="inline-block text-blue-600 mr-2" /> <strong>Tinh Thần Sáng Tạo:</strong> Chúng tôi khuyến khích sự sáng tạo và đổi mới trong từng sản phẩm.</li>
          <li><FaHandsHelping className="inline-block text-blue-600 mr-2" /> <strong>Chất Lượng Đỉnh Cao:</strong> Chúng tôi đảm bảo mỗi sản phẩm đều đạt tiêu chuẩn chất lượng cao nhất.</li>
          <li><FaHandsHelping className="inline-block text-blue-600 mr-2" /> <strong>Bảo Vệ Môi Trường:</strong> Chúng tôi ưu tiên sử dụng nguyên liệu bền vững và tái chế.</li>
          <li><FaUsers className="inline-block text-blue-600 mr-2" /> <strong>Cộng Đồng:</strong> Pulseras không chỉ là sản phẩm, mà là một cộng đồng yêu thích nghệ thuật thủ công.</li>
        </ul>
      </Card>

      <Button onClick={() => alert('Learn more clicked')} className="mt-6 w-full sm:w-auto mx-auto bg-blue-600 hover:bg-blue-700 shadow-md text-white py-3 px-6 rounded-lg transition duration-300">
        Tìm Hiểu Thêm
      </Button>
    </div>
  );
};

export default AboutUs;
