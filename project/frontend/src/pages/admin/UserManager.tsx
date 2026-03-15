import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Search,
  Trash2,
  Shield,
  User,
  Loader2,
  Phone,
  Calendar,
  Mail,
  Clock,
  Hash,
  Power,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/utils/auth";

/* ─── Mini Confirm Dialog ──────────────────────────── */
function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-80 space-y-4 animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-50 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="font-black text-[#4F200D] text-sm">{title}</p>
            {description && <p className="text-xs text-[#4F200D]/60 mt-1 font-medium">{description}</p>}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#F6F1E9] text-[#4F200D] hover:bg-[#F6F1E9]/80 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            ลบเลย
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Success Toast ────────────────────────────────── */
function SuccessToast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[300] flex items-center gap-2.5 bg-white border border-green-100 shadow-xl rounded-2xl px-5 py-3.5 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
      <span className="text-sm font-bold text-[#4F200D]">{message}</span>
    </div>
  );
}


interface UserData {
  id: string;
  username?: string;
  email: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  provider?: string;
  created_at?: string;
  updated_at?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
}

const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};


export default function UserManager() {
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; userId: string | null }>({ open: false, userId: null });
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: "" });

  const showToast = useCallback((message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2800);
  }, []);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: getAuthHeader(),
      });
      const userData = Array.isArray(res.data) ? res.data : res.data.data || [];
      setUsers(userData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    setConfirmDialog({ open: true, userId: id });
  };

  const confirmDelete = async () => {
    const id = confirmDialog.userId;
    setConfirmDialog({ open: false, userId: null });
    if (!id) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${id}`, {
        headers: getAuthHeader(),
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast("ลบผู้ใช้งานเรียบร้อยแล้ว");
    } catch (error) {
      showToast("ไม่สามารถลบผู้ใช้งานได้");
    }
  };

  const handleToggleStatus = async (user: UserData) => {
    // Treat null/undefined as active (true) for legacy users
    const currentlyActive = user.is_active !== false;
    try {
      await axios.patch(
        `${API_BASE_URL}/api/users/${user.id}`,
        { is_active: !currentlyActive },
        { headers: getAuthHeader() },
      );
      // Update local state optimistically without full refetch
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, is_active: !currentlyActive } : u,
        ),
      );
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        "ไม่สามารถอัปเดตสถานะผู้ใช้งานได้";
      alert(msg);
      console.error(error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const displayName = (
      user.full_name || `${user.first_name || ""} ${user.last_name || ""}`
    )
      .trim()
      .toLowerCase();
    const displayEmail = (user.email || user.username || "").toLowerCase();
    return (
      displayName.includes(searchLower) ||
      displayEmail.includes(searchLower) ||
      (user.phone || "").includes(searchLower) ||
      (user.id || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <ConfirmDialog
        open={confirmDialog.open}
        title="ยืนยันการลบผู้ใช้งาน"
        description="การดำเนินการนี้ไม่สามารถยกเลิกได้ ผู้ใช้งานจะถูกลบออกจากระบบถาวร"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ open: false, userId: null })}
      />
      <SuccessToast message={toast.message} visible={toast.visible} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4F200D] tracking-tight">
            จัดการผู้ใช้งาน
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#4F200D]/60 mt-1">
            ดูข้อมูลบัญชีผู้ใช้งานและจัดการสิทธิ์การเข้าถึง
          </p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-3xl border-0 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F200D]/40 w-5 h-5" />
          <Input
            placeholder="ค้นหาด้วยชื่อ อีเมล หรือ ID..."
            className="pl-12 py-5 sm:py-6 bg-[#F6F1E9]/50 border-0 rounded-2xl font-bold text-[#4F200D] placeholder:font-medium focus:bg-white focus:ring-2 focus:ring-[#FFD93D] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto text-center px-6 py-3 bg-[#F6F1E9]/50 rounded-xl text-sm font-bold text-[#4F200D]">
          ผู้ใช้งานทั้งหมด:{" "}
          <span className="text-[#FF8400]">{filteredUsers.length}</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border-0 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
            <thead className="bg-[#F6F1E9]/80 border-b-2 border-[#F6F1E9]">
              <tr>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                  ID ผู้ใช้งาน
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                  ข้อมูลส่วนตัว
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                  ติดต่อ
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                  สิทธิ์ / ระบบ
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                  วันที่สมัคร
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                  สถานะ
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs text-right">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6F1E9]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-[#FF8400] font-bold">
                      <Loader2 className="w-5 h-5 animate-spin" />{" "}
                      กำลังโหลดข้อมูลผู้ใช้งาน...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-[#4F200D]/40 font-medium"
                  >
                    ไม่พบข้อมูลผู้ใช้ที่ตรงกับ "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const displayName =
                    (
                      user.full_name ||
                      `${user.first_name || ""} ${user.last_name || ""}`
                    ).trim() || "ไม่ระบุชื่อ";
                  const avatarUrl = user.avatar_url
                    ? `${API_BASE_URL}${user.avatar_url}`
                    : null;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[#FFD93D]/5 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div
                          className="flex items-center gap-1.5 text-xs font-bold text-[#4F200D]/40"
                          title={user.id}
                        >
                          <Hash className="w-3.5 h-3.5" />
                          {user.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={displayName}
                              className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#F6F1E9]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#FFD93D]/30 flex items-center justify-center text-[#FF8400] shrink-0">
                              <User size={20} strokeWidth={2.5} />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-bold text-[#4F200D]">
                              {displayName}
                            </span>
                            {user.username && (
                              <span className="text-[10px] font-semibold text-[#4F200D]/40 flex items-center gap-1 mt-0.5">
                                @{user.username}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-medium text-[#4F200D]/80 flex items-center gap-2 text-xs">
                            <Mail className="w-3.5 h-3.5 text-[#FF8400]" />{" "}
                            {user.email || "-"}
                          </span>
                          <span
                            className={`text-xs font-semibold flex items-center gap-2 ${user.phone ? "text-[#4F200D]/60" : "text-[#4F200D]/30"}`}
                          >
                            <Phone className="w-3.5 h-3.5" />{" "}
                            {user.phone || "ไม่มีเบอร์โทร"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1 items-start">
                          <div className="flex items-center gap-1.5 font-bold text-[#4F200D]">
                            {user.role === "admin" ? (
                              <Shield size={14} className="text-[#FF8400]" />
                            ) : (
                              <User size={14} className="text-[#4F200D]/50" />
                            )}
                            <span className="capitalize">
                              {user.role || "user"}
                            </span>
                          </div>
                          {user.provider && (
                            <Badge className="bg-gray-100 text-gray-500 shadow-none border-0 px-2 py-0 text-[10px]">
                              {user.provider}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          {user.created_at ? (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4F200D]/60">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(user.created_at).toLocaleDateString(
                                "th-TH",
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                          {user.updated_at && (
                            <div
                              className="flex items-center gap-1.5 text-[10px] font-semibold text-[#4F200D]/40"
                              title="อัปเดตล่าสุด"
                            >
                              <Clock className="w-3 h-3" />
                              {new Date(user.updated_at).toLocaleDateString(
                                "th-TH",
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge
                          className={`border-0 shadow-none px-3 py-1 font-bold ${user.is_active !== false ? "bg-[#FFD93D]/30 text-[#4F200D]" : "bg-red-50 text-red-600"}`}
                        >
                          <span className="capitalize">
                            {user.is_active !== false
                              ? "เปิดใช้งาน"
                              : "ระงับการใช้งาน"}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={
                              user.is_active !== false
                                ? "ระงับการใช้งาน"
                                : "เปิดใช้งาน"
                            }
                            className={`h-9 w-9 rounded-xl transition-colors ${
                              user.is_active !== false
                                ? "text-red-500 hover:bg-red-50"
                                : "text-green-500 hover:bg-green-50"
                            }`}
                            onClick={() => handleToggleStatus(user)}
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="ลบผู้ใช้"
                            className="h-9 w-9 text-[#4F200D]/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
