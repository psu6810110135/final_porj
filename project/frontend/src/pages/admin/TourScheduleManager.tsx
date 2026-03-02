import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("jwt_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

interface Tour {
  id: string;
  title: string;
  max_group_size: number;
}

interface Schedule {
  id: string;
  tour_id: string;
  available_date: string;
  max_capacity_override: number | null;
  is_available: boolean;
  created_at: string;
  available_seats?: number;
  booked_seats?: number;
}

const API_BASE = "http://localhost:3000/api/v1";

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTomorrowValue = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toDateInputValue(tomorrow);
};

const formatThaiDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

const getDateRange = (startDate: string, endDate: string) => {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(toDateInputValue(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

const TourScheduleManager = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string>("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTours, setLoadingTours] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [bulkMode, setBulkMode] = useState(true);
  const [endDate, setEndDate] = useState(getTomorrowValue());

  const [formData, setFormData] = useState({
    available_date: "",
    max_capacity_override: "",
    is_available: true,
  });

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    if (selectedTourId) {
      fetchSchedules(selectedTourId);
    } else {
      setSchedules([]);
    }
  }, [selectedTourId]);

  const fetchTours = async () => {
    setLoadingTours(true);
    try {
      const response = await fetch(`${API_BASE}/tours?show_all=true`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error("Failed to fetch tours");
      const data = await response.json();
      setTours(data);
    } catch (err) {
      console.error("Failed to fetch tours:", err);
      setSubmitError("ไม่สามารถโหลดรายการทัวร์ได้");
    } finally {
      setLoadingTours(false);
    }
  };

  const fetchSchedules = async (tourId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/tours/${tourId}/schedules`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error("Failed to fetch schedules");
      const data = await response.json();
      setSchedules(data);
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
      setSubmitError("ไม่สามารถโหลดตารางทัวร์ได้");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    if (!selectedTourId) {
      setSubmitError("กรุณาเลือกทัวร์ก่อนเพิ่มตาราง");
      return;
    }
    setSubmitError(null);
    setEditingId(null);
    setBulkMode(true);
    const startDate = getTomorrowValue();
    setFormData({
      available_date: startDate,
      max_capacity_override: "",
      is_available: true,
    });
    setEndDate(startDate);
    setIsModalOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setSubmitError(null);
    setEditingId(schedule.id);
    setBulkMode(false);
    setFormData({
      available_date: schedule.available_date.split("T")[0],
      max_capacity_override: schedule.max_capacity_override?.toString() || "",
      is_available: schedule.is_available,
    });
    setEndDate(schedule.available_date.split("T")[0]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.available_date) {
      setSubmitError("กรุณาเลือกวันที่เปิดรอบทัวร์");
      return;
    }

    const selectedDate = new Date(formData.available_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setSubmitError("ไม่สามารถเลือกวันที่ย้อนหลังได้");
      return;
    }

    if (!editingId && bulkMode) {
      if (!endDate) {
        setSubmitError("กรุณาเลือกวันสิ้นสุดสำหรับการสร้างหลายวัน");
        return;
      }

      const rangeEndDate = new Date(endDate);
      rangeEndDate.setHours(0, 0, 0, 0);
      if (rangeEndDate < selectedDate) {
        setSubmitError("วันสิ้นสุดต้องไม่มาก่อนวันเริ่มต้น");
        return;
      }

      const rangeLength = getDateRange(formData.available_date, endDate).length;
      if (rangeLength > 120) {
        setSubmitError("สร้างหลายวันได้สูงสุด 120 วันต่อครั้ง");
        return;
      }
    }

    if (
      formData.max_capacity_override &&
      (!Number.isFinite(Number(formData.max_capacity_override)) ||
        Number(formData.max_capacity_override) < 0)
    ) {
      setSubmitError("จำนวนที่นั่งต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0");
      return;
    }

    setIsSubmitting(true);

    const payload: any = {
      available_date: formData.available_date,
      is_available: formData.is_available,
    };

    // Only include max_capacity_override if it has a value
    if (formData.max_capacity_override) {
      payload.max_capacity_override = Number(formData.max_capacity_override);
    }

    try {
      if (editingId) {
        const response = await fetch(
          `${API_BASE}/tours/${selectedTourId}/schedules/${editingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Failed to save schedule");
        }
      } else if (bulkMode) {
        const dates = getDateRange(formData.available_date, endDate);
        const results = await Promise.allSettled(
          dates.map(async (dateValue) => {
            const res = await fetch(`${API_BASE}/tours/${selectedTourId}/schedules`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...getAuthHeader(),
              },
              body: JSON.stringify({
                ...payload,
                available_date: dateValue,
              }),
            });

            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(errData.message || dateValue);
            }
            return dateValue;
          }),
        );

        const successCount = results.filter((result) => result.status === "fulfilled").length;
        const failedResults = results.filter((result) => result.status === "rejected");

        if (successCount === 0) {
          throw new Error("ไม่สามารถสร้างรอบทัวร์ได้ กรุณาตรวจสอบว่ามีวันที่ซ้ำหรือไม่");
        }

        if (failedResults.length > 0) {
          setSubmitSuccess(
            `สร้างรอบทัวร์สำเร็จ ${successCount} วัน และข้าม ${failedResults.length} วัน (อาจมีวันซ้ำ)`,
          );
        } else {
          setSubmitSuccess(`สร้างรอบทัวร์สำเร็จ ${successCount} วัน`);
        }
      } else {
        const response = await fetch(`${API_BASE}/tours/${selectedTourId}/schedules`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Failed to save schedule");
        }
      }

      await fetchSchedules(selectedTourId);
      setIsModalOpen(false);
      if (editingId) {
        setSubmitSuccess("อัปเดตรอบทัวร์สำเร็จ");
      } else if (!bulkMode) {
        setSubmitSuccess("เพิ่มรอบทัวร์สำเร็จ");
      }
      setFormData({
        available_date: "",
        max_capacity_override: "",
        is_available: true,
      });
    } catch (err: any) {
      setSubmitError(err.message || "บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    try {
      const res = await fetch(
        `${API_BASE}/tours/${selectedTourId}/schedules/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeader(),
        },
      );
      if (!res.ok) throw new Error();
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      setSubmitSuccess("ลบรอบทัวร์สำเร็จ");
    } catch {
      setSubmitError("ลบรอบทัวร์ไม่สำเร็จ");
    }
  };

  const selectedTour = tours.find((t) => t.id === selectedTourId);
  const sortedSchedules = [...schedules].sort(
    (a, b) =>
      new Date(a.available_date).getTime() -
      new Date(b.available_date).getTime(),
  );

  const selectedDatePreview = formData.available_date
    ? formatThaiDate(formData.available_date)
    : "-";
  const endDatePreview = endDate ? formatThaiDate(endDate) : "-";
  const totalBulkDays =
    !editingId && bulkMode && formData.available_date && endDate
      ? getDateRange(formData.available_date, endDate).length
      : 1;
  const effectiveCapacity =
    formData.max_capacity_override !== ""
      ? Number(formData.max_capacity_override)
      : selectedTour?.max_group_size || 0;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4F200D] tracking-tight">
            จัดการตารางทัวร์
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#4F200D]/60 mt-1">
            จัดการวันเดินทาง ความจุ และสถานะการเปิดจองของแต่ละทัวร์
          </p>
        </div>
        <Button
          className="bg-[#FF8400] hover:bg-[#e67600] text-white shadow-lg shadow-[#FF8400]/20 transition-all rounded-xl"
          onClick={handleAddNew}
          disabled={!selectedTourId}
        >
          <Plus className="w-4 h-4 mr-2" /> เพิ่มรอบทัวร์
        </Button>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm text-red-600 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {submitError}
        </div>
      )}
      {submitSuccess && (
        <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 text-sm text-green-700 font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {submitSuccess}
        </div>
      )}

      <div className="bg-white p-4 sm:p-5 rounded-3xl border-0 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        <label className="text-sm font-black text-[#4F200D] uppercase tracking-wider">
          เลือกทัวร์ที่ต้องการจัดการ
        </label>
        {loadingTours ? (
          <div className="flex items-center gap-2 text-[#4F200D]/50 text-sm font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" /> กำลังโหลดรายการทัวร์...
          </div>
        ) : (
          <select
            className="w-full sm:w-[420px] h-11 px-4 rounded-xl border-0 bg-[#F6F1E9]/50 text-sm font-bold text-[#4F200D] focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
            value={selectedTourId}
            onChange={(e) => setSelectedTourId(e.target.value)}
          >
            <option value="">-- เลือกทัวร์ --</option>
            {tours.map((tour) => (
              <option key={tour.id} value={tour.id}>
                {tour.title} (สูงสุด {tour.max_group_size} คน)
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedTourId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border-0 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#4F200D]/60">
                รอบทั้งหมด
              </p>
              <p className="text-2xl font-bold text-[#4F200D]">
                {schedules.length}
              </p>
            </div>
            <div className="p-2 bg-[#FFF3E0] rounded-lg text-[#FF8400]">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border-0 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#4F200D]/60">เปิดจอง</p>
              <p className="text-2xl font-bold text-green-600">
                {schedules.filter((s) => s.is_available).length}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border-0 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#4F200D]/60">ปิดจอง</p>
              <p className="text-2xl font-bold text-red-600">
                {schedules.filter((s) => !s.is_available).length}
              </p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {selectedTourId && (
        <div className="bg-white rounded-3xl border-0 shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
              <thead className="bg-[#F6F1E9]/80 border-b-2 border-[#F6F1E9]">
                <tr>
                  <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                    วันที่
                  </th>
                  <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                    จำนวนสูงสุด
                  </th>
                  <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                    จองแล้ว
                  </th>
                  <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">
                    คงเหลือ
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
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-[#FF8400] font-bold">
                        <Loader2 className="w-4 h-4 animate-spin" /> กำลังโหลดตารางทัวร์...
                      </div>
                    </td>
                  </tr>
                ) : sortedSchedules.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-[#4F200D]/40 font-medium"
                    >
                      ยังไม่มีรอบทัวร์สำหรับรายการนี้
                    </td>
                  </tr>
                ) : (
                  sortedSchedules.map((schedule) => {
                    const dateStr = formatThaiDate(schedule.available_date);
                    const maxCapacity =
                      schedule.max_capacity_override ??
                      selectedTour?.max_group_size ??
                      0;
                    const booked = schedule.booked_seats ?? 0;
                    const available =
                      schedule.available_seats ?? maxCapacity - booked;

                    return (
                      <tr
                        key={schedule.id}
                        className="hover:bg-[#FFD93D]/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#FFF3E0] flex items-center justify-center text-[#FF8400]">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-[#4F200D]">
                                {dateStr}
                              </p>
                              <p className="text-xs text-[#4F200D]/40">
                                {new Date(
                                  schedule.available_date,
                                ).toLocaleDateString("en-US")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#4F200D]/40" />
                            <span className="font-bold text-[#4F200D]">
                              {maxCapacity}
                            </span>
                            {schedule.max_capacity_override && (
                              <Badge className="bg-[#FF8400]/10 text-[#FF8400] border-0 text-xs font-bold">
                                กำหนดเอง
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#4F200D]">
                          {booked}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-semibold ${available > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {available}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={`border-0 shadow-none ${
                              schedule.is_available
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {schedule.is_available ? "เปิดจอง" : "ปิดจอง"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-[#FF8400] hover:bg-[#FF8400]/10 rounded-xl"
                              onClick={() => handleEdit(schedule)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-red-600 hover:bg-red-100 rounded-xl"
                              onClick={() => handleDelete(schedule.id)}
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
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4F200D]/60 backdrop-blur-sm p-4 overflow-y-auto pt-16 md:pt-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b-2 border-[#F6F1E9]">
              <h2 className="text-xl sm:text-2xl font-black text-[#4F200D]">
                {editingId ? "แก้ไขรอบทัวร์" : "เพิ่มรอบทัวร์"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#4F200D]/40 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="p-3 bg-[#FFF3E0] rounded-xl border border-[#FFE0B2]">
                <p className="text-xs font-black text-[#FF8400] uppercase tracking-wider">
                  ทัวร์ที่เลือก
                </p>
                <p className="text-sm font-bold text-[#4F200D] mt-1">
                  {selectedTour?.title}
                </p>
                <p className="text-xs text-[#4F200D]/60 mt-0.5">
                  ความจุเริ่มต้น: {selectedTour?.max_group_size} คน
                </p>
              </div>

              <div className="space-y-2">
                {!editingId && (
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className={`h-8 px-3 text-xs font-bold rounded-lg transition-colors ${
                        bulkMode
                          ? "bg-[#FF8400] text-white hover:bg-[#e67600]"
                          : "bg-[#F6F1E9] hover:bg-[#EFE6DA]"
                      }`}
                      onClick={() => setBulkMode(true)}
                    >
                      หลายวัน
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className={`h-8 px-3 text-xs font-bold rounded-lg transition-colors ${
                        !bulkMode
                          ? "bg-[#FF8400] text-white hover:bg-[#e67600]"
                          : "bg-[#F6F1E9] hover:bg-[#EFE6DA]"
                      }`}
                      onClick={() => setBulkMode(false)}
                    >
                      วันเดียว
                    </Button>
                  </div>
                )}

                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">
                  {bulkMode && !editingId ? "วันเริ่มรอบ *" : "วันที่เปิดรอบ *"}
                </label>
                <Input
                  type="date"
                  required
                  value={formData.available_date}
                  onChange={(e) =>
                    setFormData({ ...formData, available_date: e.target.value })
                  }
                  className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-3 text-xs font-bold rounded-lg bg-[#F6F1E9] hover:bg-[#EFE6DA]"
                    onClick={() => setFormData({ ...formData, available_date: toDateInputValue(new Date()) })}
                  >
                    วันนี้
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-3 text-xs font-bold rounded-lg bg-[#F6F1E9] hover:bg-[#EFE6DA]"
                    onClick={() => setFormData({ ...formData, available_date: getTomorrowValue() })}
                  >
                    พรุ่งนี้
                  </Button>
                </div>
              </div>

              {!editingId && bulkMode && (
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">
                    วันสิ้นสุด *
                  </label>
                  <Input
                    type="date"
                    required
                    value={endDate}
                    min={formData.available_date || undefined}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">
                  ความจุ (กำหนดเอง)
                  <span className="text-[#4F200D]/40 font-semibold text-[11px] ml-1">
                    เว้นว่างเพื่อใช้ค่าทัวร์
                  </span>
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.max_capacity_override}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_capacity_override: e.target.value,
                    })
                  }
                  placeholder={`ค่าเริ่มต้น: ${selectedTour?.max_group_size || 0}`}
                  className="bg-[#F6F1E9]/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FFD93D] font-bold text-[#4F200D]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-[#4F200D] uppercase tracking-wider">
                  สถานะการเปิดจอง
                </label>
                <select
                  className="w-full h-11 px-4 rounded-xl border-0 bg-[#F6F1E9]/50 text-[#4F200D] font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#FFD93D] outline-none transition-all"
                  value={formData.is_available ? "open" : "closed"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_available: e.target.value === "open",
                    })
                  }
                >
                  <option value="open">เปิดรับการจอง</option>
                  <option value="closed">ปิดรับการจอง</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#F6F1E9]/50 border border-[#F0E8E0]">
                <p className="text-xs font-black text-[#4F200D] uppercase tracking-wider mb-2">สรุปก่อนบันทึก</p>
                <div className="text-sm text-[#4F200D] space-y-1 font-semibold">
                  {bulkMode && !editingId ? (
                    <>
                      <p>เริ่ม: {selectedDatePreview}</p>
                      <p>สิ้นสุด: {endDatePreview}</p>
                      <p>จำนวนวันที่สร้าง: {totalBulkDays} วัน</p>
                    </>
                  ) : (
                    <p>วันที่: {selectedDatePreview}</p>
                  )}
                  <p>ความจุ: {effectiveCapacity} คน</p>
                  <p>สถานะ: {formData.is_available ? 'เปิดจอง' : 'ปิดจอง'}</p>
                </div>
              </div>

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
                  className="bg-[#FF8400] hover:bg-[#e67600] text-white font-bold shadow-lg shadow-[#FF8400]/20 rounded-xl min-w-[130px] px-4 sm:px-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      กำลังบันทึก...
                    </>
                  ) : editingId ? (
                    "อัปเดตรอบทัวร์"
                  ) : (
                    "สร้างรอบทัวร์"
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

export default TourScheduleManager;
