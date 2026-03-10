import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import {
  AlertCircle,
  Search,
  Mail,
  Phone,
  Calendar,
  Loader2,
  Hash,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config/api";

interface TicketData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
  status: "pending" | "resolved" | "cancelled";
  created_at: string;
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

/* ─── Custom Select Component (Theme Oriented & Round) ─── */
interface Option {
  value: string | number;
  label: string;
}

const statusFilterOptions: Option[] = [
  { value: "all", label: "ทุกสถานะ" },
  { value: "pending", label: "รอดำเนินการ" },
  { value: "resolved", label: "แก้แล้ว" },
];

const sortByTimeOptions: Option[] = [
  { value: "newest", label: "เวลา: ใหม่ล่าสุด" },
  { value: "oldest", label: "เวลา: เก่าสุด" },
];

const CustomSelect = ({
  value,
  onChange,
  options,
  className,
  containerClassName,
  menuPlacement = "bottom",
}: {
  value: string | number;
  onChange: (val: string | number) => void;
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
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
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
    options.find((o) => String(o.value) === String(value)) || options[0];

  return (
    <div
      className={
        containerClassName ?? "relative flex-1 sm:flex-none w-full sm:w-auto"
      }
      ref={ref}
    >
      <div
        className={`flex items-center justify-between ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate flex-1 text-center">{selectedOption?.label}</span>
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

export default function TicketManager() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortByTime, setSortByTime] = useState("newest");

  const [deletingTicket, setDeletingTicket] = useState<TicketData | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const selectTriggerClass =
    "text-sm border-0 bg-[#F6F1E9]/50 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-[#FFD93D] text-[#4F200D] font-bold cursor-pointer outline-none transition-all w-full h-12";

  const getErrorMessage = (error: unknown, fallback: string) => {
    const apiMessage = (error as any)?.response?.data?.message;
    if (Array.isArray(apiMessage)) {
      return apiMessage.join("\n");
    }
    if (typeof apiMessage === "string") {
      return apiMessage;
    }
    return fallback;
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tickets`, {
        headers: getAuthHeader(),
      });
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setTickets(data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      setFeedback({
        title: "โหลดข้อมูลไม่สำเร็จ",
        message:
          "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ จึงแสดงข้อมูลตัวอย่างชั่วคราว",
        variant: "error",
      });
      setTickets([
        {
          id: "tk1",
          first_name: "สมชาย",
          last_name: "ใจดี",
          email: "somchai@mail.com",
          phone: "0812345678",
          message:
            "อยากสอบถามเรื่องทัวร์เกาะพีพีค่ะ ว่าสามารถพาเด็กอายุ 5 ขวบไปได้ไหม?",
          status: "pending",
          created_at: new Date().toISOString(),
        },
        {
          id: "tk2",
          first_name: "มานี",
          last_name: "รักดี",
          email: "manee@mail.com",
          phone: "0898765432",
          message: "ขอเลื่อนวันเดินทางได้ไหมคะ พอดีติดธุระด่วน",
          status: "resolved",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);


  const handleSaveStatusInline = async (ticket: TicketData, newStatus: string) => {
    if (newStatus === ticket.status) return;

    const originalTickets = [...tickets];

    setTickets(
      tickets.map((t) =>
        t.id === ticket.id ? { ...t, status: newStatus as any } : t,
      ),
    );

    try {
      await axios.patch(
        `${API_BASE_URL}/api/tickets/${ticket.id}`,
        { status: newStatus },
        { headers: getAuthHeader() },
      );
    } catch (error) {
      setTickets(originalTickets);
      setFeedback({
        title: "อัปเดตสถานะไม่สำเร็จ",
        message: getErrorMessage(error, "กรุณาลองใหม่อีกครั้ง"),
        variant: "error",
      });
    }
  };

  const handleDeleteTicket = async () => {
    if (!deletingTicket) return;

    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/tickets/${deletingTicket.id}`, {
        headers: getAuthHeader(),
      });

      setTickets((prev) =>
        prev.filter((ticket) => ticket.id !== deletingTicket.id),
      );
      setFeedback({
        title: "ลบ Ticket สำเร็จ",
        message: `Ticket #${deletingTicket.id.substring(0, 8)} ถูกลบเรียบร้อยแล้ว`,
        variant: "success",
      });
      setDeletingTicket(null);
    } catch (error) {
      setFeedback({
        title: "ลบ Ticket ไม่สำเร็จ",
        message: getErrorMessage(
          error,
          "สามารถลบได้เฉพาะ Ticket ที่แก้ไขแล้วเท่านั้น",
        ),
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReplyGmail = (ticket: TicketData) => {
    const subject = encodeURIComponent(`ตอบกลับข้อความติดต่อ: ThaiTour`);
    const body = encodeURIComponent(
      `สวัสดีคุณ ${ticket.first_name} ${ticket.last_name},\n\n` +
        `จากข้อความที่คุณสอบถามเข้ามาว่า:\n"${ticket.message}"\n\n` +
        `[พิมพ์ข้อความตอบกลับของคุณที่นี่...]\n\n` +
        `ขอแสดงความนับถือ,\nทีมงาน ThaiTour`,
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${ticket.email}&su=${subject}&body=${body}`;
    window.open(gmailUrl, "_blank");
  };

  const filteredTickets = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();

    const matched = tickets.filter((t) => {
      const passSearch =
        !searchLower ||
        t.first_name.toLowerCase().includes(searchLower) ||
        t.last_name.toLowerCase().includes(searchLower) ||
        t.email.toLowerCase().includes(searchLower) ||
        t.message.toLowerCase().includes(searchLower);

      const passStatus =
        statusFilter === "pending"
          ? t.status === "pending"
          : statusFilter === "resolved"
            ? t.status === "resolved"
            : true;

      return passSearch && passStatus;
    });

    return matched.sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return sortByTime === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [tickets, searchQuery, statusFilter, sortByTime]);

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
      default:
        return "bg-[#FFD93D]/30 text-[#FF8400] hover:bg-[#FFD93D]/50 border-[#FFD93D]";
    }
  };

  const unresolvedCount = useMemo(
    () => tickets.filter((ticket) => ticket.status !== "resolved").length,
    [tickets],
  );

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4F200D] tracking-tight">
            ข้อความติดต่อ (Tickets)
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#4F200D]/60 mt-1">
            จัดการและตอบกลับข้อความสอบถามจากลูกค้า
          </p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-3xl border-0 shadow-sm mb-6">
        <div className="flex flex-col xl:flex-row gap-3 xl:items-center w-full">
          <div className="relative w-full xl:flex-1 xl:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F200D]/40 w-5 h-5" />
            <Input
              placeholder="ค้นหาชื่อ อีเมล หรือเนื้อหาข้อความ..."
              className="pl-12 h-12 bg-[#F6F1E9]/60 border-0 rounded-2xl font-semibold text-[#4F200D] placeholder:font-medium focus:bg-white focus:ring-2 focus:ring-[#FFD93D] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full xl:w-auto xl:min-w-[360px]">
            <CustomSelect
              className={selectTriggerClass}
              value={statusFilter}
              onChange={(value) => setStatusFilter(String(value))}
              options={statusFilterOptions}
              menuPlacement="auto"
            />
            <CustomSelect
              className={selectTriggerClass}
              value={sortByTime}
              onChange={(value) => setSortByTime(String(value))}
              options={sortByTimeOptions}
              menuPlacement="auto"
            />
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setSortByTime("newest");
            }}
            className="w-full md:w-auto xl:ml-auto h-12 px-5 text-[#4F200D]/70 hover:text-[#FF8400] hover:bg-[#FFD93D]/20 font-bold rounded-xl"
          >
            ล้างตัวกรอง
          </Button>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="w-full sm:w-auto text-center px-6 py-3 bg-[#F6F1E9]/50 rounded-xl text-sm font-bold text-[#4F200D]">
            ข้อความตามตัวกรอง:{" "}
            <span className="text-[#FF8400]">{filteredTickets.length}</span>
          </div>
          <div className="w-full sm:w-auto text-center px-6 py-3 bg-[#F6F1E9]/40 rounded-xl text-sm font-bold text-[#4F200D]">
            ยังไม่ได้แก้:{" "}
            <span className="text-[#FF8400]">{unresolvedCount}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border-0 shadow-sm overflow-visible w-full relative z-10">
        <div className="overflow-x-auto overflow-y-visible min-h-[300px]">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
            <thead className="bg-[#F6F1E9]/80 border-b-2 border-[#F6F1E9]">
              <tr>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs w-[10%]">
                  Ticket ID
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs w-[25%]">
                  ข้อมูลลูกค้า
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs w-[35%]">
                  ข้อความ
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs w-[15%]">
                  เวลา
                </th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs w-[15%] text-right">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6F1E9]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-[#FF8400] font-bold">
                      <Loader2 className="w-5 h-5 animate-spin" />{" "}
                      กำลังโหลดข้อความ...
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-[#4F200D]/40 font-medium"
                  >
                    ไม่พบข้อความ
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-[#FFD93D]/5 transition-colors group"
                  >
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center gap-1 text-xs font-bold text-[#4F200D]/40">
                        <Hash className="w-3.5 h-3.5" />
                        {ticket.id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-[#4F200D]">
                          {ticket.first_name} {ticket.last_name}
                        </span>
                        <span className="font-medium text-[#4F200D]/80 flex items-center gap-2 text-xs">
                          <Mail className="w-3 h-3 text-[#FF8400]" />{" "}
                          {ticket.email}
                        </span>
                        <span className="text-xs font-semibold text-[#4F200D]/60 flex items-center gap-2">
                          <Phone className="w-3 h-3" /> {ticket.phone || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top whitespace-normal min-w-[300px]">
                      <p className="text-[#4F200D]/80 text-sm leading-relaxed">
                        {ticket.message}
                      </p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4F200D]/60">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(ticket.created_at).toLocaleDateString(
                          "th-TH",
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top text-right">
                      <div className="flex flex-col gap-2 items-end w-full max-w-[150px] ml-auto">
                        
                        {/* ─── อัปเดต Dropdown ให้เป็น Custom แบบมน ─── */}
                        <CustomSelect
                          value={ticket.status}
                          onChange={(val) => handleSaveStatusInline(ticket, String(val))}
                          options={[
                            { value: "pending", label: "รอดำเนินการ" },
                            { value: "resolved", label: "แก้ไขแล้ว" },
                            { value: "cancelled", label: "ยกเลิก" },
                          ]}
                          className={`w-full px-3 py-1.5 rounded-full border font-bold text-[11px] sm:text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#FFD93D] transition-colors shadow-sm ${getStatusColorClass(ticket.status)}`}
                          menuPlacement="auto"
                        />

                        <Button
                          onClick={() => handleReplyGmail(ticket)}
                          className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] sm:text-xs h-8 px-2 rounded-full font-bold transition-all shadow-sm"
                        >
                          <Mail size={14} /> ตอบด้วย Gmail
                        </Button>

                        {ticket.status === "resolved" && (
                          <Button
                            onClick={() => setDeletingTicket(ticket)}
                            className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] sm:text-xs h-8 px-2 rounded-full font-bold transition-all shadow-sm"
                          >
                            <Trash2 size={14} /> ลบทิ้ง
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deletingTicket && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#4F200D]/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#F6F1E9]">
            <div className="p-5 sm:p-6 border-b border-[#F6F1E9]">
              <h2 className="text-lg sm:text-xl font-black text-[#4F200D]">
                ยืนยันการลบ Ticket
              </h2>
              <p className="text-sm text-[#4F200D]/70 mt-2 leading-relaxed">
                Ticket #{deletingTicket.id.substring(0, 8)}{" "}
                จะถูกลบออกจากระบบถาวร
              </p>
            </div>

            <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setDeletingTicket(null)}
                disabled={isDeleting}
                className="rounded-xl text-[#4F200D]/70 hover:text-[#4F200D] hover:bg-[#F6F1E9]"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={() => void handleDeleteTicket()}
                disabled={isDeleting}
                className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังลบ...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    ยืนยันลบ
                  </>
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