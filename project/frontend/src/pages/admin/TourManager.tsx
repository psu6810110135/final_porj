import { useState, useEffect, useRef } from "react";
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
  Image as ImageIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
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

/* ─── Custom Select Component for Cute Dropdown Block ─── */
interface Option {
  value: string | boolean;
  label: string;
}

const CustomSelect = ({
  value,
  onChange,
  options,
  className,
  hasError = false,
}: {
  value: string | boolean;
  onChange: (val: any) => void;
  options: Option[];
  className?: string;
  hasError?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => String(o.value) === String(value)) || options[0];

  const errorClasses = hasError 
    ? "ring-2 ring-red-500 bg-red-50 border-red-500 text-red-700" 
    : "";

  return (
    <div className="relative flex-1 sm:flex-none" ref={ref}>
      <div
        className={`flex items-center justify-between ${className} ${errorClasses}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${hasError ? 'text-red-500' : 'text-[#4F200D]/50'} ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full min-w-[140px] mt-2 bg-white border-2 border-[#F6F1E9] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar py-2">
            {options.map((opt) => (
              <div
                key={String(opt.value)}
                className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors ${
                  String(value) === String(opt.value)
                    ? "bg-[#FFD93D]/30 text-[#FF8400]"
                    : "text-[#4F200D] hover:bg-[#F6F1E9]"
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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
  
  // Validation State (Red Highlights)
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  // States for File Uploads
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, regionFilter, categoryFilter, durationFilter]);

  /* ── Handlers ──────────────────────────────────── */
  const handleAddNew = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setErrors({});
    setCoverFile(null);
    setCoverPreview("");
    setAdditionalFiles([]);
    setIsModalOpen(true);
  };

  const handleEdit = (tour: Tour) => {
    setEditingId(tour.id);
    setErrors({});
    setFormData({
      title: tour.title,
      price: tour.price.toString(),
      child_price: tour.child_price?.toString() || "",
      province: tour.province,
      region: tour.region,
      duration: tour.duration,
      category: tour.category,
      description: tour.description || "",
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
    setCoverFile(null);
    setCoverPreview(tour.image_cover || "");
    setAdditionalFiles([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ─── VALIDATION LOGIC ───
    const newErrors: Record<string, boolean> = {};
    if (!formData.title.trim()) newErrors.title = true;
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = true;
    if (!formData.duration.trim()) newErrors.duration = true;
    if (!formData.province.trim()) newErrors.province = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to top of modal if there's an error
      const modalContent = document.getElementById("tour-modal-content");
      if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("price", String(Number(formData.price)));
    if (formData.child_price) payload.append("child_price", String(Number(formData.child_price)));
    payload.append("province", formData.province);
    payload.append("region", formData.region);
    payload.append("duration", formData.duration);
    payload.append("category", formData.category);
    payload.append("description", formData.description);
    payload.append("is_active", String(formData.is_active));
    payload.append("is_recommended", String(formData.is_recommended));
    payload.append("max_group_size", String(Number(formData.max_group_size)));
    payload.append("rating", String(Number(formData.rating)));
    payload.append("review_count", String(Number(formData.review_count)));
    
    const highlights = formData.highlights_str.split(",").map((s) => s.trim()).filter((s) => s !== "");
    highlights.forEach(h => payload.append("highlights", h));
    
    const preparation = formData.preparation_str.split(",").map((s) => s.trim()).filter((s) => s !== "");
    preparation.forEach(p => payload.append("preparation", p));

    payload.append("itinerary", formData.itinerary);
    payload.append("itinerary_data", JSON.stringify(formData.itinerary_data.filter((i) => i.time && i.detail)));
    
    payload.append("included", formData.included);
    payload.append("excluded", formData.excluded);
    payload.append("conditions", formData.conditions);

    if (coverFile) {
      payload.append("image_cover", coverFile);
    }
    additionalFiles.forEach((file) => {
      payload.append("images", file);
    });

    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: getAuthHeader(),
        body: payload,
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to save tour");
      }
      
      await fetchTours();
      setIsModalOpen(false);
      setFormData(initialFormState);
      setCoverFile(null);
      setAdditionalFiles([]);
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
      if (!res.ok) throw new Error("Failed to delete tour");
      setTours((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete tour");
    }
  };

  const updateItinerary = (index: number, field: "time" | "detail", value: string) => {
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

  // Helper to apply red classes to standard inputs
  const getInputClass = (fieldName: string, baseClass: string) => {
    if (errors[fieldName]) {
      return `${baseClass} ring-2 ring-red-500 bg-red-50 border-red-500 text-red-900 placeholder:text-red-300 transition-all`;
    }
    return `${baseClass} bg-[#F6F1E9]/50 border-0 focus:bg-white focus:ring-2 focus:ring-[#FFD93D]`;
  };

  const uniqueDurations = Array.from(new Set(tours.map((t) => t.duration))).filter(Boolean);

  const processedTours = tours.filter((tour) => {
    const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? tour.is_active : !tour.is_active);
    const matchesRegion = regionFilter === "all" || tour.region === regionFilter;
    const matchesCategory = categoryFilter === "all" || tour.category === categoryFilter;
    const matchesDuration = durationFilter === "all" || tour.duration === durationFilter;
    return matchesSearch && matchesStatus && matchesRegion && matchesCategory && matchesDuration;
  });

  const totalPages = Math.ceil(processedTours.length / itemsPerPage);
  const paginatedTours = processedTours.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const selectTriggerClass = "text-sm border-0 bg-[#F6F1E9]/50 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-[#FFD93D] text-[#4F200D] font-bold cursor-pointer outline-none transition-all w-full min-w-[140px]";

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border-0 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-bold text-[#4F200D]/50 uppercase tracking-wider">ทัวร์ทั้งหมด</p>
            <p className="text-3xl font-black text-[#4F200D] mt-1">{tours.length}</p>
          </div>
          <div className="p-4 bg-[#FFD93D]/30 rounded-2xl text-[#FF8400]"><MapPin className="w-7 h-7" strokeWidth={2.5} /></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border-0 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-bold text-[#4F200D]/50 uppercase tracking-wider">เปิดใช้งาน</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{tours.filter((t) => t.is_active).length}</p>
          </div>
          <div className="p-4 bg-[#FF8400]/10 rounded-2xl text-[#FF8400]"><Calendar className="w-7 h-7" strokeWidth={2.5} /></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border-0 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-bold text-[#4F200D]/50 uppercase tracking-wider">หมวดหมู่</p>
            <p className="text-3xl font-black text-[#4F200D] mt-1">{new Set(tours.map((t) => t.category)).size}</p>
          </div>
          <div className="p-4 bg-[#4F200D]/5 rounded-2xl text-[#4F200D]"><Users className="w-7 h-7" strokeWidth={2.5} /></div>
        </div>
      </div>

      {/* Filters */}
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
            <CustomSelect
              className={selectTriggerClass}
              value={regionFilter}
              onChange={setRegionFilter}
              options={[
                { value: "all", label: "ทุกภูมิภาค" },
                ...Object.values(TourRegion).map((r) => ({ value: r, label: r }))
              ]}
            />
            <CustomSelect
              className={selectTriggerClass}
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: "all", label: "ทุกหมวดหมู่" },
                ...Object.values(TourCategory).map((c) => ({ value: c, label: c }))
              ]}
            />
            <CustomSelect
              className={selectTriggerClass}
              value={durationFilter}
              onChange={setDurationFilter}
              options={[
                { value: "all", label: "ทุกระยะเวลา" },
                ...uniqueDurations.map((d) => ({ value: d, label: d }))
              ]}
            />
            <CustomSelect
              className={selectTriggerClass}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "สถานะทั้งหมด" },
                { value: "active", label: "เปิดใช้งาน" },
                { value: "inactive", label: "ปิดใช้งาน" }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F6F1E9]/80 border-b-2 border-[#F6F1E9]">
              <tr>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">ชื่อทัวร์</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">ราคา</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">ภูมิภาค</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">ระยะเวลา</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">หมวดหมู่</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">สถานะ</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6F1E9]">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[#FF8400]" /></td></tr>
              ) : paginatedTours.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center font-bold text-[#4F200D]/40">ไม่พบข้อมูลทัวร์</td></tr>
              ) : (
                paginatedTours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-[#FFD93D]/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F6F1E9] flex-shrink-0 shadow-sm">
                          <img
                            src={tour.image_cover || "https://placehold.co/80x80?text=Tour"}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => (e.target as HTMLImageElement).src = "https://placehold.co/80x80?text=No+Img"}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-[#4F200D] group-hover:text-[#FF8400] transition-colors">{tour.title}</p>
                          <p className="text-xs font-semibold text-[#4F200D]/50 mt-0.5">{tour.province}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-black text-[#4F200D]">฿{Number(tour.price).toLocaleString()}</td>
                    <td className="px-6 py-5 font-bold text-[#4F200D]/70">{tour.region}</td>
                    <td className="px-6 py-5 font-bold text-[#4F200D]/70">{tour.duration}</td>
                    <td className="px-6 py-5 font-bold text-[#4F200D]/70 capitalize">{tour.category}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge className={`border-0 shadow-none px-3 py-1 font-bold ${tour.is_active ? "bg-[#FFD93D]/30 text-[#4F200D]" : "bg-gray-100 text-gray-500"}`}>
                          {tour.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </Badge>
                        {tour.is_recommended && <Badge className="border-0 shadow-none px-3 py-1 font-bold bg-[#FF8400]/15 text-[#FF8400]">⭐ แนะนำ</Badge>}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-[#4F200D]/40 hover:text-[#FF8400] hover:bg-[#FF8400]/10 rounded-xl" onClick={() => handleEdit(tour)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-[#4F200D]/40 hover:text-red-500 hover:bg-red-50 rounded-xl" onClick={() => handleDelete(tour.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Cute & Easy Pagination ─── */}
        {totalPages > 0 && (
          <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-t-2 border-[#F6F1E9]">
            <p className="text-sm font-semibold text-[#4F200D]/50">
              แสดง{" "}
              <span className="text-[#FF8400]">
                {processedTours.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              ถึง{" "}
              <span className="text-[#FF8400]">
                {Math.min(currentPage * itemsPerPage, processedTours.length)}
              </span>{" "}
              จาก <span className="text-[#FF8400]">{processedTours.length}</span>{" "}
              รายการ
            </p>
            
            <div className="flex items-center gap-1 bg-[#F6F1E9]/30 p-1.5 rounded-2xl border-2 border-[#F6F1E9]">
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8 text-[#4F200D] font-bold rounded-xl hover:bg-[#FFD93D]/30 hover:text-[#FF8400] transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-1 mx-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant="ghost"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 p-0 text-sm font-black rounded-xl transition-all ${
                      currentPage === page
                        ? "bg-[#FF8400] text-white shadow-md shadow-[#FF8400]/20"
                        : "text-[#4F200D]/60 hover:bg-[#FFD93D]/30 hover:text-[#FF8400]"
                    }`}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 w-8 text-[#4F200D] font-bold rounded-xl hover:bg-[#FFD93D]/30 hover:text-[#FF8400] transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4F200D]/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-auto">
            <div className="flex justify-between items-center p-6 border-b-2 border-[#F6F1E9] bg-white rounded-t-3xl sticky top-0 z-10">
              <h2 className="text-2xl font-black text-[#4F200D]">{editingId ? "แก้ไขทัวร์" : "สร้างทัวร์ใหม่"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#4F200D]/40 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"><X className="w-6 h-6" /></button>
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="mx-6 mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-bold">กรุณากรอกข้อมูลในช่องที่มีสีแดงให้ครบถ้วนและถูกต้อง</p>
              </div>
            )}

            <form onSubmit={handleSubmit} id="tour-modal-content" className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">ชื่อทัวร์ *</label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({...errors, title: false});
                  }} 
                  placeholder="เช่น ทริปดำน้ำสุดฟิน" 
                  className={getInputClass("title", "rounded-xl font-bold text-[#4F200D]")} 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">ราคา (฿) *</label>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={formData.price} 
                    onChange={(e) => {
                      setFormData({ ...formData, price: e.target.value });
                      if (errors.price) setErrors({...errors, price: false});
                    }} 
                    className={getInputClass("price", "rounded-xl font-bold text-[#4F200D]")} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">ราคาเด็ก (฿)</label>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={formData.child_price} 
                    onChange={(e) => setFormData({ ...formData, child_price: e.target.value })} 
                    className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">ระยะเวลา *</label>
                  <Input 
                    value={formData.duration} 
                    onChange={(e) => {
                      setFormData({ ...formData, duration: e.target.value });
                      if (errors.duration) setErrors({...errors, duration: false});
                    }} 
                    placeholder="เช่น 1 วัน" 
                    className={getInputClass("duration", "rounded-xl font-bold text-[#4F200D]")} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">ภูมิภาค *</label>
                  <CustomSelect
                    className={selectTriggerClass}
                    value={formData.region}
                    onChange={(val) => setFormData({ ...formData, region: val })}
                    options={Object.values(TourRegion).map((r) => ({ value: r, label: r }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">จังหวัด *</label>
                  <Input 
                    value={formData.province} 
                    onChange={(e) => {
                      setFormData({ ...formData, province: e.target.value });
                      if (errors.province) setErrors({...errors, province: false});
                    }} 
                    placeholder="เช่น กระบี่" 
                    className={getInputClass("province", "rounded-xl font-bold text-[#4F200D]")} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">หมวดหมู่ *</label>
                  <CustomSelect
                    className={selectTriggerClass}
                    value={formData.category}
                    onChange={(val) => setFormData({ ...formData, category: val })}
                    options={Object.values(TourCategory).map((c) => ({ value: c, label: c }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">สถานะ</label>
                  <CustomSelect
                    className={selectTriggerClass}
                    value={formData.is_active ? "active" : "inactive"}
                    onChange={(val) => setFormData({ ...formData, is_active: val === "active" })}
                    options={[
                      { value: "active", label: "เปิดใช้งาน" },
                      { value: "inactive", label: "ปิดใช้งาน" }
                    ]}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">แนะนำ</label>
                  <CustomSelect
                    className={selectTriggerClass}
                    value={formData.is_recommended ? "yes" : "no"}
                    onChange={(val) => setFormData({ ...formData, is_recommended: val === "yes" })}
                    options={[
                      { value: "no", label: "ไม่แนะนำ" },
                      { value: "yes", label: "⭐ แนะนำ" }
                    ]}
                  />
                </div>
              </div>

              {/* Upload Fields */}
              <div className="p-5 bg-[#F6F1E9]/30 rounded-2xl border-2 border-[#F6F1E9] space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#FF8400]" /> รูปภาพหน้าปก
                  </label>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCoverFile(e.target.files[0]);
                        setCoverPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }} 
                    className="bg-white border-0 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#FFD93D]/30 file:text-[#FF8400] hover:file:bg-[#FFD93D]/50" 
                  />
                  {coverPreview && (
                    <div className="mt-3 rounded-2xl overflow-hidden border-2 border-[#F6F1E9] w-full max-w-xs">
                      <img src={coverPreview} alt="preview" className="h-40 w-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#FF8400]" /> รูปภาพเพิ่มเติม (เลือกได้หลายรูป)
                  </label>
                  <Input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        setAdditionalFiles(Array.from(e.target.files));
                      }
                    }} 
                    className="bg-white border-0 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#F6F1E9] file:text-[#4F200D] hover:file:bg-[#e2ddd5]" 
                  />
                  {additionalFiles.length > 0 && (
                    <p className="text-xs font-bold text-[#FF8400] mt-1">เลือกไว้ {additionalFiles.length} รูปภาพ</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">รายละเอียด</label>
                <textarea className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-sm min-h-[100px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider flex items-center gap-2">ไฮไลท์ <span className="text-[#4F200D]/40 font-bold text-[10px]">(คั่นด้วยคอมม่า)</span></label>
                <textarea className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none" value={formData.highlights_str} onChange={(e) => setFormData({ ...formData, highlights_str: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider flex items-center gap-2">สิ่งที่ต้องเตรียม <span className="text-[#4F200D]/40 font-bold text-[10px]">(คั่นด้วยคอมม่า)</span></label>
                <textarea className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none" value={formData.preparation_str} onChange={(e) => setFormData({ ...formData, preparation_str: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">แผนการเดินทาง (แบบข้อความสรุป)</label>
                <textarea className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none" value={formData.itinerary} onChange={(e) => setFormData({ ...formData, itinerary: e.target.value })} />
              </div>

              <div className="space-y-3 bg-[#F6F1E9]/30 p-5 rounded-2xl border-2 border-[#F6F1E9]">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">แผนการเดินทาง (กำหนดเวลา)</label>
                  <button type="button" onClick={addItineraryRow} className="text-xs text-[#FF8400] hover:text-white font-bold bg-[#FFD93D]/30 hover:bg-[#FF8400] px-3 py-1.5 rounded-lg transition-colors">+ เพิ่มขั้นตอน</button>
                </div>
                {formData.itinerary_data.map((item, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <Input className="w-28 bg-white border-0 rounded-xl focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]" placeholder="08:30" value={item.time} onChange={(e) => updateItinerary(index, "time", e.target.value)} />
                    <Input className="flex-1 bg-white border-0 rounded-xl focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]" placeholder="รายละเอียดกิจกรรม..." value={item.detail} onChange={(e) => updateItinerary(index, "detail", e.target.value)} />
                    <button type="button" onClick={() => removeItineraryRow(index)} disabled={formData.itinerary_data.length === 1} className="p-2 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-30 text-red-500"><X className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">ราคานี้รวม</label>
                <textarea className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none" value={formData.included} onChange={(e) => setFormData({ ...formData, included: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">ราคานี้ไม่รวม</label>
                <textarea className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none" value={formData.excluded} onChange={(e) => setFormData({ ...formData, excluded: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">เงื่อนไขและข้อตกลง</label>
                <textarea className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none" value={formData.conditions} onChange={(e) => setFormData({ ...formData, conditions: e.target.value })} />
              </div>

              <div className="pt-6 pb-2 flex items-center justify-end gap-3 sticky bottom-0 bg-white border-t-2 border-[#F6F1E9] mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="hover:bg-[#F6F1E9] text-[#4F200D] font-bold rounded-xl px-6">ยกเลิก</Button>
                <Button type="submit" className="bg-[#FF8400] hover:bg-[#e67600] text-white font-bold shadow-lg shadow-[#FF8400]/20 rounded-xl min-w-[130px] px-6" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> กำลังบันทึก...</> : editingId ? "อัปเดตทัวร์" : "บันทึกทัวร์ใหม่"}
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