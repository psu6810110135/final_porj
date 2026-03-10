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
import { API_BASE_URL } from "@/config/api";
import { THAI_PROVINCES, getProvinceLabel } from "@/utils/tourLabels";

/* ─── Auth Helper ────────────────────────────────── */
const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("jwt_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ─── เคล็ดลับดึง URL รูปภาพให้ติดชัวร์ 100% ─────────── */
const getImageUrl = (path?: string) => {
  if (!path) return "https://placehold.co/80x80?text=No+Img";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}/${path.replace(/^\//, "")}`;
};

export const tourCategories = [
  { value: "Sea", label: "ทะเล" },
  { value: "Mountain", label: "ภูเขา" },
  { value: "Cultural", label: "ศิลปวัฒนธรรม" },
  { value: "Nature", label: "ธรรมชาติ" },
  { value: "City", label: "เมือง" },
  { value: "Adventure", label: "ผจญภัย" },
];

export const tourRegions = [
  { value: "North", label: "ภาคเหนือ" },
  { value: "South", label: "ภาคใต้" },
  { value: "Central", label: "ภาคกลาง" },
  { value: "East", label: "ภาคตะวันออก" },
  { value: "West", label: "ภาคตะวันตก" },
  { value: "Northeast", label: "ภาคตะวันออกเฉียงเหนือ" },
];

export const tourDurations = [
  { value: "1 day", label: "1 วัน" },
  { value: "1 day 1 night", label: "1 วัน 1 คืน" },
  { value: "2 days 1 night", label: "2 วัน 1 คืน" },
  { value: "2 days 2 nights", label: "2 วัน 2 คืน" },
  { value: "3 days 2 nights", label: "3 วัน 2 คืน" },
  { value: "3 days 3 nights", label: "3 วัน 3 คืน" },
  { value: "4 days 3 nights", label: "4 วัน 3 คืน" },
  { value: "4 days 4 nights", label: "4 วัน 4 คืน" },
  { value: "5 days 4 nights", label: "5 วัน 4 คืน" },
  { value: "5 days 5 nights", label: "5 วัน 5 คืน" },
];

/* ─── พจนานุกรมสำหรับค้นหาจังหวัดด้วยภาษาอังกฤษ ───────── */
const PROVINCE_EN_MAPPING: Record<string, string> = {
  "กรุงเทพมหานคร": "bangkok bkk", "กระบี่": "krabi", "กาญจนบุรี": "kanchanaburi", "กาฬสินธุ์": "kalasin",
  "กำแพงเพชร": "kamphaengphet", "ขอนแก่น": "khonkaen", "จันทบุรี": "chanthaburi", "ฉะเชิงเทรา": "chachoengsao",
  "ชลบุรี": "chonburi pattaya", "ชัยนาท": "chainat", "ชัยภูมิ": "chaiyaphum", "ชุมพร": "chumphon",
  "เชียงราย": "chiangrai", "เชียงใหม่": "chiangmai", "ตรัง": "trang", "ตราด": "trat koh chang",
  "ตาก": "tak", "นครนายก": "nakhonnayok", "นครปฐม": "nakhonpathom", "นครพนม": "nakhonphanom",
  "นครราชสีมา": "nakhonratchasima korat khao yai", "นครศรีธรรมราช": "nakhonsithammarat", "นครสวรรค์": "nakhonsawan",
  "นนทบุรี": "nonthaburi", "นราธิวาส": "narathiwat", "น่าน": "nan", "บึงกาฬ": "buengkan",
  "บุรีรัมย์": "buriram", "ปทุมธานี": "pathumthani", "ประจวบคีรีขันธ์": "prachuapkhirikhan hua hin huahin",
  "ปราจีนบุรี": "prachinburi", "ปัตตานี": "pattani", "พระนครศรีอยุธยา": "ayutthaya phranakhonsiayutthaya",
  "พะเยา": "phayao", "พังงา": "phangnga khao lak", "พัทลุง": "phatthalung", "พิจิตร": "phichit",
  "พิษณุโลก": "phitsanulok", "เพชรบุรี": "phetchaburi chaam cha-am", "เพชรบูรณ์": "phetchabun khao kho", "แพร่": "phrae",
  "ภูเก็ต": "phuket", "มหาสารคาม": "mahasarakham", "มุกดาหาร": "mukdahan", "แม่ฮ่องสอน": "maehongson pai",
  "ยโสธร": "yasothon", "ยะลา": "yala betong", "ร้อยเอ็ด": "roiet", "ระนอง": "ranong",
  "ระยอง": "rayong koh samet", "ราชบุรี": "ratchaburi", "ลพบุรี": "lopburi", "ลำปาง": "lampang",
  "ลำพูน": "lamphun", "เลย": "loei chiang khan", "ศรีสะเกษ": "sisaket", "สกลนคร": "sakonnakhon",
  "สงขลา": "songkhla hatyai hat yai", "สตูล": "satun koh lipe", "สมุทรปราการ": "samutprakan", "สมุทรสงคราม": "samutsongkhram",
  "สมุทรสาคร": "samutsakhon", "สระแก้ว": "sakaeo", "สระบุรี": "saraburi", "สิงห์บุรี": "singburi",
  "สุโขทัย": "sukhothai", "สุพรรณบุรี": "suphanburi", "สุราษฎร์ธานี": "suratthani samui koh phangan tao", "สุรินทร์": "surin",
  "หนองคาย": "nongkhai", "หนองบัวลำภู": "nongbualamphu", "อ่างทอง": "angthong", "อำนาจเจริญ": "amnatcharoen",
  "อุดรธานี": "udonthani", "อุตรดิตถ์": "uttaradit", "อุทัยธานี": "uthaithani", "อุบลราชธานี": "ubonratchathani"
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
  highlights?: string[] | string;
  preparation?: string[] | string;
  itinerary?: string;
  itinerary_data?: any;
  included?: string[] | string;
  excluded?: string[] | string;
  conditions?: string[] | string;
}

const initialFormState = {
  title: "",
  price: "",
  child_price: "",
  province: "",
  region: "Central",
  duration: "1 day",
  category: "Nature",
  description: "",
  is_active: true,
  is_recommended: false,
  max_group_size: 15,
  rating: 0,
  review_count: 0,
  highlights_str: "",
  preparation_str: "",
  itinerary: "",
  itinerary_data: [{ day: 1, time: "", detail: "" }],
  included: "",
  excluded: "",
  conditions: "",
};

const API_URL = `${API_BASE_URL}/api/tours`;

// ─── Custom Select Component with Search ─────────────────────────────────────
interface Option {
  value: string | boolean;
  label: string;
  searchTerms?: string; // เพิ่มฟิลด์เก็บคำค้นหาภาษาอังกฤษ
}

const CustomSelect = ({
  value, onChange, options, className, hasError = false, enableSearch = false
}: {
  value: string | boolean;
  onChange: (val: any) => void;
  options: Option[];
  className?: string;
  hasError?: boolean;
  enableSearch?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // เคลียร์คำค้นหาเมื่อปิด
  useEffect(() => {
    if (!isOpen) setSearch("");
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => String(o.value) === String(value)) || (value ? { label: value } : options[0]);
  const errorClasses = hasError ? "ring-2 ring-red-500 bg-red-50 border-red-500 text-red-700" : "";

  // กรองข้อมูลตามที่พิมพ์ค้นหา (ตรวจสอบทั้ง label ภาษาไทย และ searchTerms ภาษาอังกฤษ)
  const filteredOptions = options.filter(opt => {
    const s = search.toLowerCase();
    const matchLabel = String(opt.label).toLowerCase().includes(s);
    const matchEnglish = opt.searchTerms ? opt.searchTerms.toLowerCase().includes(s) : false;
    return matchLabel || matchEnglish;
  });

  return (
    <div className="relative flex-1 sm:flex-none w-full" ref={ref}>
      <div
        className={`flex items-center justify-between ${className} ${errorClasses}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate flex-1 text-center">{selectedOption?.label}</span>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 shrink-0 ${hasError ? "text-red-500" : "text-[#4F200D]/50"} ${isOpen ? "rotate-180" : ""}`} />
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full min-w-[140px] mt-2 bg-white border-2 border-[#F6F1E9] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* ส่วนช่องค้นหาภายใน Dropdown */}
          {enableSearch && (
            <div className="p-2 border-b-2 border-[#F6F1E9] bg-white">
              <input
                autoFocus
                type="text"
                className="w-full px-3 py-2 text-sm bg-[#F6F1E9]/50 text-[#4F200D] font-bold border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] outline-none transition-all"
                placeholder="ค้นหา (ไทย/Eng)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="max-h-60 overflow-y-auto custom-scrollbar py-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={String(opt.value)}
                  className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors ${String(value) === String(opt.value) ? "bg-[#FFD93D]/30 text-[#FF8400]" : "text-[#4F200D] hover:bg-[#F6F1E9]"}`}
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-4 text-sm font-bold text-[#4F200D]/40 text-center">ไม่พบข้อมูล "{search}"</div>
            )}
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

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // รูปภาพ
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // ระบบแท็บแผนการเดินทาง
  const [activeDayTab, setActiveDayTab] = useState(1);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesRef = useRef<HTMLInputElement>(null);

  const getDaysFromDuration = (duration: string) => {
    if (!duration) return 1;
    if (duration.startsWith("1")) return 1;
    if (duration.startsWith("2")) return 2;
    if (duration.startsWith("3")) return 3;
    if (duration.startsWith("4")) return 4;
    if (duration.startsWith("5")) return 5;
    return 1;
  };

  const getSafeItinerary = () => {
    if (Array.isArray(formData.itinerary_data)) {
      return formData.itinerary_data.length > 0 ? formData.itinerary_data : [{ day: 1, time: "", detail: "" }];
    }
    return [{ day: 1, time: "", detail: "" }];
  };

  const maxDays = getDaysFromDuration(formData.duration);
  useEffect(() => {
    if (activeDayTab > maxDays) setActiveDayTab(maxDays);
  }, [maxDays, activeDayTab]);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?show_all=true`, { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Failed to fetch tours");
      const data = await response.json();
      setTours(data);
    } catch (err) {
      console.error("Could not load tours:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTours(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, regionFilter, categoryFilter, durationFilter]);

  const handleAddNew = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setErrors({});
    setCoverFile(null);
    setCoverPreview("");
    setAdditionalFiles([]);
    setExistingImages([]);
    setActiveDayTab(1);
    setIsModalOpen(true);
  };

  const handleEdit = (tour: Tour) => {
    setEditingId(tour.id);
    setErrors({});
    setActiveDayTab(1);

    const safeParseArray = (data: any): any[] => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (typeof data === "string") {
        try {
          const parsed = JSON.parse(data);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          if (data.startsWith("{") && data.endsWith("}")) {
            return data.slice(1, -1).split(",").map((s) => s.trim().replace(/^"|"$/g, "")).filter(Boolean);
          }
          return [data];
        }
      }
      return [data];
    };

    let parsedItinerary = safeParseArray(tour.itinerary_data);
    parsedItinerary = parsedItinerary.map((item: any) => {
      if (typeof item === "string") return { day: 1, time: "", detail: item };
      if (typeof item === "object" && item !== null) {
        return { day: item.day || 1, time: item.time || "", detail: item.detail || "" };
      }
      return { day: 1, time: "", detail: "" };
    });

    const finalItinerary = parsedItinerary.length > 0 ? parsedItinerary : [{ day: 1, time: "", detail: "" }];

    setFormData({
      title: tour.title || "",
      price: tour.price?.toString() || "",
      child_price: tour.child_price?.toString() || "",
      province: getProvinceLabel(tour.province || ""), 
      region: tour.region || "Central",
      duration: tour.duration || "1 day",
      category: tour.category || "Nature",
      description: tour.description || "",
      is_active: tour.is_active ?? true,
      is_recommended: tour.is_recommended ?? false,
      max_group_size: tour.max_group_size ?? 15,
      rating: tour.rating ?? 0,
      review_count: tour.review_count ?? 0,
      highlights_str: safeParseArray(tour.highlights).join(", "),
      preparation_str: safeParseArray(tour.preparation).join(", "),
      itinerary: tour.itinerary || "",
      itinerary_data: finalItinerary,
      included: safeParseArray(tour.included).join(", ") || (typeof tour.included === "string" ? tour.included : ""),
      excluded: safeParseArray(tour.excluded).join(", ") || (typeof tour.excluded === "string" ? tour.excluded : ""),
      conditions: safeParseArray(tour.conditions).join(", ") || (typeof tour.conditions === "string" ? tour.conditions : ""),
    });

    setCoverFile(null);
    setCoverPreview(getImageUrl(tour.image_cover));
    setAdditionalFiles([]);
    setExistingImages(safeParseArray(tour.images));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, boolean> = {};
    if (!formData.title.trim()) newErrors.title = true;
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = true;
    if (!formData.province.trim()) newErrors.province = true;
    if (!formData.description.trim()) newErrors.description = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const modalContent = document.getElementById("tour-modal-content");
      if (modalContent) modalContent.scrollTo({ top: 0, behavior: "smooth" });
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
    payload.append("is_active", formData.is_active ? "true" : "false");
    payload.append("is_recommended", formData.is_recommended ? "true" : "false");
    payload.append("max_group_size", String(Number(formData.max_group_size)));
    payload.append("rating", String(Number(formData.rating)));
    payload.append("review_count", String(Number(formData.review_count)));

    const highlights = formData.highlights_str.split(",").map((s) => s.trim()).filter((s) => s !== "");
    highlights.forEach((h) => payload.append("highlights", h));

    const preparation = formData.preparation_str.split(",").map((s) => s.trim()).filter((s) => s !== "");
    preparation.forEach((p) => payload.append("preparation", p));

    payload.append("itinerary", formData.itinerary);

    const safeItinerary = getSafeItinerary();
    payload.append("itinerary_data", JSON.stringify(safeItinerary.filter((i: any) => i.time && i.detail)));

    payload.append("included", formData.included);
    payload.append("excluded", formData.excluded);
    payload.append("conditions", formData.conditions);

    if (coverFile) payload.append("image_cover", coverFile);
    payload.append("images_updated", "true");
    existingImages.forEach((img) => payload.append("existing_images", img));
    additionalFiles.forEach((file) => payload.append("images", file));

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
      setExistingImages([]);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบทัวร์นี้?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE", headers: getAuthHeader() });
      if (!res.ok) throw new Error("Failed to delete tour");
      setTours((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete tour");
    }
  };

  // ─── เปลี่ยนสถานะเปิด-ปิดแบบ Inline ในตาราง ────────────────────────────────
  const handleInlineStatusChange = async (tour: Tour, newStatus: string) => {
    const isActive = newStatus === "active";
    if (tour.is_active === isActive) return;

    const originalTours = [...tours];
    // เปลี่ยนแปลง UI ทันที
    setTours(tours.map((t) => (t.id === tour.id ? { ...t, is_active: isActive } : t)));

    try {
      const response = await fetch(`${API_URL}/${tour.id}`, {
        method: "PATCH",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      // คืนค่าเดิมถ้าอัปเดตไม่สำเร็จ
      setTours(originalTours);
      alert("อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const updateItinerary = (index: number, field: "time" | "detail", value: string) => {
    const updated = getSafeItinerary().map((item: any, i: number) => i === index ? { ...item, [field]: value } : item);
    setFormData({ ...formData, itinerary_data: updated });
  };
  const addItineraryRow = () => setFormData({ ...formData, itinerary_data: [...getSafeItinerary(), { day: activeDayTab, time: "", detail: "" }] });
  const removeItineraryRow = (index: number) => setFormData({ ...formData, itinerary_data: getSafeItinerary().filter((_: any, i: number) => i !== index) });

  const getInputClass = (fieldName: string, baseClass: string) => {
    if (errors[fieldName]) return `${baseClass} ring-2 ring-red-500 bg-red-50 border-red-500 text-red-900 placeholder:text-red-300 transition-all`;
    return `${baseClass} bg-[#F6F1E9]/50 border-0 focus:bg-white focus:ring-2 focus:ring-[#FFD93D]`;
  };
  const getTextareaClass = (fieldName: string, baseClass: string) => {
    if (errors[fieldName]) return `${baseClass} ring-2 ring-red-500 bg-red-50 border-red-500 text-red-900 placeholder:text-red-300 transition-all outline-none`;
    return `${baseClass} bg-[#F6F1E9]/50 border-0 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D]`;
  };

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
  const selectTriggerClass = "text-sm border-0 bg-[#F6F1E9]/50 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-[#FFD93D] text-[#4F200D] font-bold cursor-pointer outline-none transition-all w-full";

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4F200D] tracking-tight">จัดการทัวร์</h1>
          <p className="text-xs sm:text-sm font-medium text-[#4F200D]/60 mt-1">จัดการทัวร์ของคุณ ดูความพร้อม และอัปเดตรายละเอียดต่างๆ</p>
        </div>
        <Button className="bg-[#FF8400] hover:bg-[#e67600] w-full sm:w-auto text-white shadow-lg shadow-[#FF8400]/20 rounded-xl px-6 py-5 text-sm font-bold transition-all" onClick={handleAddNew}>
          <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} /> เพิ่มทัวร์ใหม่
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-0 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#4F200D]/50 uppercase tracking-wider">ทัวร์ทั้งหมด</p>
            <p className="text-2xl sm:text-3xl font-black text-[#4F200D] mt-1">{tours.length}</p>
          </div>
          <div className="p-3 sm:p-4 bg-[#FFD93D]/30 rounded-2xl text-[#FF8400]"><MapPin className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} /></div>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-0 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#4F200D]/50 uppercase tracking-wider">เปิดใช้งาน</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{tours.filter((t) => t.is_active).length}</p>
          </div>
          <div className="p-3 sm:p-4 bg-[#FF8400]/10 rounded-2xl text-[#FF8400]"><Calendar className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} /></div>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-0 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#4F200D]/50 uppercase tracking-wider">หมวดหมู่</p>
            <p className="text-2xl sm:text-3xl font-black text-[#4F200D] mt-1">{new Set(tours.map((t) => t.category)).size}</p>
          </div>
          <div className="p-3 sm:p-4 bg-[#4F200D]/5 rounded-2xl text-[#4F200D]"><Users className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} /></div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-3xl border-0 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center w-full">
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F200D]/40 w-5 h-5" />
            <Input placeholder="ค้นหาทัวร์ด้วยชื่อ..." className="pl-12 py-5 sm:py-6 bg-[#F6F1E9]/50 border-0 rounded-2xl font-bold text-[#4F200D] placeholder:font-medium focus:bg-white focus:ring-2 focus:ring-[#FFD93D] transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:w-auto">
            <CustomSelect className={selectTriggerClass} value={regionFilter} onChange={setRegionFilter} options={[{ value: "all", label: "ทุกภูมิภาค" }, ...tourRegions]} />
            <CustomSelect className={selectTriggerClass} value={categoryFilter} onChange={setCategoryFilter} options={[{ value: "all", label: "ทุกหมวดหมู่" }, ...tourCategories]} />
            <CustomSelect className={selectTriggerClass} value={durationFilter} onChange={setDurationFilter} options={[{ value: "all", label: "ทุกระยะเวลา" }, ...tourDurations]} />
            <CustomSelect className={selectTriggerClass} value={statusFilter} onChange={setStatusFilter} options={[{ value: "all", label: "สถานะทั้งหมด" }, { value: "active", label: "เปิดใช้งาน" }, { value: "inactive", label: "ปิดใช้งาน" }]} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border-0 shadow-sm overflow-visible w-full">
        <div className="overflow-x-auto overflow-y-visible min-h-[300px]">
          <table className="w-full text-left text-sm min-w-[900px]">
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
                paginatedTours.map((tour) => {
                  const displayRegion = tourRegions.find((r) => r.value === tour.region)?.label || tour.region;
                  const displayCategory = tourCategories.find((c) => c.value === tour.category)?.label || tour.category;
                  const displayDuration = tourDurations.find((d) => d.value === tour.duration)?.label || tour.duration;

                  return (
                    <tr key={tour.id} className="hover:bg-[#FFD93D]/5 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F6F1E9] flex-shrink-0 shadow-sm">
                            <img src={getImageUrl(tour.image_cover)} alt="" className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).src = "https://placehold.co/80x80?text=No+Img")} />
                          </div>
                          <div>
                            <p className="font-bold text-[#4F200D] group-hover:text-[#FF8400] transition-colors line-clamp-1">{tour.title}</p>
                            <p className="text-xs font-semibold text-[#4F200D]/50 mt-0.5">{tour.province}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-black text-[#4F200D]">฿{Number(tour.price).toLocaleString()}</td>
                      <td className="px-6 py-5 font-bold text-[#4F200D]/70">{displayRegion}</td>
                      <td className="px-6 py-5 font-bold text-[#4F200D]/70">{displayDuration}</td>
                      <td className="px-6 py-5 font-bold text-[#4F200D]/70 capitalize">{displayCategory}</td>
                      <td className="px-6 py-5 relative">
                        <div className="flex flex-col gap-2 items-start w-[130px]">
                          <CustomSelect
                            value={tour.is_active ? "active" : "inactive"}
                            onChange={(val) => handleInlineStatusChange(tour, String(val))}
                            options={[
                              { value: "active", label: "เปิดใช้งาน" },
                              { value: "inactive", label: "ปิดใช้งาน" },
                            ]}
                            className={`w-full px-3 py-1.5 rounded-full border-2 font-bold text-[11px] sm:text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#FFD93D] transition-colors shadow-sm ${
                              tour.is_active
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                            }`}
                            menuPlacement="auto"
                          />
                          {tour.is_recommended && <Badge className="border-0 shadow-none px-3 py-1 font-bold bg-[#FF8400]/15 text-[#FF8400] w-full justify-center rounded-xl">⭐ แนะนำ</Badge>}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-[#4F200D]/40 hover:text-[#FF8400] hover:bg-[#FF8400]/10 rounded-xl" onClick={() => handleEdit(tour)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-[#4F200D]/40 hover:text-red-500 hover:bg-red-50 rounded-xl" onClick={() => handleDelete(tour.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between sm:justify-center gap-4 bg-white border-t-2 border-[#F6F1E9] relative">
            <p className="text-xs sm:text-sm font-semibold text-[#4F200D]/50 sm:absolute sm:left-6">
              แสดง <span className="text-[#FF8400]">{processedTours.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> ถึง <span className="text-[#FF8400]">{Math.min(currentPage * itemsPerPage, processedTours.length)}</span> จาก <span className="text-[#FF8400]">{processedTours.length}</span> รายการ
            </p>
            <div className="flex items-center gap-1 bg-[#F6F1E9]/30 p-1.5 rounded-2xl border-2 border-[#F6F1E9] z-10">
              <Button variant="ghost" size="icon" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="h-8 w-8 text-[#4F200D] font-bold rounded-xl hover:bg-[#FFD93D]/30 hover:text-[#FF8400] transition-colors disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></Button>
              <div className="flex items-center gap-1 mx-1 flex-wrap justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button key={page} variant="ghost" onClick={() => setCurrentPage(page)} className={`h-8 w-8 p-0 text-sm font-black rounded-xl transition-all ${currentPage === page ? "bg-[#FF8400] text-white shadow-md shadow-[#FF8400]/20" : "text-[#4F200D]/60 hover:bg-[#FFD93D]/30 hover:text-[#FF8400]"}`}>{page}</Button>
                ))}
              </div>
              <Button variant="ghost" size="icon" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="h-8 w-8 text-[#4F200D] font-bold rounded-xl hover:bg-[#FFD93D]/30 hover:text-[#FF8400] transition-colors disabled:opacity-30"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4F200D]/60 backdrop-blur-sm p-4 overflow-y-auto pt-16 md:pt-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-auto">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b-2 border-[#F6F1E9] bg-white rounded-t-3xl sticky top-0 z-10">
              <h2 className="text-xl sm:text-2xl font-black text-[#4F200D]">{editingId ? "แก้ไขทัวร์" : "สร้างทัวร์ใหม่"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#4F200D]/40 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"><X className="w-6 h-6" /></button>
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="mx-5 sm:mx-6 mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3 text-red-800">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs sm:text-sm font-bold">กรุณากรอกข้อมูลในช่องที่มีสีแดงให้ครบถ้วนและถูกต้อง</p>
              </div>
            )}

            <form onSubmit={handleSubmit} id="tour-modal-content" className="p-5 sm:p-6 space-y-5 max-h-[65vh] sm:max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">ชื่อทัวร์ *</label>
                <Input value={formData.title} onChange={(e) => { setFormData({ ...formData, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: false }); }} placeholder="เช่น ทริปดำน้ำสุดฟิน" className={getInputClass("title", "rounded-xl font-bold text-[#4F200D]")} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">ราคา (฿) *</label>
                  <Input type="number" min="0" step="0.01" value={formData.price} onChange={(e) => { setFormData({ ...formData, price: e.target.value }); if (errors.price) setErrors({ ...errors, price: false }); }} className={getInputClass("price", "rounded-xl font-bold text-[#4F200D]")} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">ราคาเด็ก (฿)</label>
                  <Input type="number" min="0" step="0.01" value={formData.child_price} onChange={(e) => setFormData({ ...formData, child_price: e.target.value })} className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">ระยะเวลา *</label>
                  <CustomSelect className={selectTriggerClass} value={formData.duration} onChange={(val) => setFormData({ ...formData, duration: val })} options={tourDurations} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">ภูมิภาค *</label>
                  <CustomSelect className={selectTriggerClass} value={formData.region} onChange={(val) => setFormData({ ...formData, region: val })} options={tourRegions} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">จังหวัด *</label>
                  <CustomSelect
                    className={selectTriggerClass}
                    value={formData.province}
                    onChange={(val) => { setFormData({ ...formData, province: val }); if (errors.province) setErrors({ ...errors, province: false }); }}
                    options={[
                      { value: "", label: "-- เลือกจังหวัด --" },
                      ...THAI_PROVINCES.map((p) => ({ value: p, label: p, searchTerms: PROVINCE_EN_MAPPING[p] || "" }))
                    ]}
                    hasError={errors.province}
                    enableSearch={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">หมวดหมู่ *</label>
                  <CustomSelect className={selectTriggerClass} value={formData.category} onChange={(val) => setFormData({ ...formData, category: val })} options={tourCategories} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">สถานะ</label>
                  <CustomSelect className={selectTriggerClass} value={formData.is_active ? "active" : "inactive"} onChange={(val) => setFormData({ ...formData, is_active: val === "active" })} options={[{ value: "active", label: "เปิดใช้งาน" }, { value: "inactive", label: "ปิดใช้งาน" }]} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">แนะนำ</label>
                  <CustomSelect className={selectTriggerClass} value={formData.is_recommended ? "yes" : "no"} onChange={(val) => setFormData({ ...formData, is_recommended: val === "yes" })} options={[{ value: "no", label: "ไม่แนะนำ" }, { value: "yes", label: "⭐ แนะนำ" }]} />
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-[#F6F1E9]/30 rounded-2xl border-2 border-[#F6F1E9] space-y-5">
                <div className="space-y-2 overflow-hidden">
                  <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#FF8400]" /> รูปภาพหน้าปก</label>
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) { setCoverFile(e.target.files[0]); setCoverPreview(URL.createObjectURL(e.target.files[0])); } }} />
                  <div className="flex flex-wrap gap-3 mt-3 items-center">
                    {coverPreview && (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-[#F6F1E9] w-32 h-32 group">
                        <img src={coverPreview} alt="preview" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => { setCoverPreview(""); setCoverFile(null); }} className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><X className="w-3 h-3" /></button>
                      </div>
                    )}
                    <button type="button" onClick={() => coverInputRef.current?.click()} className="w-32 h-32 rounded-2xl border-2 border-dashed border-[#4F200D]/20 bg-white flex flex-col items-center justify-center text-[#4F200D]/50 hover:bg-[#F6F1E9] hover:border-[#FF8400] hover:text-[#FF8400] transition-colors">
                      <Plus className="w-6 h-6 mb-2" />
                      <span className="text-xs font-bold">{coverPreview ? "เปลี่ยนรูปหน้าปก" : "เพิ่มรูปหน้าปก"}</span>
                    </button>
                  </div>
                </div>
                <div className="h-px bg-[#F6F1E9] w-full" />
                <div className="space-y-2 overflow-hidden">
                  <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#FF8400]" /> รูปภาพเพิ่มเติม (อัปโหลดหลายไฟล์ได้)</label>
                  <input ref={additionalImagesRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => { if (e.target.files && e.target.files.length > 0) { const newFiles = Array.from(e.target.files); setAdditionalFiles((prev) => [...prev, ...newFiles]); setTimeout(() => { if (additionalImagesRef.current) additionalImagesRef.current.value = ""; }, 0); } }} />
                  <div className="flex flex-wrap gap-3 mt-3 items-center">
                    {existingImages.map((img, idx) => (
                      <div key={`exist-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#F6F1E9] group shadow-sm">
                        <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setExistingImages((prev) => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    {additionalFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#FFD93D] group shadow-sm">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setAdditionalFiles((prev) => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => additionalImagesRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-[#FF8400] bg-[#FF8400]/5 flex flex-col items-center justify-center text-[#FF8400] hover:bg-[#FF8400]/20 transition-colors shadow-sm">
                      <Plus className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold">เพิ่มรูป</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">รายละเอียด *</label>
                <textarea className={getTextareaClass("description", "w-full p-4 border-0 rounded-2xl text-[#4F200D] font-bold text-xs sm:text-sm min-h-[100px] resize-none")} value={formData.description} onChange={(e) => { setFormData({ ...formData, description: e.target.value }); if (errors.description) setErrors({ ...errors, description: false }); }} />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider flex items-center gap-2">ไฮไลท์ <span className="text-[#4F200D]/40 font-bold text-[10px]">(คั่นด้วยคอมม่า)</span></label>
                <textarea className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-xs sm:text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none" value={formData.highlights_str} onChange={(e) => setFormData({ ...formData, highlights_str: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider flex items-center gap-2">สิ่งที่ต้องเตรียม <span className="text-[#4F200D]/40 font-bold text-[10px]">(คั่นด้วยคอมม่า)</span></label>
                <textarea className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-xs sm:text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none" value={formData.preparation_str} onChange={(e) => setFormData({ ...formData, preparation_str: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">แผนการเดินทาง (แบบข้อความสรุป)</label>
                <textarea className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-xs sm:text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none" value={formData.itinerary} onChange={(e) => setFormData({ ...formData, itinerary: e.target.value })} />
              </div>

              <div className="space-y-3 bg-[#F6F1E9]/30 p-4 sm:p-5 rounded-2xl border-2 border-[#F6F1E9]">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">แผนการเดินทาง (กำหนดเวลา)</label>
                  <button type="button" onClick={addItineraryRow} className="text-[10px] sm:text-xs text-[#FF8400] hover:text-white font-bold bg-[#FFD93D]/30 hover:bg-[#FF8400] px-2 sm:px-3 py-1.5 rounded-lg transition-colors">+ เพิ่มขั้นตอน</button>
                </div>
                {maxDays > 1 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto custom-scrollbar pb-2">
                    {Array.from({ length: maxDays }).map((_, i) => (
                      <button key={i} type="button" onClick={() => setActiveDayTab(i + 1)} className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-colors ${activeDayTab === i + 1 ? "bg-[#FF8400] text-white shadow-sm" : "bg-[#F6F1E9] text-[#4F200D]/50 hover:bg-[#FFD93D]/50"}`}>วันที่ {i + 1}</button>
                    ))}
                  </div>
                )}
                {getSafeItinerary().map((item: any, index: number) => {
                  if ((item.day || 1) !== activeDayTab) return null;
                  return (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center animate-in fade-in duration-300">
                      <Input className="w-full sm:w-28 bg-white border-0 rounded-xl focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]" placeholder="08:30" value={item.time || ""} onChange={(e) => updateItinerary(index, "time", e.target.value)} />
                      <div className="flex w-full gap-2 items-center">
                        <Input className="flex-1 bg-white border-0 rounded-xl focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]" placeholder="รายละเอียดกิจกรรม..." value={item.detail || ""} onChange={(e) => updateItinerary(index, "detail", e.target.value)} />
                        <button type="button" onClick={() => removeItineraryRow(index)} className="p-2 hover:bg-red-100 rounded-xl transition-colors text-red-500 shrink-0"><X className="w-5 h-5" /></button>
                      </div>
                    </div>
                  );
                })}
                {getSafeItinerary().filter((item: any) => (item.day || 1) === activeDayTab).length === 0 && (
                  <div className="text-center py-4 text-[#4F200D]/40 font-bold text-sm">ไม่มีข้อมูลสำหรับวันที่ {activeDayTab}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">ราคานี้รวม</label>
                <textarea className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-xs sm:text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none" value={formData.included} onChange={(e) => setFormData({ ...formData, included: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">ราคานี้ไม่รวม</label>
                <textarea className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-xs sm:text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none" value={formData.excluded} onChange={(e) => setFormData({ ...formData, excluded: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">เงื่อนไขและข้อตกลง</label>
                <textarea className="w-full p-4 border-0 bg-[#F6F1E9]/50 rounded-2xl text-[#4F200D] font-bold text-xs sm:text-sm min-h-[80px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D] resize-none" value={formData.conditions} onChange={(e) => setFormData({ ...formData, conditions: e.target.value })} />
              </div>

              <div className="pt-6 pb-2 flex items-center justify-end gap-3 sticky bottom-0 bg-white border-t-2 border-[#F6F1E9] mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="hover:bg-[#F6F1E9] text-[#4F200D] font-bold rounded-xl px-4 sm:px-6">ยกเลิก</Button>
                <Button type="submit" className="bg-[#FF8400] hover:bg-[#e67600] text-white font-bold shadow-lg shadow-[#FF8400]/20 rounded-xl min-w-[130px] px-4 sm:px-6" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> กำลังบันทึก...</> : editingId ? "อัปเดตทัวร์" : "บันทึกทัวร์"}
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