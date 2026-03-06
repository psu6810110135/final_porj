import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_BASE_URL } from "@/config/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  createdAt?: string;
  phone?: string;
  avatarUrl?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const getInitials = (profile: UserProfile) => {
  if (profile.firstName) return profile.firstName.charAt(0).toUpperCase();
  if (profile.email) return profile.email.charAt(0).toUpperCase();
  return "?";
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const normalizedPhone = phone.trim();
  const isPhoneValid =
    normalizedPhone === "" || /^[0-9+\-\s]{8,15}$/.test(normalizedPhone);
  const hasProfileChanges =
    !!profile &&
    (firstName !== (profile.firstName ?? "") ||
      lastName !== (profile.lastName ?? "") ||
      phone !== (profile.phone ?? ""));

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้จากฐานข้อมูลได้");
        const data = await res.json();
        setProfile(data);
        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setPhone(data.phone ?? "");
        setSaveError(null);
        setSaveSuccess(null);
        setUploadError(null);
        setUploadSuccess(null);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลโปรไฟล์จากฐานข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleUploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const token = localStorage.getItem("jwt_token");
    const file = event.target.files?.[0];

    if (!token || !file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/pjpeg",
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("รองรับเฉพาะไฟล์ PNG หรือ JPG เท่านั้น");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("ขนาดรูปต้องไม่เกิน 2MB");
      return;
    }

    setUploadError(null);
    setUploadSuccess(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`${API_BASE_URL}/api/users/me/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message = Array.isArray(errorData?.message)
          ? errorData.message.join(", ")
          : errorData?.message || "อัปโหลดรูปไม่สำเร็จ";
        throw new Error(message);
      }

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setFirstName(updatedProfile.firstName ?? "");
      setLastName(updatedProfile.lastName ?? "");
      setPhone(updatedProfile.phone ?? "");
      setUploadSuccess("อัปโหลดรูปโปรไฟล์สำเร็จ");
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : "อัปโหลดรูปโปรไฟล์ไม่สำเร็จ กรุณาลองใหม่",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("jwt_token");
    if (!token || !profile) return;

    if (!hasProfileChanges) {
      setSaveSuccess("ไม่มีข้อมูลที่เปลี่ยนแปลง");
      return;
    }

    if (!isPhoneValid) {
      setSaveError(
        "เบอร์โทรไม่ถูกต้อง (ใช้ตัวเลข 8-15 หลัก และสามารถมี + - ช่องว่างได้)",
      );
      return;
    }

    setSaveError(null);
    setSaveSuccess(null);
    setSaving(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message = Array.isArray(errorData?.message)
          ? errorData.message.join(", ")
          : errorData?.message || "บันทึกข้อมูลไม่สำเร็จ";
        throw new Error(message);
      }

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setFirstName(updatedProfile.firstName ?? "");
      setLastName(updatedProfile.lastName ?? "");
      setPhone(updatedProfile.phone ?? "");
      setSaveSuccess("บันทึกข้อมูลสำเร็จ");
      setIsEditModalOpen(false);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "บันทึกข้อมูลไม่สำเร็จ",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    if (!profile) return;
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setPhone(profile.phone ?? "");
    setSaveError(null);
    setSaveSuccess(null);
  };

  const openEditModal = () => {
    if (!profile) return;
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setPhone(profile.phone ?? "");
    setSaveError(null);
    setSaveSuccess(null);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    handleResetForm();
  };

  const avatarSrc = profile?.avatarUrl
    ? `${API_BASE_URL}${profile.avatarUrl}`
    : null;

  return (
    <div className="min-h-screen bg-[#F6F1E9]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* ── Header ── */}
        <div className="mb-6">
          <span className="inline-block bg-gradient-to-r from-[#FF8400] to-[#FF6B00] text-white font-bold text-base px-5 py-2 rounded-full shadow-md">
            โปรไฟล์ของฉัน
          </span>
        </div>

        {loading ? (
          <ProfileSkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : profile ? (
          <div className="flex flex-col gap-4">
            {/* Avatar & Name Card */}
            <div className="bg-white rounded-2xl border border-[#F0E8E0] p-6 shadow-sm flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF8400] to-[#FF6B00] flex items-center justify-center shadow-lg flex-shrink-0">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-3xl font-bold">
                      {getInitials(profile)}
                    </span>
                  )}
                </div>

                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-bold text-[#4F200D]">
                    {profile.firstName && profile.lastName
                      ? `${profile.firstName} ${profile.lastName}`
                      : (profile.firstName ?? profile.email)}
                  </h2>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {profile.email}
                  </p>
                  {profile.role && (
                    <span
                      className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${
                        profile.role === "admin"
                          ? "bg-[#FF8400]/10 text-[#FF8400]"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {profile.role === "admin" ? "ผู้ดูแลระบบ" : "สมาชิก"}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full sm:w-auto sm:min-w-[220px] text-center sm:text-right">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-[#4F200D] cursor-pointer bg-[#FFF3E0] hover:bg-[#FFE8CC] px-3 py-1.5 rounded-full transition-colors">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                    className="hidden"
                    onChange={handleUploadAvatar}
                    disabled={uploading}
                  />
                  {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปโปรไฟล์"}
                </label>
                <p className="text-[11px] text-gray-400 mt-1">
                  รองรับ PNG/JPG และขนาดไม่เกิน 2MB
                </p>
                {uploadError && (
                  <p className="text-[11px] text-red-500 mt-1">{uploadError}</p>
                )}
                {uploadSuccess && (
                  <p className="text-[11px] text-green-600 mt-1">
                    {uploadSuccess}
                  </p>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-2xl border border-[#F0E8E0] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#4F200D]">ข้อมูลส่วนตัว</h3>
                <button
                  onClick={openEditModal}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#FF8400] hover:bg-[#E67600] transition-colors"
                >
                  แก้ไขข้อมูล
                </button>
              </div>
              {saveSuccess && (
                <p className="text-[11px] text-green-600 mb-3">{saveSuccess}</p>
              )}
              <div className="divide-y divide-[#F0E8E0]">
                <InfoRow label="ชื่อ" value={profile.firstName ?? "-"} />
                <InfoRow label="นามสกุล" value={profile.lastName ?? "-"} />
                <InfoRow label="อีเมล" value={profile.email} />
                <InfoRow label="เบอร์โทร" value={profile.phone ?? "-"} />
                <InfoRow
                  label="สมาชิกตั้งแต่"
                  value={formatDate(profile.createdAt)}
                />
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-[#F0E8E0] p-5 shadow-sm flex flex-col gap-2">
              <Link
                to="/booking-history"
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#FFF3E0] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FFF3E0] flex items-center justify-center group-hover:bg-[#FF8400]/20 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FF8400"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <span className="font-medium text-[#4F200D] text-sm">
                    ประวัติการจอง
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4F200D"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
              <Link
                to="/tours"
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#FFF3E0] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FFF3E0] flex items-center justify-center group-hover:bg-[#FF8400]/20 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FF8400"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                    </svg>
                  </div>
                  <span className="font-medium text-[#4F200D] text-sm">
                    ค้นหาทัวร์
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4F200D"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>

            {isEditModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-white rounded-2xl border border-[#F0E8E0] shadow-lg p-6">
                  <h4 className="font-bold text-[#4F200D] text-lg mb-4">
                    แก้ไขข้อมูลส่วนตัว
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-xs text-gray-500">ชื่อ</label>
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm text-[#4F200D] focus:outline-none focus:ring-2 focus:ring-[#FF8400]/30"
                        placeholder="ชื่อ"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">นามสกุล</label>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm text-[#4F200D] focus:outline-none focus:ring-2 focus:ring-[#FF8400]/30"
                        placeholder="นามสกุล"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-gray-500">เบอร์โทร</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm text-[#4F200D] focus:outline-none focus:ring-2 focus:ring-[#FF8400]/30"
                        placeholder="เบอร์โทร"
                      />
                      {!isPhoneValid && (
                        <p className="text-[11px] text-red-500 mt-1">
                          กรุณากรอกเบอร์โทรให้ถูกต้อง
                        </p>
                      )}
                    </div>
                  </div>

                  {saveError && (
                    <p className="text-[11px] text-red-500 mb-3">{saveError}</p>
                  )}

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={closeEditModal}
                      disabled={saving}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-[#4F200D] bg-[#F6F1E9] border border-[#E8DED3] hover:bg-[#EFE6DA] transition-colors disabled:opacity-60"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleResetForm}
                      disabled={saving || !hasProfileChanges}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-[#4F200D] bg-[#FFF3E0] border border-[#FFE0B2] hover:bg-[#FFE8CC] transition-colors disabled:opacity-60"
                    >
                      รีเซ็ต
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving || !hasProfileChanges || !isPhoneValid}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#FF8400] hover:bg-[#E67600] transition-colors disabled:opacity-70"
                    >
                      {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-[#4F200D] font-medium text-sm text-right max-w-[60%] break-words">
        {value}
      </span>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="bg-white rounded-2xl border border-[#F0E8E0] p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-[#F0E8E0] p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 bg-gray-100 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-2xl border border-red-100 px-6 py-12 flex flex-col items-center gap-3 shadow-sm">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-red-500 font-semibold">{message}</p>
    </div>
  );
}
