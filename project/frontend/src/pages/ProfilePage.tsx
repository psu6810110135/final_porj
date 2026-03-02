import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้จากฐานข้อมูลได้");
        const data = await res.json();
        setProfile(data);
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

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("รองรับเฉพาะไฟล์ PNG หรือ JPG เท่านั้น");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("ขนาดรูปต้องไม่เกิน 2MB");
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("http://localhost:3000/api/v1/users/me/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("อัปโหลดรูปไม่สำเร็จ");
      }

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
    } catch {
      setUploadError("อัปโหลดรูปโปรไฟล์ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const avatarSrc = profile?.avatarUrl
    ? `http://localhost:3000${profile.avatarUrl}`
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
            <div className="bg-white rounded-2xl border border-[#F0E8E0] p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar */}
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
              {/* Name & Role */}
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-[#4F200D]">
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : (profile.firstName ?? profile.email)}
                </h2>
                <p className="text-gray-400 text-sm mt-0.5">{profile.email}</p>
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
                <div className="mt-3">
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
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-2xl border border-[#F0E8E0] p-6 shadow-sm">
              <h3 className="font-bold text-[#4F200D] mb-4">ข้อมูลส่วนตัว</h3>
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
