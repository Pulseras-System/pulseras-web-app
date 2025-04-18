import axios, { AxiosInstance } from "axios";

// Cấu hình URL của API
const API_BASE_URL = "https://localhost:7088/api/v1";

// Tạo đối tượng axios với cấu hình sẵn
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Đảm bảo rằng cookies sẽ được gửi nếu có
});

// Xuất đối tượng api để sử dụng ở những nơi khác
export default api;
