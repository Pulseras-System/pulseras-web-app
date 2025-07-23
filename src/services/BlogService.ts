
import api from "./apiService";

const BLOG_URL = "/blogs";

export interface Blog {
  blogId: string;
  accountId: string;
  accountName: string;
  title: string;
  content: string;
  createDate: string;
  updateDate: string | null;
  status: number;
}

export interface BlogCreateData {
  accountId?: string;
  title?: string;
  content?: string;
  status?: 1;
}

const BlogService = {
  get: async (): Promise<Blog[]> => {
    const response = await api.get(`${BLOG_URL}`);
    // If response.data.items exists, return it, else fallback to response.data
    if (response.data && Array.isArray(response.data.items)) {
      return response.data.items;
    }
    return Array.isArray(response.data) ? response.data : [];
  },
  getById: async (id: string | number): Promise<Blog> => {
    const response = await api.get<Blog>(`${BLOG_URL}/${id}`);
    return response.data;
  },
  create: async (data: Partial<BlogCreateData>): Promise<BlogCreateData> => {
    const formData = new FormData();
    formData.append('accountId', String(data.accountId));
    formData.append('title', String(data.title));
    formData.append('content', String(data.content));

    formData.append('status', '1');


    const response = await api.post<BlogCreateData>(`${BLOG_URL}`, formData,
      {
        headers: { "Content-Type": "multipart/form-data" }
      });
    return response.data;
  },

  update: async (id: string | number, data: Partial<Blog>): Promise<Blog> => {
    // Use FormData for multipart/form-data in update as well
    const formData = new FormData();
    if (data.accountId) formData.append('accountId', String(data.accountId));
    if (data.title) formData.append('title', String(data.title));
    if (data.content) formData.append('content', String(data.content));
    if (typeof data.status !== 'undefined') {
      formData.append('status', String(data.status));
    }
    const response = await api.put<Blog>(`${BLOG_URL}/${id}`, formData);
    return response.data;
  },
  delete: async (id: string | number): Promise<void> => {
    await api.delete(`${BLOG_URL}/${id}`);
  },
  getNewest: async (): Promise<Blog[]> => {
    const response = await api.get<Blog[]>(`${BLOG_URL}/newest`);
    return response.data;
  },
  getByAccountId: async (accountId: string): Promise<Blog[]> => {
    const response = await api.get<Blog[]>(`${BLOG_URL}/account/${accountId}`);
    return response.data;
  },
};

export default BlogService;
