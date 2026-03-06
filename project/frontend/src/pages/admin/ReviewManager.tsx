import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MessageSquare,
  Pencil,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/config/api";

interface ReviewUser {
  id: string;
  username?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
}

interface ReviewTour {
  id: string;
  title?: string;
  province?: string;
}

interface ReviewBooking {
  id: string;
  bookingReference?: string;
  travelDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

interface ReviewItem {
  id: string;
  bookingId: string;
  userId: string;
  tourId: string;
  rating: number;
  comment?: string | null;
  is_recommended: boolean;
  createdAt: string;
  updatedAt: string;
  user?: ReviewUser;
  tour?: ReviewTour;
  booking?: ReviewBooking;
}

interface ReviewListResponse {
  data: ReviewItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Option {
  value: string;
  label: string;
}

interface FeedbackState {
  title: string;
  message: string;
  variant: "success" | "error";
}

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("jwt_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const API_URL = `${API_BASE_URL}/api/reviews/admin`;

const STAR_OPTIONS = ["all", "5", "4", "3", "2", "1"];

const statusOptions: Option[] = [
  { value: "all", label: "ทุกรีวิว" },
  { value: "recommended", label: "เฉพาะแนะนำ" },
  { value: "not_recommended", label: "ยังไม่แนะนำ" },
];

const pageSizeOptions: Option[] = [
  { value: "8", label: "8 รายการ" },
  { value: "12", label: "12 รายการ" },
  { value: "20", label: "20 รายการ" },
];

const getDisplayName = (user?: ReviewUser) => {
  if (!user) return "ผู้ใช้งาน";
  if (user.full_name?.trim()) return user.full_name;

  const fullName = [user.first_name, user.last_name]
    .filter((part) => Boolean(part && part.trim()))
    .join(" ")
    .trim();

  return fullName || user.username || "ผู้ใช้งาน";
};

const formatDate = (date?: string | null) => {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getTravelDateLabel = (booking?: ReviewBooking) => {
  if (!booking) return "-";
  if (booking.startDate && booking.endDate) {
    return `${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}`;
  }
  return formatDate(booking.travelDate || booking.startDate || booking.endDate);
};

const renderStars = (rating: number) => {
  const safeRating = Math.max(1, Math.min(5, Math.round(rating || 0)));

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, idx) => (
        <Star
          key={`star-${safeRating}-${idx}`}
          className={`w-4 h-4 ${idx < safeRating ? "fill-[#FFD93D] text-[#FFD93D]" : "text-[#E7DED3]"}`}
        />
      ))}
    </div>
  );
};

const CustomSelect = ({
  value,
  onChange,
  options,
  className,
  containerClassName,
  menuPlacement = "bottom",
}: {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  className?: string;
  containerClassName?: string;
  menuPlacement?: "top" | "bottom" | "auto";
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resolvedPlacement, setResolvedPlacement] = useState<"top" | "bottom">(
    "bottom",
  );
  const [menuMaxHeight, setMenuMaxHeight] = useState(240);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const updateMenuLayout = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const spaceAbove = rect.top - 12;
      const spaceBelow = window.innerHeight - rect.bottom - 12;

      const nextPlacement =
        menuPlacement === "auto"
          ? spaceBelow < 220 && spaceAbove > spaceBelow
            ? "top"
            : "bottom"
          : menuPlacement;

      setResolvedPlacement(nextPlacement === "top" ? "top" : "bottom");

      const availableSpace = nextPlacement === "top" ? spaceAbove : spaceBelow;
      setMenuMaxHeight(
        Math.max(120, Math.min(240, Math.floor(availableSpace))),
      );
    };

    updateMenuLayout();
    window.addEventListener("resize", updateMenuLayout);
    window.addEventListener("scroll", updateMenuLayout, true);

    return () => {
      window.removeEventListener("resize", updateMenuLayout);
      window.removeEventListener("scroll", updateMenuLayout, true);
    };
  }, [isOpen, menuPlacement]);

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  return (
    <div
      className={
        containerClassName ?? "relative flex-1 sm:flex-none w-full sm:w-auto"
      }
      ref={ref}
    >
      <div
        className={`flex items-center justify-between ${className}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={`w-4 h-4 ml-2 transition-transform duration-200 text-[#4F200D]/50 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div
          className={`absolute z-[90] w-full min-w-[150px] bg-white border-2 border-[#F6F1E9] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
            resolvedPlacement === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div
            className="overflow-y-auto custom-scrollbar py-2"
            style={{ maxHeight: `${menuMaxHeight}px` }}
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors ${
                  value === opt.value
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

const FeedbackModal = ({
  feedback,
  onClose,
}: {
  feedback: FeedbackState;
  onClose: () => void;
}) => {
  const isSuccess = feedback.variant === "success";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#4F200D]/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#F6F1E9] overflow-hidden">
        <div className="px-6 pt-6 pb-4 flex items-start gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isSuccess
                ? "bg-emerald-100 text-emerald-600"
                : "bg-red-100 text-red-500"
            }`}
          >
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-black text-[#4F200D]">
              {feedback.title}
            </h3>
            <p className="text-sm text-[#4F200D]/70 mt-1 leading-relaxed">
              {feedback.message}
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 pt-2">
          <Button
            onClick={onClose}
            className={`w-full rounded-xl text-white font-bold ${
              isSuccess
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-[#FF8400] hover:bg-[#e67600]"
            }`}
          >
            รับทราบ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function ReviewManager() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [recommendedFilter, setRecommendedFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);

  const [editRating, setEditRating] = useState("5");
  const [editRecommended, setEditRecommended] = useState("false");
  const [editComment, setEditComment] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const selectTriggerClass =
    "text-sm border-0 bg-[#F6F1E9]/50 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-[#FFD93D] text-[#4F200D] font-bold cursor-pointer outline-none transition-all w-full";

  const fetchReviews = useCallback(
    async (targetPage: number) => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          limit: String(itemsPerPage),
        });

        if (searchQuery.trim()) {
          params.append("search", searchQuery.trim());
        }

        if (recommendedFilter === "recommended") {
          params.append("recommended", "true");
        } else if (recommendedFilter === "not_recommended") {
          params.append("recommended", "false");
        }

        if (ratingFilter !== "all") {
          params.append("rating", ratingFilter);
        }

        const res = await fetch(`${API_URL}?${params.toString()}`, {
          headers: getAuthHeader(),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          const message =
            (Array.isArray(err?.message)
              ? err.message.join("\n")
              : err?.message) || "ไม่สามารถโหลดข้อมูลรีวิวได้";
          throw new Error(message);
        }

        const payload = (await res.json()) as ReviewListResponse;
        setReviews(Array.isArray(payload.data) ? payload.data : []);
        setTotalItems(Number(payload.total || 0));
        setTotalPages(Math.max(1, Number(payload.totalPages || 1)));
      } catch (error: any) {
        setReviews([]);
        setTotalItems(0);
        setTotalPages(1);
        setFeedback({
          title: "โหลดข้อมูลไม่สำเร็จ",
          message: error?.message || "กรุณาลองใหม่อีกครั้ง",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage, ratingFilter, recommendedFilter, searchQuery],
  );

  useEffect(() => {
    void fetchReviews(currentPage);
  }, [currentPage, fetchReviews]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, ratingFilter, recommendedFilter, searchQuery]);

  const recommendedCountOnPage = useMemo(
    () => reviews.filter((review) => review.is_recommended).length,
    [reviews],
  );

  const openEditModal = (review: ReviewItem) => {
    setEditingReview(review);
    setEditRating(String(review.rating || 5));
    setEditRecommended(review.is_recommended ? "true" : "false");
    setEditComment(review.comment || "");
  };

  const saveReviewEdit = async () => {
    if (!editingReview) return;

    try {
      setIsSaving(true);

      const response = await fetch(`${API_URL}/${editingReview.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          rating: Number(editRating),
          comment: editComment,
          is_recommended: editRecommended === "true",
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        const message =
          (Array.isArray(err?.message)
            ? err.message.join("\n")
            : err?.message) || "อัปเดตรีวิวไม่สำเร็จ";
        throw new Error(message);
      }

      setEditingReview(null);
      setFeedback({
        title: "บันทึกสำเร็จ",
        message: "อัปเดตรีวิวเรียบร้อยแล้ว",
        variant: "success",
      });

      await fetchReviews(currentPage);
    } catch (error: any) {
      setFeedback({
        title: "บันทึกไม่สำเร็จ",
        message: error?.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setRecommendedFilter("all");
    setRatingFilter("all");
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i += 1) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4F200D] tracking-tight">
            จัดการรีวิว
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#4F200D]/60 mt-1">
            ดูรายละเอียด แก้ไขคะแนน และเลือกรีวิวแนะนำสำหรับหน้าแรก
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-0 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#4F200D]/50 uppercase tracking-wider">
              รีวิวทั้งหมด
            </p>
            <p className="text-2xl sm:text-3xl font-black text-[#4F200D] mt-1">
              {totalItems}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-[#FFD93D]/30 rounded-2xl text-[#FF8400]">
            <MessageSquare
              className="w-6 h-6 sm:w-7 sm:h-7"
              strokeWidth={2.5}
            />
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border-0 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#4F200D]/50 uppercase tracking-wider">
              รีวิวแนะนำ
            </p>
            <p className="text-2xl sm:text-3xl font-black text-[#4F200D] mt-1">
              {recommendedCountOnPage}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-[#FF8400]/10 rounded-2xl text-[#FF8400]">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-3xl border-0 shadow-sm">
        <div className="flex flex-col xl:flex-row gap-3 xl:items-center w-full">
          <div className="relative w-full xl:flex-1 xl:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F200D]/40 w-5 h-5" />
            <Input
              placeholder="ค้นหาชื่อลูกค้า, ทัวร์, เลขอ้างอิง, ความคิดเห็น..."
              className="pl-12 h-12 bg-[#F6F1E9]/60 border-0 rounded-2xl font-semibold text-[#4F200D] placeholder:font-medium focus:bg-white focus:ring-2 focus:ring-[#FFD93D] transition-all"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 w-full xl:w-auto xl:min-w-[530px]">
            <CustomSelect
              className={selectTriggerClass}
              value={recommendedFilter}
              onChange={setRecommendedFilter}
              options={statusOptions}
            />
            <CustomSelect
              className={selectTriggerClass}
              value={ratingFilter}
              onChange={setRatingFilter}
              options={STAR_OPTIONS.map((value) => ({
                value,
                label: value === "all" ? "ทุกคะแนน" : `${value} ดาว`,
              }))}
            />
            <CustomSelect
              className={selectTriggerClass}
              value={String(itemsPerPage)}
              onChange={(value) => setItemsPerPage(Number(value))}
              options={pageSizeOptions}
            />
          </div>

          <Button
            variant="ghost"
            onClick={clearFilters}
            className="w-full md:w-auto xl:ml-auto h-12 px-5 text-[#4F200D]/70 hover:text-[#FF8400] hover:bg-[#FFD93D]/20 font-bold rounded-xl"
          >
            ล้างตัวกรอง
          </Button>
        </div>
      </div>

      <div className="xl:hidden grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {loading ? (
          <div className="lg:col-span-2 bg-white rounded-3xl p-10 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#FF8400]" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="lg:col-span-2 bg-white rounded-3xl p-10 text-center text-[#4F200D]/50 font-bold">
            ไม่พบรีวิวตามเงื่อนไขที่เลือก
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-3xl p-5 border-0 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold text-[#4F200D] leading-tight">
                    {getDisplayName(review.user)}
                  </p>
                  <p className="text-xs text-[#4F200D]/55 mt-1">
                    {review.tour?.title || "ไม่พบชื่อทัวร์"}
                  </p>
                </div>
                <Badge
                  className={`border-0 shadow-none px-3 py-1 font-bold ${
                    review.is_recommended
                      ? "bg-[#FF8400]/15 text-[#FF8400]"
                      : "bg-[#F6F1E9] text-[#4F200D]/60"
                  }`}
                >
                  {review.is_recommended ? "⭐ แนะนำ" : "ทั่วไป"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                {renderStars(review.rating)}
                <span className="text-xs font-semibold text-[#4F200D]/50">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              <p className="text-sm text-[#4F200D]/75 leading-relaxed line-clamp-3 min-h-[60px]">
                {review.comment?.trim() || "-"}
              </p>

              <div className="text-xs text-[#4F200D]/50 font-semibold">
                Ref:{" "}
                {review.booking?.bookingReference ||
                  review.bookingId.slice(0, 8)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <Button
                  variant="ghost"
                  className="w-full justify-center rounded-xl text-[#4F200D]/70 hover:text-[#FF8400] hover:bg-[#FFD93D]/20 text-sm"
                  onClick={() => setSelectedReview(review)}
                >
                  <Eye className="w-4 h-4 mr-2" /> รายละเอียด
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-center rounded-xl text-[#4F200D]/70 hover:text-[#FF8400] hover:bg-[#FFD93D]/20 text-sm"
                  onClick={() => openEditModal(review)}
                >
                  <Pencil className="w-4 h-4 mr-2" /> แก้ไข
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden xl:block bg-white rounded-3xl border-0 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[980px]">
            <thead className="bg-[#F6F1E9]/80 border-b-2 border-[#F6F1E9]">
              <tr>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                  ผู้รีวิว
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                  ทัวร์
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                  คะแนน
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                  สถานะ
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                  วันที่
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs text-right">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6F1E9]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#FF8400]" />
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center font-bold text-[#4F200D]/40"
                  >
                    ไม่พบข้อมูลรีวิว
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr
                    key={review.id}
                    className="hover:bg-[#FFD93D]/5 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <p className="font-bold text-[#4F200D]">
                        {getDisplayName(review.user)}
                      </p>
                      <p className="text-xs text-[#4F200D]/50 mt-1">
                        {review.booking?.bookingReference ||
                          review.bookingId.slice(0, 8)}
                      </p>
                    </td>
                    <td className="px-6 py-5 font-semibold text-[#4F200D]/75">
                      {review.tour?.title || "-"}
                    </td>
                    <td className="px-6 py-5">{renderStars(review.rating)}</td>
                    <td className="px-6 py-5">
                      <Badge
                        className={`border-0 shadow-none px-3 py-1 font-bold ${
                          review.is_recommended
                            ? "bg-[#FF8400]/15 text-[#FF8400]"
                            : "bg-[#F6F1E9] text-[#4F200D]/60"
                        }`}
                      >
                        {review.is_recommended ? "⭐ แนะนำ" : "ทั่วไป"}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 font-semibold text-[#4F200D]/55">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-[#4F200D]/40 hover:text-[#FF8400] hover:bg-[#FF8400]/10 rounded-xl"
                          onClick={() => setSelectedReview(review)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-[#4F200D]/40 hover:text-[#FF8400] hover:bg-[#FF8400]/10 rounded-xl"
                          onClick={() => openEditModal(review)}
                        >
                          <Pencil className="w-4 h-4" />
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

      <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#F6F1E9] rounded-3xl">
        <p className="text-xs sm:text-sm font-semibold text-[#4F200D]/50">
          แสดง <span className="text-[#FF8400]">{startItem}</span> ถึง{" "}
          <span className="text-[#FF8400]">{endItem}</span> จาก{" "}
          <span className="text-[#FF8400]">{totalItems}</span> รีวิว
        </p>
        <div className="flex items-center gap-1 bg-[#F6F1E9]/30 p-1.5 rounded-2xl border-2 border-[#F6F1E9]">
          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="h-8 w-8 text-[#4F200D] font-bold rounded-xl hover:bg-[#FFD93D]/30 hover:text-[#FF8400] transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1 mx-1">
            {pageNumbers.map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-[#4F200D]/35 text-sm"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant="ghost"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 min-w-8 px-2 rounded-xl text-sm font-black transition-all ${
                    currentPage === page
                      ? "bg-[#FF8400] text-white shadow-sm"
                      : "text-[#4F200D]/60 hover:bg-[#FFD93D]/30 hover:text-[#FF8400]"
                  }`}
                >
                  {page}
                </Button>
              ),
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage >= totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            className="h-8 w-8 text-[#4F200D] font-bold rounded-xl hover:bg-[#FFD93D]/30 hover:text-[#FF8400] transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {selectedReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4F200D]/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#F6F1E9]">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b-2 border-[#F6F1E9] bg-white">
              <h2 className="text-xl sm:text-2xl font-black text-[#4F200D]">
                รายละเอียดรีวิว
              </h2>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-[#4F200D]/40 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F6F1E9]/45 rounded-2xl p-4">
                  <p className="text-xs font-bold text-[#4F200D]/50 uppercase tracking-wider">
                    ผู้รีวิว
                  </p>
                  <p className="font-black text-[#4F200D] mt-1">
                    {getDisplayName(selectedReview.user)}
                  </p>
                </div>
                <div className="bg-[#F6F1E9]/45 rounded-2xl p-4">
                  <p className="text-xs font-bold text-[#4F200D]/50 uppercase tracking-wider">
                    ทัวร์
                  </p>
                  <p className="font-black text-[#4F200D] mt-1">
                    {selectedReview.tour?.title || "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F6F1E9]/45 rounded-2xl p-4">
                  <p className="text-xs font-bold text-[#4F200D]/50 uppercase tracking-wider">
                    คะแนน
                  </p>
                  <div className="mt-1">
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>
                <div className="bg-[#F6F1E9]/45 rounded-2xl p-4">
                  <p className="text-xs font-bold text-[#4F200D]/50 uppercase tracking-wider">
                    สถานะ
                  </p>
                  <Badge
                    className={`mt-2 border-0 shadow-none px-3 py-1 font-bold ${
                      selectedReview.is_recommended
                        ? "bg-[#FF8400]/15 text-[#FF8400]"
                        : "bg-white text-[#4F200D]/60"
                    }`}
                  >
                    {selectedReview.is_recommended ? "⭐ แนะนำ" : "ทั่วไป"}
                  </Badge>
                </div>
              </div>

              <div className="bg-[#F6F1E9]/45 rounded-2xl p-4">
                <p className="text-xs font-bold text-[#4F200D]/50 uppercase tracking-wider">
                  ข้อความรีวิว
                </p>
                <p className="text-sm text-[#4F200D]/80 mt-2 leading-relaxed whitespace-pre-wrap">
                  {selectedReview.comment?.trim() || "-"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F6F1E9]/45 rounded-2xl p-4">
                  <p className="text-xs font-bold text-[#4F200D]/50 uppercase tracking-wider">
                    เลขอ้างอิงการจอง
                  </p>
                  <p className="font-black text-[#4F200D] mt-1">
                    {selectedReview.booking?.bookingReference ||
                      selectedReview.bookingId}
                  </p>
                </div>
                <div className="bg-[#F6F1E9]/45 rounded-2xl p-4">
                  <p className="text-xs font-bold text-[#4F200D]/50 uppercase tracking-wider">
                    วันเดินทาง
                  </p>
                  <p className="font-black text-[#4F200D] mt-1">
                    {getTravelDateLabel(selectedReview.booking)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F6F1E9]/45 rounded-2xl p-4">
                  <p className="text-xs font-bold text-[#4F200D]/50 uppercase tracking-wider">
                    วันที่สร้าง
                  </p>
                  <p className="font-semibold text-[#4F200D] mt-1">
                    {formatDate(selectedReview.createdAt)}
                  </p>
                </div>
                <div className="bg-[#F6F1E9]/45 rounded-2xl p-4">
                  <p className="text-xs font-bold text-[#4F200D]/50 uppercase tracking-wider">
                    อัปเดตล่าสุด
                  </p>
                  <p className="font-semibold text-[#4F200D] mt-1">
                    {formatDate(selectedReview.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 border-t-2 border-[#F6F1E9] flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setSelectedReview(null)}
                className="rounded-xl text-[#4F200D]/70 hover:text-[#4F200D] hover:bg-[#F6F1E9]"
              >
                ปิด
              </Button>
              <Button
                onClick={() => {
                  openEditModal(selectedReview);
                  setSelectedReview(null);
                }}
                className="rounded-xl bg-[#FF8400] hover:bg-[#e67600] text-white"
              >
                <Pencil className="w-4 h-4 mr-2" /> แก้ไขรีวิว
              </Button>
            </div>
          </div>
        </div>
      )}

      {editingReview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#4F200D]/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#F6F1E9]">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b-2 border-[#F6F1E9] bg-white">
              <h2 className="text-xl sm:text-2xl font-black text-[#4F200D]">
                แก้ไขรีวิว
              </h2>
              <button
                onClick={() => setEditingReview(null)}
                className="text-[#4F200D]/40 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">
                  ผู้รีวิว
                </label>
                <div className="rounded-2xl bg-[#F6F1E9]/45 px-4 py-3 text-sm font-bold text-[#4F200D]">
                  {getDisplayName(editingReview.user)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    คะแนน
                  </label>
                  <CustomSelect
                    value={editRating}
                    onChange={setEditRating}
                    options={["5", "4", "3", "2", "1"].map((value) => ({
                      value,
                      label: `${value} ดาว`,
                    }))}
                    className={selectTriggerClass}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    แสดงหน้าแรก
                  </label>
                  <CustomSelect
                    value={editRecommended}
                    onChange={setEditRecommended}
                    options={[
                      { value: "true", label: "⭐ แนะนำ" },
                      { value: "false", label: "ไม่แนะนำ" },
                    ]}
                    className={selectTriggerClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">
                  ข้อความรีวิว
                </label>
                <textarea
                  className="w-full min-h-[150px] rounded-2xl border-0 bg-[#F6F1E9]/50 px-4 py-3 text-sm font-medium text-[#4F200D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                  value={editComment}
                  onChange={(event) => setEditComment(event.target.value)}
                  placeholder="กรอกข้อความรีวิว"
                />
              </div>
            </div>

            <div className="p-5 sm:p-6 border-t-2 border-[#F6F1E9] flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setEditingReview(null)}
                disabled={isSaving}
                className="rounded-xl text-[#4F200D]/70 hover:text-[#4F200D] hover:bg-[#F6F1E9]"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={() => void saveReviewEdit()}
                disabled={isSaving}
                className="rounded-xl bg-[#FF8400] hover:bg-[#e67600] text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>บันทึกการเปลี่ยนแปลง</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <FeedbackModal feedback={feedback} onClose={() => setFeedback(null)} />
      )}
    </div>
  );
}
