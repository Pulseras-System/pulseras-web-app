import { useEffect, useState } from "react";
import "./blog-content-preview.css";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import BlogService from "@/services/BlogService";
import { Blog } from "@/services/BlogService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash, Eye } from "lucide-react";
const itemsPerPage = 10;

const BlogsManagementPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [viewBlog, setViewBlog] = useState<Blog | null>(null);
  const [newBlog, setNewBlog] = useState<Partial<Blog>>({ title: "" });
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await BlogService.get();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (e) {
      setBlogs([]);
    }
    setLoading(false);
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleAddBlog = async () => {
    if (!newBlog.title?.trim() || !content.trim()) return;
    try {
      const accountStr = localStorage.getItem("account");
      let accountId = "";
      if (accountStr) {
        try {
          const account = JSON.parse(accountStr);
          if (account && typeof account === "object" && account.id) {
            accountId = account.id;
          }
        } catch (err) {
          console.error("Lỗi parse account từ localStorage:", err, accountStr);
          accountId = "";
        }
      }
      if (!accountId) {
        alert("Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.");
        return;
      }
      await BlogService.create({
        accountId: accountId,
        title: newBlog.title || "",
        content: content,
        status: 1,
      });
      setIsAddOpen(false);
      setNewBlog({ title: "" });
      setContent("");
      fetchBlogs();
    } catch (e) {
      alert("Có lỗi khi thêm blog!");
    }
  };

  const handleEditBlog = async () => {
    if (!editingBlog) return;
    try {
      await BlogService.update(editingBlog.blogId, editingBlog);
      setIsEditOpen(false);
      setEditingBlog(null);
      fetchBlogs();
    } catch (e) {
      alert("Có lỗi khi cập nhật blog!");
    }
  };

  const handleDeleteBlog = async (blog: Blog) => {
    if (!window.confirm("Bạn có chắc muốn xóa blog này?")) return;
    try {
      await BlogService.delete(blog.blogId);
      fetchBlogs();
    } catch (e) {
      alert("Có lỗi khi xóa blog!");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Quản lý Blog</h2>
          <p className="text-sm text-black">Danh sách bài viết blog trong hệ thống</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/1 h-4 w-4 text-blue-800" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-9 w-full sm:w-64 bg-pink-100 border-pink-100 focus-visible:ring-pink-100 text-black placeholder-black"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Button
            className="bg-blue-100 hover:bg-blue-100 text-black shadow-sm hover:shadow-md transition-all"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm blog
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-pink-100 bg-white shadow-sm overflow-auto">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-pink-100">
            <TableRow>
              <TableHead className="text-black">#</TableHead>
              <TableHead className="text-black">Tiêu đề</TableHead>
              <TableHead className="text-black">Ngày tạo</TableHead>
              <TableHead className="text-black">Tác giả</TableHead>
              <TableHead className="text-black">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Đang tải...</TableCell>
              </TableRow>
            ) : currentBlogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Không có blog nào</TableCell>
              </TableRow>
            ) : currentBlogs.map((blog, idx) => (
            <TableRow key={blog.blogId}>
                <TableCell>{startIndex + idx + 1}</TableCell>
                <TableCell>{blog.title}</TableCell>
                <TableCell>{formatDate(blog.createDate)}</TableCell>
                <TableCell>{blog.accountName}</TableCell>
                <TableCell className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => { setViewBlog(blog); setIsViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="outline" onClick={() => { setEditingBlog(blog); setIsEditOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="outline" onClick={() => handleDeleteBlog(blog)}><Trash className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredBlogs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-black">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredBlogs.length)} của {filteredBlogs.length} blog
          </div>
          <div className="flex gap-2">
            <Button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Trước</Button>
            <span className="text-black">{currentPage} / {totalPages}</span>
            <Button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Sau</Button>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md bg-white text-black rounded-2xl shadow-xl border border-pink-100">
          <DialogHeader>
            <DialogTitle className="text-black">Thêm blog mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-black">Tiêu đề</Label>
              <Input
                className="border-pink-100 focus:ring-pink-100"
                value={newBlog.title}
                onChange={e => setNewBlog({ ...newBlog, title: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-black">Nội dung</Label>
              <div className="bg-white border border-pink-100 rounded-md min-h-[100px]">
                <ReactQuill
                  value={content}
                  onChange={setContent}
                  className="min-h-[100px]"
                  theme="snow"
                />
              </div>
            </div>
            {/* Bỏ phần ảnh (URL) */}
            <DialogFooter>
              <Button variant="outline" className="text-black border-pink-100 hover:bg-pink-100" onClick={() => setIsAddOpen(false)}>Hủy</Button>
              <Button className="bg-blue-100 hover:bg-blue-100 text-black" onClick={handleAddBlog}>Thêm</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md bg-white text-black rounded-2xl shadow-xl border border-pink-100">
          <DialogHeader>
            <DialogTitle className="text-black">Chỉnh sửa blog</DialogTitle>
          </DialogHeader>
          {editingBlog && (
            <div className="space-y-4">
              <div>
                <Label className="text-black">Tiêu đề</Label>
                <Input
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingBlog.title}
                  onChange={e => setEditingBlog({ ...editingBlog, title: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-black">Nội dung</Label>
                <textarea
                  className="w-full border border-pink-100 rounded-md p-2 focus:ring-pink-100 min-h-[100px]"
                  value={editingBlog.content}
                  onChange={e => setEditingBlog({ ...editingBlog, content: e.target.value })}
                />
              </div>
              {/* Bỏ phần ảnh (URL) khi sửa */}
              <DialogFooter>
                <Button variant="outline" className="text-black border-pink-100 hover:bg-pink-100" onClick={() => setIsEditOpen(false)}>Hủy</Button>
                <Button className="bg-blue-100 hover:bg-blue-100 text-black" onClick={handleEditBlog}>Lưu</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* VIEW MODAL */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-lg bg-white text-black rounded-2xl shadow-xl border border-pink-100">
          <DialogHeader>
            <DialogTitle className="text-black">Chi tiết blog</DialogTitle>
          </DialogHeader>
          {viewBlog && (
            <div className="space-y-4">
              <div>
                <Label className="text-black">Tiêu đề</Label>
                <div className="p-2 border border-pink-100 rounded-md bg-pink-50">{viewBlog.title}</div>
              </div>
              <div>
                <Label className="text-black">Nội dung</Label>
                <div
                  className="p-2 border border-pink-100 rounded-md bg-pink-50 max-h-60 overflow-auto blog-content-preview"
                  dangerouslySetInnerHTML={{ __html: viewBlog.content }}
                />
              </div>
              {/* Bỏ phần hiển thị ảnh trong view */}
              <div>
                <Label className="text-black">Ngày tạo</Label>
                <div className="p-2 border border-pink-100 rounded-md bg-pink-50">{formatDate(viewBlog.createDate)}</div>
              </div>
              <div>
                <Label className="text-black">Tác giả</Label>
                <div className="p-2 border border-pink-100 rounded-md bg-pink-50">{viewBlog.accountName}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogsManagementPage;
