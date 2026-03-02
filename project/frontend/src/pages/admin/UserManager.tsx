import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Pencil,
  Trash2,
  Shield,
  User,
  Loader2,
  Phone,
  Calendar,
  X,
  Mail,
  Clock,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/* ─── Types ──────────────────────────────────────── */
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

/* ─── Auth Helper ────────────────────────────────── */
const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("jwt_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function UserManager() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "user",
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/v1/users", {
        headers: getAuthHeader(),
      });
      const userData = Array.isArray(res.data) ? res.data : res.data.data || [];
      setUsers(userData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      alert("Could not load user data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/v1/users/${id}`, {
        headers: getAuthHeader(),
      });
      setUsers(users.filter((u) => u.id !== id));
    } catch (error) {
      alert("Failed to delete user.");
    }
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    const userPhone = user.phone || "";

    const [derivedFirstName = "", ...restName] = (user.full_name || "")
      .trim()
      .split(/\s+/);
    const derivedLastName = restName.join(" ");

    setFormData({
      first_name: user.first_name || derivedFirstName,
      last_name: user.last_name || derivedLastName,
      email: user.email || "",
      phone: userPhone,
      role: user.role || "user",
      is_active: user.is_active !== false,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        is_active: formData.is_active,
      };

      await axios.patch(
        `http://localhost:3000/api/v1/users/${editingUser.id}`,
        payload,
        {
          headers: getAuthHeader(),
        },
      );

      setIsModalOpen(false);
      await fetchUsers(); // Await to make sure table refetches immediately
    } catch (error) {
      alert("Failed to update user.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
    const emailMatch = displayEmail.includes(searchLower);
    const userPhone = user.phone || "";
    const phoneMatch = userPhone.toLowerCase().includes(searchLower);
    const idMatch = (user.id || "").toLowerCase().includes(searchLower);

    return (
      displayName.includes(searchLower) || emailMatch || phoneMatch || idMatch
    );
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4F200D] tracking-tight">
            จัดการผู้ใช้งาน
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#4F200D]/60 mt-1">
            ดู แก้ไข และจัดการบัญชีผู้ใช้งานและสิทธิ์ต่างๆ
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
          {/* ✨ ADDED min-w-[800px] to prevent squeezing on mobile screens */}
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
                  const displayEmail = user.email || user.username || "-";
                  const displayPhone = user.phone;
                  const avatarUrl = user.avatar_url
                    ? `http://localhost:3000${user.avatar_url}`
                    : null;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[#FFD93D]/5 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div
                          className="flex items-center gap-1.5 text-xs font-bold text-[#4F200D]/40 hover:text-[#FF8400] cursor-pointer"
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
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                                const nextElement = event.currentTarget
                                  .nextElementSibling as HTMLElement | null;
                                if (nextElement)
                                  nextElement.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="w-10 h-10 rounded-full bg-[#FFD93D]/30 items-center justify-center text-[#FF8400] shrink-0"
                            style={{ display: avatarUrl ? "none" : "flex" }}
                          >
                            <User size={20} strokeWidth={2.5} />
                          </div>
                          <span className="font-bold text-[#4F200D]">
                            {displayName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-medium text-[#4F200D]/80 flex items-center gap-2 text-xs">
                            <Mail className="w-3.5 h-3.5 text-[#FF8400]" />{" "}
                            {displayEmail}
                          </span>
                          {displayPhone ? (
                            <span className="text-xs font-semibold text-[#4F200D]/60 flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5" /> {displayPhone}
                            </span>
                          ) : (
                            <span className="text-xs text-[#4F200D]/30 flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5" /> ไม่มีเบอร์โทร
                            </span>
                          )}
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
                          className={`border-0 shadow-none px-3 py-1 font-bold ${
                            user.is_active !== false
                              ? "bg-[#FFD93D]/30 text-[#4F200D]"
                              : "bg-red-50 text-red-600"
                          }`}
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
                            className="h-9 w-9 text-[#4F200D]/40 hover:text-[#FF8400] hover:bg-[#FF8400]/10 rounded-xl transition-colors"
                            onClick={() => handleEdit(user)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
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

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4F200D]/60 backdrop-blur-sm p-4 overflow-y-auto pt-16 md:pt-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b-2 border-[#F6F1E9]">
              <h2 className="text-xl sm:text-2xl font-black text-[#4F200D]">
                แก้ไขข้อมูลผู้ใช้
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#4F200D]/40 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={handleUpdate}
              className="p-5 sm:p-6 space-y-4 sm:space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center gap-2 mb-2 p-3 bg-[#F6F1E9]/30 rounded-xl w-full overflow-hidden">
                <Hash className="w-4 h-4 text-[#FF8400] shrink-0" />
                <span className="text-xs font-bold text-[#4F200D]/60 truncate">
                  ID: {editingUser?.id}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">
                  ชื่อ
                </label>
                <Input
                  required
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  placeholder="สมชาย"
                  className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">
                  นามสกุล
                </label>
                <Input
                  required
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  placeholder="ใจดี"
                  className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">
                  อีเมล
                </label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@example.com"
                  className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">
                  เบอร์โทรศัพท์
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="08X-XXX-XXXX"
                  className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                />
              </div>

              {/* ✨ Make the form grid stack to 1 column on small mobile screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    บทบาท
                  </label>
                  <select
                    className="w-full h-11 px-4 rounded-xl border-0 bg-[#F6F1E9]/50 text-[#4F200D] font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#FFD93D] outline-none transition-all cursor-pointer"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    สถานะบัญชี
                  </label>
                  <select
                    className="w-full h-11 px-4 rounded-xl border-0 bg-[#F6F1E9]/50 text-[#4F200D] font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#FFD93D] outline-none transition-all cursor-pointer"
                    value={formData.is_active ? "active" : "inactive"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: e.target.value === "active",
                      })
                    }
                  >
                    <option value="active">เปิดใช้งาน</option>
                    <option value="inactive">ระงับการใช้งาน</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 pb-2 flex items-center justify-end gap-3 border-t-2 border-[#F6F1E9] mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="hover:bg-[#F6F1E9] text-[#4F200D] font-bold rounded-xl px-4 sm:px-6"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FF8400] hover:bg-[#e67600] text-white font-bold shadow-lg shadow-[#FF8400]/20 rounded-xl min-w-[130px] px-4 sm:px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                      กำลังบันทึก...
                    </>
                  ) : (
                    "บันทึกข้อมูล"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
