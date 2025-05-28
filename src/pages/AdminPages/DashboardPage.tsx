import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUp,
  Clock,
  TrendingUp,
  User,
  Package,
  CreditCard,
} from "lucide-react";

const lineChartData = [
  { day: "T2", sales: 800, orders: 700 },
  { day: "T3", sales: 750, orders: 850 },
  { day: "T4", sales: 620, orders: 680 },
  { day: "T5", sales: 980, orders: 900 },
  { day: "T6", sales: 450, orders: 400 },
  { day: "T7", sales: 880, orders: 860 },
  { day: "CN", sales: 720, orders: 740 },
];

const pieChartData = [
  { name: "Charm", value: 35 },
  { name: "Beaded", value: 25 },
  { name: "Cuff", value: 20 },
  { name: "Chain", value: 20 },
];

const COLORS = ["#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

const topProducts = [
  { name: "Vòng tay đá phong thủy", sales: 2345, price: "899.000đ" },
  { name: "Vòng tay hoàng hôn vàng", sales: 1822, price: "1.199.000đ" },
  { name: "Vòng tay bohemian", sales: 1458, price: "699.000đ" },
  { name: "Vòng tay hơi thở biển", sales: 1203, price: "849.000đ" },
];

const recentOrders = [
  { name: "Nguyễn Thị An", time: "2 phút trước", price: "1.799.000đ" },
  { name: "Trần Văn Bình", time: "15 phút trước", price: "849.000đ" },
  { name: "Lê Minh Châu", time: "45 phút trước", price: "699.000đ" },
  { name: "Phạm Đức Duy", time: "1 giờ trước", price: "1.299.000đ" },
];

const AnimatedSection = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const AdminDashboard = () => {
  return (
    <ScrollArea className="p-6 space-y-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-lg border-0 bg-gray-100 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 pb-12 -top-6 relative">
                <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-indigo-400/20"></div>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Tổng doanh thu
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-4 -mt-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-2xl font-bold text-gray-800">2.987.520.000đ</p>
                  <div className="flex items-center text-green-500 text-sm font-medium mt-1">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>12.5% so với tuần trước</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg border-0 bg-gray-100 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-rose-500 p-4 pb-12 -top-6 relative">
                <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-indigo-400/20"></div>
                <CardTitle className="text-white flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Tổng đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-4 -mt-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-2xl font-bold text-gray-800">3,502</p>
                  <div className="flex items-center text-green-500 text-sm font-medium mt-1">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>8.2% so với tuần trước</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg border-0 bg-gray-100 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 pb-12 -top-6 relative">
                <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-blue-400/20"></div>
                <CardTitle className="text-white flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-4 -mt-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-2xl font-bold text-gray-800">1,205</p>
                  <div className="flex items-center text-green-500 text-sm font-medium mt-1">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>15.3% so với tuần trước</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg border-0 bg-gray-100 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 pb-12 -top-6 relative">
                <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-emerald-400/20"></div>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Tăng trưởng
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-4 -mt-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-2xl font-bold text-gray-800">23.5%</p>
                  <div className="flex items-center text-green-500 text-sm font-medium mt-1">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>5.2% so với tuần trước</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>

        {/* Charts Row */}
        <AnimatedSection>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Sales Overview Card */}
            <Card className="lg:col-span-2 shadow-lg border-0 bg-gray-100 backdrop-blur-sm rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row justify-between items-center border-b p-6">
                <div>
                  <CardTitle className="text-gray-800 font-bold text-lg">Tổng quan doanh số</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Biểu đồ thể hiện doanh số và đơn hàng theo tuần</p>
                </div>
                <div className="flex space-x-2">
                  <Select>
                    <SelectTrigger className="w-28 bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Tuần này" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Tuần này</SelectItem>
                      <SelectItem value="last-week">Tuần trước</SelectItem>
                      <SelectItem value="month">Tháng này</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-24 bg-gray-50 border-gray-200">
                      <SelectValue placeholder="2024" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <XAxis 
                        dataKey="day" 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: '#E5E7EB' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: '#E5E7EB' }}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          fontSize: '14px'
                        }}
                        itemStyle={{ color: '#6B7280' }}
                        labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#8B5CF6" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#8B5CF6', strokeWidth: 0 }} 
                        name="Doanh số"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#EC4899" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#EC4899', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#EC4899', strokeWidth: 0 }} 
                        name="Đơn hàng"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-sm font-medium text-gray-600">Doanh số</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                    <span className="text-sm font-medium text-gray-600">Đơn hàng</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Products Card */}
            <Card className="shadow-lg border-0 bg-gray-100 backdrop-blur-sm rounded-xl overflow-hidden">
              <CardHeader className="border-b p-6">
                <CardTitle className="text-gray-800 font-bold text-lg">Sản phẩm bán chạy</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Top 4 sản phẩm bán chạy nhất</p>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-gray-100">
                  {topProducts.map((item, index) => (
                    <li key={index} className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-4 
                          ${index === 0 ? 'bg-purple-100 text-purple-600' : 
                            index === 1 ? 'bg-indigo-100 text-indigo-600' :
                            index === 2 ? 'bg-emerald-100 text-emerald-600' :
                            'bg-amber-100 text-amber-600'}`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.sales.toLocaleString()} lượt bán</p>
                        </div>
                      </div>
                      <span className="font-bold text-indigo-600">{item.price}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>

        {/* Bottom Row */}
        <AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Recent Orders Card */}
            <Card className="shadow-lg border-0 bg-gray-100 backdrop-blur-sm rounded-xl overflow-hidden">
              <CardHeader className="border-b p-6">
                <CardTitle className="text-gray-800 font-bold text-lg">Đơn hàng gần đây</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Các đơn hàng mới nhất</p>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-gray-100">
                  {recentOrders.map((order, index) => (
                    <li key={index} className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mr-4 overflow-hidden">
                          <User className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{order.name}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {order.time}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-green-600">{order.price}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Product Categories Card */}
            <Card className="shadow-lg border-0 bg-gray-100 backdrop-blur-sm rounded-xl overflow-hidden">
              <CardHeader className="border-b p-6">
                <CardTitle className="text-gray-800 font-bold text-lg">Phân loại vòng tay</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Phân bổ doanh số theo các dòng sản phẩm chính
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                        paddingAngle={2}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        // labelStyle={{
                        //   fontSize: '12px',
                        //   fontWeight: 'bold',
                        //   fill: '#4B5563'
                        // }}
                      >
                        {pieChartData.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}

                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Tỷ lệ']}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {pieChartData.map((entry, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium text-gray-600">
                          {entry.name}: <span className="font-bold">{entry.value}%</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>
      </div>
    </ScrollArea>
  );
};

export default AdminDashboard;