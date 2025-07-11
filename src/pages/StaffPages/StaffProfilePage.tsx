import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  UserCog,
  Edit,
  X,
  Check,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { Account } from '../../services/AccountService';
import AccountService from '../../services/AccountService';
import RoleService from '../../services/RoleService';

const StaffProfilePage = () => {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<Partial<Account>>({});
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [roleName, setRoleName] = useState<string>('Đang tải...');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const storedAccount = localStorage.getItem('account');
        
        if (!storedAccount) {
          throw new Error('Bạn chưa đăng nhập');
        }
        
        const parsedAccount = JSON.parse(storedAccount);
        
        if (!parsedAccount.id) {
          throw new Error('Không tìm thấy ID tài khoản');
        }
        
        const accountData = await AccountService.getById(parsedAccount.id);
        setAccount(accountData);
        
        if (accountData.roleId) {
          fetchRoleName(accountData.roleId);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải hồ sơ');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const fetchRoleName = async (roleId: number | string) => {
    try {
      if (typeof roleId === 'string' && roleId.length > 10) {
        switch (roleId) {
          case '68454a416b4be139d6441986':
            setRoleName('Khách hàng');
            break;
          default:
            try {
              const roleData = await RoleService.getById(roleId);
              setRoleName(roleData.roleName);
            } catch (innerErr) {
              setRoleName('Khách hàng');
            }
        }
      } else {
        try {
          const roleData = await RoleService.getById(roleId);
          setRoleName(roleData.roleName);
        } catch (innerErr) {
          if (typeof roleId === 'number') {
            switch (roleId) {
              case 1:
                setRoleName('Quản trị viên');
                break;
              case 2:
                setRoleName('Khách hàng');
                break;
              case 3:
                setRoleName('Nhân viên');
                break;
              default:
                setRoleName(`Vai trò ${roleId}`);
            }
          } else {
            setRoleName('Vai trò không xác định');
          }
        }
      }
    } catch (err) {
      setRoleName('Vai trò không xác định');
    }
  };

  useEffect(() => {
    if (account && isEditing) {
      setEditFormData({
        fullName: account.fullName,
        phone: account.phone,
        email: account.email,
      });
    }
  }, [account, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (updateSuccess || updateError) {
      const timer = setTimeout(() => {
        setUpdateSuccess(false);
        setUpdateError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess, updateError]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) return;
    
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      
      const hasChanges = Object.entries(editFormData).some(
        ([key, value]) => account[key as keyof Account] !== value && value !== undefined
      );
      
      if (!hasChanges) {
        setUpdateLoading(false);
        setIsEditing(false);
        return;
      }
      
      const updatedData = {
        ...account,
        ...editFormData
      };
      
      const cleanedData = Object.fromEntries(
        Object.entries(updatedData).filter(([_, value]) => value !== undefined)
      ) as Record<string, any>;
      
      const response = await AccountService.update(account.id, cleanedData);
      
      const finalAccountData = { ...response } as Record<string, any>;
      Object.keys(finalAccountData).forEach(key => {
        if (finalAccountData[key] === null && cleanedData[key] !== undefined) {
          finalAccountData[key] = cleanedData[key];
        }
      });
      
      const storedAccount = localStorage.getItem('account');
      if (storedAccount) {
        const parsedAccount = JSON.parse(storedAccount) as Record<string, any>;
        const updatedStoredAccount = { 
          ...parsedAccount,
          ...cleanedData
        };
        
        localStorage.setItem('account', JSON.stringify(updatedStoredAccount));
      }
      
      setAccount(finalAccountData as Account);
      setUpdateLoading(false);
      setUpdateSuccess(true);
      setIsEditing(false);
    } catch (err) {
      setUpdateLoading(false);
      setUpdateError(err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ');
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Không có sẵn';
    
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mt-2"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="h-32 w-32 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ nhân viên</h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản nhân viên</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          disabled={updateLoading}
          variant={isEditing ? "outline" : "default"}
          className="flex items-center gap-2"
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4" />
              Hủy chỉnh sửa
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              Chỉnh sửa hồ sơ
            </>
          )}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {updateSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <Check className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-green-800">Cập nhật hồ sơ thành công!</span>
          </div>
        </div>
      )}

      {updateError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-red-800">{updateError}</span>
          </div>
        </div>
      )}

      {account && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={editFormData.fullName || ''}
                        onChange={handleInputChange}
                        placeholder="Nhập họ và tên"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={editFormData.email || ''}
                        onChange={handleInputChange}
                        placeholder="Nhập email"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={editFormData.phone || ''}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">Tên đăng nhập</Label>
                      <Input
                        id="username"
                        value={account.username}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">Tên đăng nhập không thể thay đổi</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" disabled={updateLoading}>
                      {updateLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <ProfileField
                    icon={<User className="h-5 w-5" />}
                    label="Tên đăng nhập"
                    value={account.username || 'Chưa thiết lập'}
                  />
                  <ProfileField
                    icon={<Mail className="h-5 w-5" />}
                    label="Email"
                    value={account.email || 'Chưa thiết lập'}
                  />
                  <ProfileField
                    icon={<Phone className="h-5 w-5" />}
                    label="Số điện thoại"
                    value={account.phone || 'Chưa thiết lập'}
                  />
                  <ProfileField
                    icon={<Calendar className="h-5 w-5" />}
                    label="Ngày tạo tài khoản"
                    value={formatDate(account.createDate)}
                  />
                  <ProfileField
                    icon={<Clock className="h-5 w-5" />}
                    label="Cập nhật lần cuối"
                    value={formatDate(account.lastEdited)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Tài khoản nhân viên
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src="https://i.pravatar.cc/128?img=8" alt="Staff avatar" />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-green-500 to-blue-600 text-white">
                    {account.fullName ? account.fullName.slice(0, 2).toUpperCase() : 'NV'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">{account.fullName || 'Nhân viên'}</h3>
                  <p className="text-sm text-gray-600">{account.email}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <UserCog className="h-3 w-3 mr-1" />
                    {roleName}
                  </Badge>
                  <Badge 
                    variant={account.status === 1 ? "default" : "destructive"}
                    className={account.status === 1 ? "bg-blue-100 text-blue-800" : ""}
                  >
                    {account.status === 1 ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </div>
                
                <Separator className="w-full" />
                
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ID tài khoản:</span>
                    <span className="font-mono text-xs">{account.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Loại tài khoản:</span>
                    <span className="font-medium">Nhân viên</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Helper component for profile fields
const ProfileField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
    <div className="flex-shrink-0 text-green-600">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

export default StaffProfilePage;
