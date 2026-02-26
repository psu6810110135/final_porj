import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Pencil, Trash2, Shield, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

/* ─── Types ──────────────────────────────────────── */
interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

/* ─── Auth Helper ────────────────────────────────── */
const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function UserManager() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch Users from Database
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Note: Adjust this URL if your user endpoint is different (e.g., /api/v1/admin/users)
      const res = await axios.get('http://localhost:3000/api/v1/users', { 
        headers: getAuthHeader() 
      });
      // Handle both standard array response and { data: [...] } wrapped response
      const userData = Array.isArray(res.data) ? res.data : res.data.data || [];
      setUsers(userData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Could not load user data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Handle Delete (Optional: Wire this to your delete endpoint)
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/v1/users/${id}`, {
        headers: getAuthHeader()
      });
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      alert('Failed to delete user.');
    }
  };

  // 3. Search Filter Logic
  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = (user.full_name || '').toLowerCase().includes(searchLower);
    const emailMatch = (user.email || '').toLowerCase().includes(searchLower);
    return nameMatch || emailMatch;
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#4F200D] tracking-tight">จัดการผู้ใช้งาน</h1>
          <p className="text-sm font-medium text-[#4F200D]/60 mt-1">ดู แก้ไข และจัดการบัญชีผู้ใช้งานและสิทธิ์ต่างๆ</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-5 rounded-3xl border-0 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F200D]/40 w-5 h-5" />
          <Input
            placeholder="ค้นหาด้วยชื่อหรืออีเมล..."
            className="pl-12 py-6 bg-[#F6F1E9]/50 border-0 rounded-2xl font-bold text-[#4F200D] placeholder:font-medium focus:bg-white focus:ring-2 focus:ring-[#FFD93D] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="px-6 py-3 bg-[#F6F1E9]/50 rounded-xl text-sm font-bold text-[#4F200D]">
          ผู้ใช้งานทั้งหมด: <span className="text-[#FF8400]">{filteredUsers.length}</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F6F1E9]/80 border-b-2 border-[#F6F1E9]">
              <tr>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">ผู้ใช้งาน</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">อีเมล</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">บทบาท</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">สถานะ</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6F1E9]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-[#FF8400] font-bold">
                      <Loader2 className="w-5 h-5 animate-spin" /> กำลังโหลดข้อมูลผู้ใช้งาน...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#4F200D]/40 font-medium">
                    ไม่พบข้อมูลผู้ใช้ที่ตรงกับ "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#FFD93D]/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#FFD93D]/30 flex items-center justify-center text-[#FF8400] shrink-0">
                          <User size={20} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-[#4F200D]">{user.full_name || 'ไม่ระบุชื่อ'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-medium text-[#4F200D]/70">{user.email}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 font-bold text-[#4F200D]">
                        {user.role === 'admin' && <Shield size={16} className="text-[#FF8400]" />}
                        <span className="capitalize">{user.role || 'user'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {/* Check if is_active exists, default to Active if undefined for safety */}
                      <Badge className={`border-0 shadow-none px-3 py-1 font-bold ${
                        user.is_active !== false
                          ? 'bg-[#FFD93D]/30 text-[#4F200D]' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        <span className="capitalize">{user.is_active !== false ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'}</span>
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-[#4F200D]/40 hover:text-[#FF8400] hover:bg-[#FF8400]/10 rounded-xl">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-[#4F200D]/40 hover:text-red-500 hover:bg-red-50 rounded-xl"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}