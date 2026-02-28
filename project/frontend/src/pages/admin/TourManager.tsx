import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  Users,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/* ─── Auth Helper ────────────────────────────────── */
const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("jwt_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ─── Enums & Types ──────────────────────────────── */
export const TourCategory = {
  SEA: "Sea",
  MOUNTAIN: "Mountain",
  CULTURAL: "Cultural",
  NATURE: "Nature",
  CITY: "City",
  ADVENTURE: "Adventure",
};

export const TourRegion = {
  NORTH: "North",
  SOUTH: "South",
  CENTRAL: "Central",
  EAST: "East",
  WEST: "West",
  NORTHEAST: "Northeast",
};

export interface Tour {
  id: string;
  title: string;
  price: number;
  child_price?: number;
  province: string;
  duration: string;
  category: string;
  region: string;
  is_active: boolean;
  is_recommended: boolean;
  image_cover?: string;
  images?: string[];
  description?: string;
  max_group_size?: number;
  rating?: number;
  review_count?: number;
  highlights?: string[];
  preparation?: string[];
  itinerary?: string;
  itinerary_data?: { time: string; detail: string }[];
  included?: string;
  excluded?: string;
  conditions?: string;
}

/* ─── Initial Form State ─────────────────────────── */
const initialFormState = {
  title: "",
  price: "",
  child_price: "",
  province: "",
  region: TourRegion.CENTRAL,
  duration: "",
  category: TourCategory.NATURE,
  description: "",
  image_cover: "",
  images_str: "",
  is_active: true,
  is_recommended: false,
  max_group_size: 15,
  rating: 0,
  review_count: 0,
  highlights_str: "",
  preparation_str: "",
  itinerary: "",
  itinerary_data: [{ time: "", detail: "" }],
  included: "",
  excluded: "",
  conditions: "",
};

const API_URL = "http://localhost:3000/api/v1/tours";

/* ─── Component ──────────────────────────────────── */
const TourManager = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  // States สำหรับการค้นหาและกรองข้อมูล
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  /* ── Fetch ─────────────────────────────────────── */
  const fetchTours = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?show_all=true`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error("Failed to fetch tours");
      const data = await response.json();
      setTours(data);
    } catch (err) {
      console.error("Could not load tours:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  // รีเซ็ตหน้ากลับไปหน้าแรกเมื่อมีการกรองข้อมูล
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, regionFilter, categoryFilter, durationFilter]);

  /* ── Handlers ──────────────────────────────────── */
  const handleAddNew = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleEdit = (tour: Tour) => {
    setEditingId(tour.id);
    setFormData({
      title: tour.title,
      price: tour.price.toString(),
      child_price: tour.child_price?.toString() || "",
      province: tour.province,
      region: tour.region,
      duration: tour.duration,
      category: tour.category,
      description: tour.description || "",
      image_cover: tour.image_cover || "",
      images_str: tour.images?.join(", ") || "",
      is_active: tour.is_active,
      is_recommended: tour.is_recommended ?? false,
      max_group_size: tour.max_group_size ?? 15,
      rating: tour.rating ?? 0,
      review_count: tour.review_count ?? 0,
      highlights_str: tour.highlights?.join(", ") || "",
      preparation_str: tour.preparation?.join(", ") || "",
      itinerary: tour.itinerary || "",
      itinerary_data: tour.itinerary_data?.length
        ? tour.itinerary_data
        : [{ time: "", detail: "" }],
      included: tour.included || "",
      excluded: tour.excluded || "",
      conditions: tour.conditions || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      title: formData.title,
      price: Number(formData.price),
      child_price: formData.child_price ? Number(formData.child_price) : null,
      province: formData.province,
      region: formData.region,
      duration: formData.duration,
      category: formData.category,
      description: formData.description,
      image_cover: formData.image_cover,
      images: formData.images_str
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== ""),
      is_active: formData.is_active,
      is_recommended: formData.is_recommended,
      max_group_size: Number(formData.max_group_size),
      rating: Number(formData.rating),
      review_count: Number(formData.review_count),
      highlights: formData.highlights_str
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== ""),
      preparation: formData.preparation_str
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== ""),
      itinerary: formData.itinerary,
      itinerary_data: formData.itinerary_data.filter((i) => i.time && i.detail),
      included: formData.included,
      excluded: formData.excluded,
      conditions: formData.conditions,
    };

    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to save tour");
      }
      await fetchTours();
      setIsModalOpen(false);
      setFormData(initialFormState);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบทัวร์นี้?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if (!res.ok) {
        let errorMessage = "Failed to delete tour";
        try {
          const errData = await res.json();
          errorMessage =
            (Array.isArray(errData?.message)
              ? errData.message.join(", ")
              : errData?.message) || errorMessage;
        } catch {
          // ignore JSON parse failures and keep fallback message
        }
        throw new Error(errorMessage);
      }

      setTours((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete tour");
    }
  };

  /* ── Itinerary helpers ─────────────────────────── */
  const updateItinerary = (
    index: number,
    field: "time" | "detail",
    value: string,
  ) => {
    const updated = formData.itinerary_data.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setFormData({ ...formData, itinerary_data: updated });
  };

  const addItineraryRow = () =>
    setFormData({
      ...formData,
      itinerary_data: [...formData.itinerary_data, { time: "", detail: "" }],
    });

  const removeItineraryRow = (index: number) =>
    setFormData({
      ...formData,
      itinerary_data: formData.itinerary_data.filter((_, i) => i !== index),
    });

  /* ── Filtering Logic ────────────────────── */

  const uniqueDurations = Array.from(
    new Set(tours.map((t) => t.duration)),
  ).filter(Boolean);

  const processedTours = tours.filter((tour) => {
    const matchesSearch = tour.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? tour.is_active : !tour.is_active);
    const matchesRegion =
      regionFilter === "all" || tour.region === regionFilter;
    const matchesCategory =
      categoryFilter === "all" || tour.category === categoryFilter;
    const matchesDuration =
      durationFilter === "all" || tour.duration === durationFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesRegion &&
      matchesCategory &&
      matchesDuration
    );
  });

  const totalPages = Math.ceil(processedTours.length / itemsPerPage);
  const paginatedTours = processedTours.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  /* ── Render ────────────────────────────────────── */
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#4F200D] tracking-tight">
            จัดการทัวร์
          </h1>
          <p className="text-sm font-medium text-[#4F200D]/60 mt-1">
            จัดการทัวร์ของคุณ ดูความพร้อม และอัปเดตรายละเอียดต่างๆ
          </p>
        </div>
        <Button
          className="bg-[#FF8400] hover:bg-[#e67600] text-white shadow-lg shadow-[#FF8400]/20 rounded-xl px-6 py-5 text-sm font-bold transition-all"
          onClick={handleAddNew}
        >
          <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} /> เพิ่มทัวร์ใหม่
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border-0 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-bold text-[#4F200D]/50 uppercase tracking-wider">
              ทัวร์ทั้งหมด
            </p>
            <p className="text-3xl font-black text-[#4F200D] mt-1">
              {tours.length}
            </p>
          </div>
          <div className="p-4 bg-[#FFD93D]/30 rounded-2xl text-[#FF8400]">
            <MapPin className="w-7 h-7" strokeWidth={2.5} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border-0 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-bold text-[#4F200D]/50 uppercase tracking-wider">
              เปิดใช้งาน
            </p>
            <p className="text-3xl font-black text-emerald-600 mt-1">
              {tours.filter((t) => t.is_active).length}
            </p>
          </div>
          <div className="p-4 bg-[#FF8400]/10 rounded-2xl text-[#FF8400]">
            <Calendar className="w-7 h-7" strokeWidth={2.5} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border-0 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-bold text-[#4F200D]/50 uppercase tracking-wider">
              หมวดหมู่
            </p>
            <p className="text-3xl font-black text-[#4F200D] mt-1">
              {new Set(tours.map((t) => t.category)).size}
            </p>
          </div>
          <div className="p-4 bg-[#4F200D]/5 rounded-2xl text-[#4F200D]">
            <Users className="w-7 h-7" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Filters (การกรองข้อมูล) */}
      <div className="bg-white p-5 rounded-3xl border-0 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-center w-full">
          <div className="relative w-full xl:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F200D]/40 w-5 h-5" />
            <Input
              placeholder="ค้นหาทัวร์ด้วยชื่อ..."
              className="pl-12 py-6 bg-[#F6F1E9]/50 border-0 rounded-2xl font-bold text-[#4F200D] placeholder:font-medium focus:bg-white focus:ring-2 focus:ring-[#FFD93D] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-start xl:justify-end">
            <select
              className="text-sm border-0 bg-[#F6F1E9]/50 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-[#FFD93D] text-[#4F200D] font-bold cursor-pointer outline-none transition-all flex-1 sm:flex-none min-w-[140px]"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <option value="all">ทุกภูมิภาค</option>
              {Object.values(TourRegion).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              className="text-sm border-0 bg-[#F6F1E9]/50 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-[#FFD93D] text-[#4F200D] font-bold cursor-pointer outline-none transition-all flex-1 sm:flex-none min-w-[140px]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">ทุกหมวดหมู่</option>
              {Object.values(TourCategory).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              className="text-sm border-0 bg-[#F6F1E9]/50 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-[#FFD93D] text-[#4F200D] font-bold cursor-pointer outline-none transition-all flex-1 sm:flex-none min-w-[140px]"
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
            >
              <option value="all">ทุกระยะเวลา</option>
              {uniqueDurations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              className="text-sm border-0 bg-[#F6F1E9]/50 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-[#FFD93D] text-[#4F200D] font-bold cursor-pointer outline-none transition-all flex-1 sm:flex-none min-w-[140px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="active">เปิดใช้งาน</option>
              <option value="inactive">ปิดใช้งาน</option>
            </select>
          </div>
        </div>

        {/* แสดงผลสรุปการกรอง */}
        {processedTours.length !== tours.length && (
          <p className="text-sm text-[#FF8400] font-bold px-2">
            พบข้อมูลทัวร์ {processedTours.length} รายการ จากการกรองของคุณ
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F6F1E9]/80 border-b-2 border-[#F6F1E9]">
              <tr>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                  ชื่อทัวร์
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                  ราคา
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                  ภูมิภาค
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                  ระยะเวลา
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                  หมวดหมู่
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
                      กำลังโหลดข้อมูล...
                    </div>
                  </td>
                </tr>
              ) : paginatedTours.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-[#4F200D]/40 font-bold"
                  >
                    ไม่พบข้อมูลทัวร์
                  </td>
                </tr>
              ) : (
                paginatedTours.map((tour) => (
                  <tr
                    key={tour.id}
                    className="hover:bg-[#FFD93D]/5 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F6F1E9] flex-shrink-0 shadow-sm">
                          <img
                            src={
                              tour.image_cover ||
                              "https://placehold.co/80x80?text=Tour"
                            }
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/80x80?text=No+Img";
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-[#4F200D] group-hover:text-[#FF8400] transition-colors">
                            {tour.title}
                          </p>
                          <p className="text-xs font-semibold text-[#4F200D]/50 mt-0.5">
                            {tour.province}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-black text-[#4F200D]">
                      ฿{Number(tour.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-5 font-bold text-[#4F200D]/70">
                      {tour.region}
                    </td>
                    <td className="px-6 py-5 font-bold text-[#4F200D]/70">
                      {tour.duration}
                    </td>
                    <td className="px-6 py-5 font-bold text-[#4F200D]/70 capitalize">
                      {tour.category}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <Badge
                          className={`border-0 shadow-none px-3 py-1 font-bold ${tour.is_active ? "bg-[#FFD93D]/30 text-[#4F200D]" : "bg-gray-100 text-gray-500"}`}
                        >
                          {tour.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </Badge>
                        {tour.is_recommended && (
                          <Badge className="border-0 shadow-none px-3 py-1 font-bold bg-[#FF8400]/15 text-[#FF8400]">
                            ⭐ แนะนำ
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-[#4F200D]/40 hover:text-[#FF8400] hover:bg-[#FF8400]/10 rounded-xl"
                          onClick={() => handleEdit(tour)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-[#4F200D]/40 hover:text-red-500 hover:bg-red-50 rounded-xl"
                          onClick={() => handleDelete(tour.id)}
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

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between bg-white border-t-2 border-[#F6F1E9]">
          <p className="text-sm font-semibold text-[#4F200D]/50">
            แสดง{" "}
            <span className="text-[#FF8400]">
              {processedTours.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            ถึง{" "}
            <span className="text-[#FF8400]">
              {Math.min(currentPage * itemsPerPage, processedTours.length)}
            </span>{" "}
            จาก <span className="text-[#FF8400]">{processedTours.length}</span>{" "}
            รายการ
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="border-0 bg-[#F6F1E9]/50 text-[#4F200D] font-bold rounded-xl hover:bg-[#FFD93D]/30 hover:text-[#FF8400] transition-colors"
            >
              ก่อนหน้า
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="border-0 bg-[#F6F1E9]/50 text-[#4F200D] font-bold rounded-xl hover:bg-[#FFD93D]/30 hover:text-[#FF8400] transition-colors"
            >
              ถัดไป
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Modal ───────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4F200D]/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b-2 border-[#F6F1E9] bg-white rounded-t-3xl sticky top-0 z-10">
              <h2 className="text-2xl font-black text-[#4F200D]">
                {editingId ? "แก้ไขทัวร์" : "สร้างทัวร์ใหม่"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#4F200D]/40 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar"
            >
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                  ชื่อทัวร์ *
                </label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="เช่น ทริปดำน้ำสุดฟิน"
                  className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                />
              </div>

              {/* Price, Child Price, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    ราคา (฿) *
                  </label>
                  <Input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0"
                    className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    ราคาเด็ก (฿)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.child_price}
                    onChange={(e) =>
                      setFormData({ ...formData, child_price: e.target.value })
                    }
                    placeholder="อัตโนมัติ: 60%"
                    className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    ระยะเวลา *
                  </label>
                  <Input
                    required
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="เช่น 1 วัน"
                    className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                  />
                </div>
              </div>

              {/* Region & Province */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    ภูมิภาค *
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border-0 bg-[#F6F1E9]/50 text-[#4F200D] font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#FFD93D] outline-none"
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        region: e.target.value as string,
                      })
                    }
                  >
                    {Object.values(TourRegion).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    จังหวัด *
                  </label>
                  <Input
                    required
                    value={formData.province}
                    onChange={(e) =>
                      setFormData({ ...formData, province: e.target.value })
                    }
                    placeholder="เช่น กระบี่"
                    className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                  />
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    หมวดหมู่ *
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border-0 bg-[#F6F1E9]/50 text-[#4F200D] font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#FFD93D] outline-none"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as string,
                      })
                    }
                  >
                    {Object.values(TourCategory).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    สถานะ
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border-0 bg-[#F6F1E9]/50 text-[#4F200D] font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#FFD93D] outline-none"
                    value={formData.is_active ? "active" : "inactive"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: e.target.value === "active",
                      })
                    }
                  >
                    <option value="active">เปิดใช้งาน</option>
                    <option value="inactive">ปิดใช้งาน</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    แนะนำ
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border-0 bg-[#F6F1E9]/50 text-[#4F200D] font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#FFD93D] outline-none"
                    value={formData.is_recommended ? "yes" : "no"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_recommended: e.target.value === "yes",
                      })
                    }
                  >
                    <option value="no">ไม่แนะนำ</option>
                    <option value="yes">⭐ แนะนำ</option>
                  </select>
                </div>
              </div>

              {/* Max Group Size & Cover Image */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    ขนาดกลุ่มสูงสุด
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.max_group_size}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_group_size: Number(e.target.value),
                      })
                    }
                    className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    ลิงก์รูปภาพหน้าปก
                  </label>
                  <Input
                    value={formData.image_cover}
                    onChange={(e) =>
                      setFormData({ ...formData, image_cover: e.target.value })
                    }
                    placeholder="https://..."
                    className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                  />
                </div>
              </div>

              {/* Additional Images */}
              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider flex items-center gap-2">
                  รูปภาพเพิ่มเติม{" "}
                  <span className="text-[#4F200D]/40 font-bold text-[10px]">
                    (URLs คั่นด้วยคอมม่า)
                  </span>
                </label>
                <textarea
                  className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-sm min-h-[60px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none"
                  placeholder="https://image1.jpg, https://image2.jpg"
                  value={formData.images_str}
                  onChange={(e) =>
                    setFormData({ ...formData, images_str: e.target.value })
                  }
                />
              </div>

              {/* Image Preview */}
              {formData.image_cover && (
                <div className="rounded-2xl overflow-hidden border-2 border-[#F6F1E9]">
                  <img
                    src={formData.image_cover}
                    alt="preview"
                    className="h-32 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                  รายละเอียด
                </label>
                <textarea
                  className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-sm min-h-[100px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none"
                  placeholder="อธิบายประสบการณ์ทัวร์นี้..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider flex items-center gap-2">
                  ไฮไลท์{" "}
                  <span className="text-[#4F200D]/40 font-bold text-[10px]">
                    (คั่นด้วยคอมม่า)
                  </span>
                </label>
                <textarea
                  className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none"
                  placeholder="เช่น ชมวิวพระอาทิตย์ตก, ดำน้ำดูปะการัง, อาหารกลางวันบนเรือ"
                  value={formData.highlights_str}
                  onChange={(e) =>
                    setFormData({ ...formData, highlights_str: e.target.value })
                  }
                />
              </div>

              {/* Preparation */}
              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider flex items-center gap-2">
                  สิ่งที่ต้องเตรียม{" "}
                  <span className="text-[#4F200D]/40 font-bold text-[10px]">
                    (คั่นด้วยคอมม่า)
                  </span>
                </label>
                <textarea
                  className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none"
                  placeholder="เช่น ชุดว่ายน้ำ, ครีมกันแดด, กล้องถ่ายรูป"
                  value={formData.preparation_str}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preparation_str: e.target.value,
                    })
                  }
                />
              </div>

              {/* Itinerary (Text) */}
              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                  แผนการเดินทาง (แบบข้อความสรุป)
                </label>
                <textarea
                  className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none"
                  placeholder="อธิบายแผนการเดินทางแบบสรุป..."
                  value={formData.itinerary}
                  onChange={(e) =>
                    setFormData({ ...formData, itinerary: e.target.value })
                  }
                />
              </div>

              {/* Itinerary (Structured) */}
              <div className="space-y-3 bg-[#F6F1E9]/30 p-5 rounded-2xl border-2 border-[#F6F1E9]">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    แผนการเดินทาง (กำหนดเวลา)
                  </label>
                  <button
                    type="button"
                    onClick={addItineraryRow}
                    className="text-xs text-[#FF8400] hover:text-white font-bold bg-[#FFD93D]/30 hover:bg-[#FF8400] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    + เพิ่มขั้นตอน
                  </button>
                </div>
                {formData.itinerary_data.map((item, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <Input
                      className="w-28 bg-white border-0 rounded-xl focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                      placeholder="08:30"
                      value={item.time}
                      onChange={(e) =>
                        updateItinerary(index, "time", e.target.value)
                      }
                    />
                    <Input
                      className="flex-1 bg-white border-0 rounded-xl focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                      placeholder="รายละเอียดกิจกรรม..."
                      value={item.detail}
                      onChange={(e) =>
                        updateItinerary(index, "detail", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeItineraryRow(index)}
                      disabled={formData.itinerary_data.length === 1}
                      className="p-2 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-30 text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Included */}
              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                  ราคานี้รวม
                </label>
                <textarea
                  className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none"
                  placeholder="สิ่งที่รวมอยู่ในค่าทัวร์แล้ว..."
                  value={formData.included}
                  onChange={(e) =>
                    setFormData({ ...formData, included: e.target.value })
                  }
                />
              </div>

              {/* Excluded */}
              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                  ราคานี้ไม่รวม
                </label>
                <textarea
                  className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none"
                  placeholder="สิ่งที่ยังไม่รวม (เช่น ตั๋วเครื่องบินส่วนตัว)..."
                  value={formData.excluded}
                  onChange={(e) =>
                    setFormData({ ...formData, excluded: e.target.value })
                  }
                />
              </div>

              {/* Conditions */}
              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                  เงื่อนไขและข้อตกลง
                </label>
                <textarea
                  className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none"
                  placeholder="นโยบายการยกเลิก, เงื่อนไขต่างๆ..."
                  value={formData.conditions}
                  onChange={(e) =>
                    setFormData({ ...formData, conditions: e.target.value })
                  }
                />
              </div>

              {/* Rating & Review Count */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    คะแนนรีวิว
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rating: Number(e.target.value),
                      })
                    }
                    placeholder="เช่น 4.5"
                    className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    จำนวนรีวิว
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.review_count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        review_count: Number(e.target.value),
                      })
                    }
                    placeholder="เช่น 100"
                    className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 pb-2 flex items-center justify-end gap-3 sticky bottom-0 bg-white border-t-2 border-[#F6F1E9] mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="hover:bg-[#F6F1E9] text-[#4F200D] font-bold rounded-xl px-6"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  className="bg-[#FF8400] hover:bg-[#e67600] text-white font-bold shadow-lg shadow-[#FF8400]/20 rounded-xl min-w-[130px] px-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                      กำลังบันทึก...
                    </>
                  ) : editingId ? (
                    "อัปเดตทัวร์"
                  ) : (
                    "บันทึกทัวร์ใหม่"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourManager;
