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
import { useEffect, useState } from "react";
import OrderService, { Order } from "../../services/OrderService";
import AccountService from "@/services/AccountService";
import ProductService, { Product } from "@/services/ProductService";

const COLORS = ["#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

const topProducts = [
  { name: "Vòng tay đá phong thủy", sales: 2345, price: "899.000đ" },
  { name: "Vòng tay hoàng hôn vàng", sales: 1822, price: "1.199.000đ" },
  { name: "Vòng tay bohemian", sales: 1458, price: "699.000đ" },
  { name: "Vòng tay hơi thở biển", sales: 1203, price: "849.000đ" },
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
  // State cho tổng doanh thu
  const [revenue, setRevenue] = useState<{
    totalRevenue: number;
    percentChange: number;
    isIncrease: boolean;
  } | null>(null);

  // State cho tổng đơn hàng
  const [totalOrders, setTotalOrders] = useState<{
    totalOrders: number;
    percentChange: number;
    isIncrease: boolean;
  } | null>(null);

  // State cho tổng khách hàng
  const [totalCustomers, setTotalCustomers] = useState<{
    totalCustomers: number;
    percentChange: number;
    isIncrease: boolean;
  } | null>(null);

  const [growth, setGrowth] = useState<{
    growthRate: number;
    customerChange: number;
    revenueChange: number;
    isIncrease: boolean;
    orderChange: number;
  } | null>(null);

  // State cho đơn hàng gần đây
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<{ label: string; value: number }[]>([]);
  const [salesFilter, setSalesFilter] = useState<"week" | "month" | "year">("week");
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [topProducts, setTopProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Gọi API lấy tổng doanh thu qua OrderService
    const fetchRevenue = async () => {
      try {
        const data = await OrderService.getRevenue();
        setRevenue({
          totalRevenue: data.totalRevenue,
          percentChange: data.percentChange,
          isIncrease: data.isIncrease,
        });
      } catch (err) {
        setRevenue(null);
      }
    };
    fetchRevenue();

    // Gọi API lấy tổng đơn hàng qua OrderService
    const fetchTotalOrders = async () => {
      try {
        const data = await OrderService.getTotalOrders();
        setTotalOrders({
          totalOrders: data.totalOrders,
          percentChange: data.percentChange,
          isIncrease: data.isIncrease,
        });
      } catch (err) {
        setTotalOrders(null);
      }
    };
    fetchTotalOrders();

    // Gọi API lấy tổng khách hàng qua AccountService
    const fetchTotalCustomers = async () => {
      try {
        const data = await AccountService.getTotalCustomers();
        setTotalCustomers({
          totalCustomers: data.totalCustomers,
          percentChange: data.percentChange,
          isIncrease: data.isIncrease,
        });
      } catch (err) {
        setTotalCustomers(null);
      }
    };
    fetchTotalCustomers();

    // Gọi API lấy thông tin tăng trưởng
    const fetchGrowth = async () => {
      try {
        const data = await OrderService.getGrowth();
        setGrowth(data);
      } catch (err) {
        setGrowth(null);
      }
    };
    fetchGrowth();

    // Gọi API lấy danh sách đơn hàng gần đây (status khác 0 và 1)
    const fetchRecentOrders = async () => {
      try {
        const orders = await OrderService.get();
        // Lọc đơn hàng có status khác 0 (Đã hủy) và 1 (Trong giỏ hàng)
        const filtered = orders
          .filter((o) => o.status !== 0 && o.status !== 1)
          .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime())
          .slice(0, 5); // Lấy 5 đơn hàng mới nhất
        setRecentOrders(filtered);
      } catch (err) {
        setRecentOrders([]);
      }
    };
    fetchRecentOrders();

    // Gọi API lấy top sản phẩm bán chạy
    const fetchTopProducts = async () => {
      try {
        const data = await ProductService.getTopBuyProducts();
        setTopProducts(data);
      } catch {
        setTopProducts([]);
      }
    };
    fetchTopProducts();

    // Gọi API lấy phân loại sản phẩm qua ProductService
    const fetchTypeDistribution = async () => {
      try {
        const data = await ProductService.getTypeDistribution();
        setTypeDistribution(data);
      } catch {
        setTypeDistribution([]);
      }
    };
    fetchTypeDistribution();

    // Lấy dữ liệu tổng quan doanh số theo tuần
    const fetchWeeklyOverview = async () => {
      try {
        const data = await OrderService.getWeeklyOverview();
        // Map API fields to chart fields
        setLineChartData(
          data.map(item => ({
            day: item.day,
            sales: item.revenue,
            orders: item.orderCount,
          }))
        );
      } catch {
        setLineChartData([]);
      }
    };
    fetchWeeklyOverview();
  }, []);

  // Fetch chart data based on filter
  useEffect(() => {
    const fetchChartData = async () => {
      setLoadingChart(true);
      try {
        let data: any[] = [];
        if (salesFilter === "week") {
          data = await OrderService.getWeeklyOverview();
          setLineChartData(
            data.map(item => ({
              day: item.day,
              sales: item.revenue,
              orders: item.orderCount,
            }))
          );
        } else if (salesFilter === "month") {
          data = await OrderService.getMonthlyOverview();
          setLineChartData(
            data.map(item => ({
              day: item.day,
              sales: item.revenue,
              orders: item.orderCount,
            }))
          );
        } else if (salesFilter === "year") {
          data = await OrderService.getYearlyOverview();
          setLineChartData(
            data.map(item => ({
              day: `Th${item.month}`,
              sales: item.revenue,
              orders: item.orderCount,
            }))
          );
        }
      } catch (e) {
        setLineChartData([]);
      }
      setLoadingChart(false);
    };
    fetchChartData();
  }, [salesFilter]);

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
                  <p className="text-2xl font-bold text-gray-800">
                    {revenue
                      ? revenue.totalRevenue.toLocaleString("vi-VN") + "đ"
                      : <span className="text-gray-400">Đang tải...</span>
                    }
                  </p>
                  <div className={`flex items-center text-sm font-medium mt-1 ${revenue
                    ? revenue.isIncrease
                      ? "text-green-500"
                      : "text-red-500"
                    : "text-gray-400"
                    }`}>
                    <ArrowUp
                      className={`h-4 w-4 mr-1 transition-transform ${revenue && !revenue.isIncrease ? "rotate-180" : ""
                        }`}
                    />
                    <span>
                      {revenue
                        ? `${revenue.percentChange}% so với tuần trước`
                        : "Đang tải..."}
                    </span>
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
                  <p className="text-2xl font-bold text-gray-800">
                    {totalOrders
                      ? totalOrders.totalOrders.toLocaleString("vi-VN")
                      : <span className="text-gray-400">Đang tải...</span>
                    }
                  </p>
                  <div className={`flex items-center text-sm font-medium mt-1 ${totalOrders
                    ? totalOrders.isIncrease
                      ? "text-green-500"
                      : "text-red-500"
                    : "text-gray-400"
                    }`}>
                    <ArrowUp
                      className={`h-4 w-4 mr-1 transition-transform ${totalOrders && !totalOrders.isIncrease ? "rotate-180" : ""
                        }`}
                    />
                    <span>
                      {totalOrders
                        ? `${totalOrders.percentChange}% so với tuần trước`
                        : "Đang tải..."}
                    </span>
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
                  <p className="text-2xl font-bold text-gray-800">
                    {totalCustomers
                      ? totalCustomers.totalCustomers.toLocaleString("vi-VN")
                      : <span className="text-gray-400">Đang tải...</span>
                    }
                  </p>
                  <div className={`flex items-center text-sm font-medium mt-1 ${totalCustomers
                    ? totalCustomers.isIncrease
                      ? "text-green-500"
                      : "text-red-500"
                    : "text-gray-400"
                    }`}>
                    <ArrowUp
                      className={`h-4 w-4 mr-1 transition-transform ${totalCustomers && !totalCustomers.isIncrease ? "rotate-180" : ""
                        }`}
                    />
                    <span>
                      {totalCustomers
                        ? `${totalCustomers.percentChange}% so với tuần trước`
                        : "Đang tải..."}
                    </span>
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
                  <p className="text-2xl font-bold text-gray-800">
                    {growth ? `${growth.growthRate.toFixed(1)}%` : <span className="text-gray-400">Đang tải...</span>}
                  </p>
                  <div className={`flex items-center text-sm font-medium mt-1 ${growth
                    ? growth.isIncrease
                      ? "text-green-500"
                      : "text-red-500"
                    : "text-gray-400"
                    }`}>
                    <ArrowUp
                      className={`h-4 w-4 mr-1 transition-transform ${growth && !growth.isIncrease ? "rotate-180" : ""
                        }`}
                    />
                    <span>
                      {growth
                        ? `${growth.growthRate.toFixed(1)}% so với tuần trước`
                        : "Đang tải..."}
                    </span>
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
                  <Select
                    value={salesFilter}
                    onValueChange={val => setSalesFilter(val as "week" | "month" | "year")}
                  >
                    <SelectTrigger className="w-28 bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Tuần này" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Tuần</SelectItem>
                      <SelectItem value="month">Tháng</SelectItem>
                      <SelectItem value="year">Năm</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Year select if needed */}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  {loadingChart ? (
                    <div className="flex items-center justify-center h-full text-gray-400">Đang tải biểu đồ...</div>
                  ) : (
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
                  )}
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
                  {topProducts.length === 0 ? (
                    <li className="p-6 text-center text-gray-500">Đang tải...</li>
                  ) : (
                    topProducts.slice(0, 4).map((item, index) => (
                      <li key={item.productId} className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-4 
                    ${index === 0 ? 'bg-purple-100 text-purple-600' :
                              index === 1 ? 'bg-indigo-100 text-indigo-600' :
                                index === 2 ? 'bg-emerald-100 text-emerald-600' :
                                  'bg-amber-100 text-amber-600'}`}>
                            {index + 1}
                          </div>
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-10 h-10 object-cover rounded-lg mr-4 border"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">{item.productName}</p>
                            <p className="text-sm text-gray-500">{item.quantity.toLocaleString()} lượt bán</p>
                          </div>
                        </div>
                        <span className="font-bold text-indigo-600">
                          {item.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                        </span>
                      </li>
                    ))
                  )}
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
                  {recentOrders.length === 0 ? (
                    <li className="p-6 text-center text-gray-500">Không có đơn hàng gần đây</li>
                  ) : (
                    recentOrders.map((order) => (
                      <li key={order.id} className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mr-4 overflow-hidden">
                            <User className="h-5 w-5 text-indigo-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {order.orderInfor?.split("|")[0]?.replace("Tên:", "").trim() || "Khách hàng"}
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(order.createDate).toLocaleString("vi-VN")}
                            </div>
                          </div>
                        </div>
                        <span className="font-bold text-green-600">
                          {order.totalPrice
                            ? order.totalPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                            : ""}
                        </span>
                      </li>
                    ))
                  )}
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
                        data={typeDistribution}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                        paddingAngle={2}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {typeDistribution.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value}`, 'Số lượng']}
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
                    {typeDistribution.map((entry, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium text-gray-600">
                          {entry.label}: <span className="font-bold">{entry.value}</span>
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