import React, { useState, useEffect } from 'react';
import { Account } from '../../services/AccountService';
import AccountService from '../../services/AccountService';
import RoleService from '../../services/RoleService';

function ProfilePage() {
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
        // Get the account from localStorage
        const storedAccount = localStorage.getItem('account');
        
        if (!storedAccount) {
          throw new Error('Bạn chưa đăng nhập');
        }
        
        const parsedAccount = JSON.parse(storedAccount);
        console.log('Stored account:', parsedAccount); // Debug stored account data
        
        // Make sure we have a valid ID
        if (!parsedAccount.id) {
          throw new Error('Không tìm thấy ID tài khoản');
        }
        
        console.log('Fetching account with ID:', parsedAccount.id); // Debug ID
        
        // Fetch account details using the ID
        const accountData = await AccountService.getById(parsedAccount.id);
        setAccount(accountData);
        
        // Nếu có roleId hoặc role_id, fetch thông tin về role từ API
        if (accountData.roleId) {
          fetchRoleName(accountData.roleId);
        } else if (accountData.roleId) {
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

  // Hàm để lấy thông tin về role từ API
  const fetchRoleName = async (roleId: number | string) => {
    try {
      // Kiểm tra xem roleId có phải là UUID (chuỗi dài) không
      if (typeof roleId === 'string' && roleId.length > 10) {
        // Nếu là UUID, hiển thị tên vai trò dựa trên vai trò mặc định
        switch (roleId) {
          case '68454a416b4be139d6441986':
            setRoleName('Khách hàng');
            break;
          default:
            // Thử gọi API nếu không nhận diện được UUID
            try {
              const roleData = await RoleService.getById(roleId);
              setRoleName(roleData.roleName);
            } catch (innerErr) {
              console.error("Lỗi khi gọi API với UUID:", innerErr);
              setRoleName('Khách hàng'); // Giá trị mặc định khi không lấy được từ API
            }
        }
      } else {
        // Gọi API với roleId là số
        try {
          const roleData = await RoleService.getById(roleId);
          setRoleName(roleData.roleName);
        } catch (innerErr) {
          console.error("Lỗi khi gọi API với roleId số:", innerErr);
          
          // Map các roleId số sang tên vai trò làm giá trị backup
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
      console.error("Không thể lấy thông tin vai trò:", err);
      setRoleName('Vai trò không xác định');
    }
  };

  // Initialize edit form data when account data is loaded or editing mode is toggled
  useEffect(() => {
    if (account && isEditing) {
      setEditFormData({
        fullName: account.fullName,
        phone: account.phone,
        email: account.email,
      });
    }
  }, [account, isEditing]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Reset update states after showing success/error message
  useEffect(() => {
    if (updateSuccess || updateError) {
      const timer = setTimeout(() => {
        setUpdateSuccess(false);
        setUpdateError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess, updateError]);

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) return;
    
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      
      // Check if any fields have actually changed (for efficiency)
      const hasChanges = Object.entries(editFormData).some(
        ([key, value]) => account[key as keyof Account] !== value && value !== undefined
      );
      
      // Only update if there are changes
      if (!hasChanges) {
        setUpdateLoading(false);
        setIsEditing(false);
        return;
      }
      
      // Send ALL account data (existing + modified) instead of just changed fields
      const updatedData = {
        ...account,            // Include all existing account data
        ...editFormData        // Overwrite with any edited fields
      };
      
      // Remove any undefined values before sending
      const cleanedData = Object.fromEntries(
        Object.entries(updatedData).filter(([_, value]) => value !== undefined)
      ) as Record<string, any>;
      
      const response = await AccountService.update(account.id, cleanedData);
      
      // If some fields in the response are null, use the values from our updated data
      const finalAccountData = { ...response } as Record<string, any>;
      Object.keys(finalAccountData).forEach(key => {
        if (finalAccountData[key] === null && cleanedData[key] !== undefined) {
          finalAccountData[key] = cleanedData[key];
        }
      });
      
      // Also update local storage with all the account data
      const storedAccount = localStorage.getItem('account');
      if (storedAccount) {
        const parsedAccount = JSON.parse(storedAccount) as Record<string, any>;
        const updatedStoredAccount = { 
          ...parsedAccount,
          ...cleanedData
        };
        
        localStorage.setItem('account', JSON.stringify(updatedStoredAccount));
      }
      
      // Update the state with complete account data
      setAccount(finalAccountData as Account);
      
      setUpdateLoading(false);
      setUpdateSuccess(true);
      setIsEditing(false);
    } catch (err) {
      setUpdateLoading(false);
      setUpdateError(err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Skeleton header */}
            <div className="p-6 border-b border-gray-200">
              <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            {/* Skeleton content */}
            <div className="p-6">
              <div className="flex items-center mb-8">
                <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="ml-6 space-y-2">
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-full bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 shadow rounded-lg border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Lỗi Tải Hồ Sơ</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Thử Lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {updateSuccess && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Cập nhật hồ sơ thành công!</p>
              </div>
            </div>
          </div>
        )}

        {updateError && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">Lỗi: {updateError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Hồ Sơ Của Tôi</h1>
              <button
                className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium text-sm flex items-center"
                onClick={() => setIsEditing(!isEditing)}
                disabled={updateLoading}
              >
                {isEditing ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Hủy Chỉnh Sửa
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Chỉnh Sửa Hồ Sơ
                  </>
                )}
              </button>
            </div>
          </div>
          
          {account && (
            <div className="px-6 py-8">
              {/* User header with avatar */}
              <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4 md:mb-0">
                  {account.fullName ? account.fullName.slice(0, 2).toUpperCase() : "U"}
                </div>
                <div className="md:ml-8 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-800">{account.fullName || "Người dùng"}</h2>
                  <div className="mt-2 flex items-center justify-center md:justify-start">
                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                      account.status === 1 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {account.status === 1 ? "Tài Khoản Hoạt Động" : "Tài Khoản Không Hoạt Động"}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-500">{account.email}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông Tin Tài Khoản</h3>
                
                {isEditing ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                          Họ Và Tên
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          id="fullName"
                          value={editFormData.fullName || ''}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                          Tên Đăng Nhập
                        </label>
                        <input
                          type="text"
                          name="username"
                          id="username"
                          value={account.username}
                          disabled
                          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm px-3 py-2 border"
                        />
                        <p className="text-xs text-gray-500">Tên đăng nhập không thể thay đổi</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Địa Chỉ Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={editFormData.email || ''}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Số Điện Thoại
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={editFormData.phone || ''}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                      >
                        {updateLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang Lưu...
                          </>
                        ) : 'Lưu Thay Đổi'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <ProfileField 
                      icon="user" 
                      label="Tên Đăng Nhập" 
                      value={account.username || 'Chưa thiết lập'} 
                    />
                    <ProfileField 
                      icon="mail" 
                      label="Email" 
                      value={account.email || 'Chưa thiết lập'} 
                    />
                    <ProfileField 
                      icon="phone" 
                      label="Số Điện Thoại" 
                      value={account.phone || 'Chưa thiết lập'} 
                    />
                    <ProfileField 
                      icon="calendar" 
                      label="Ngày Tạo Tài Khoản" 
                      value={formatDate(account.createDate)} 
                    />
                    <ProfileField 
                      icon="clock" 
                      label="Cập Nhật Lần Cuối" 
                      value={formatDate(account.lastEdited)} 
                    />
                    <ProfileField 
                      icon="badge" 
                      label="Vai Trò" 
                      value={roleName} 
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for profile fields with icons
function ProfileField({ 
  icon, 
  label, 
  value 
}: { 
  icon: "user" | "mail" | "phone" | "calendar" | "clock" | "badge"; 
  label: string; 
  value: string; 
}) {
  return (
    <div className="flex">
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
          {icon === "user" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          )}
          {icon === "mail" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          )}
          {icon === "phone" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          )}
          {icon === "calendar" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          )}
          {icon === "clock" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          )}
          {icon === "badge" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// Helper function to format dates safely
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Không có sẵn';
  
  try {
    return new Date(dateString).toLocaleDateString("vi-VN");
  } catch (error) {
    console.error("Invalid date format:", dateString);
    return 'Ngày không hợp lệ';
  }
}

export default ProfilePage;