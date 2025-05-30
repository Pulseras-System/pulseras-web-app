import api from "./apiService";

export interface Notification {
  notification_id: number;
  account_id: number;
  message: string;
  status: number;
  createDate: string;
  lastEdited: string;
}

const NotificationService = {
  get: async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>("/notification");
    return response.data;
  },
  getById: async (id: number | string): Promise<Notification> => {
    const response = await api.get<Notification>(`/notification/${id}`);
    return response.data;
  },
  create: async (data: Partial<Notification>): Promise<Notification> => {
    const response = await api.post<Notification>("/notification", data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Notification>): Promise<Notification> => {
    const response = await api.put<Notification>(`/notification/${id}`, data);
    return response.data;
  },
};

export default NotificationService;