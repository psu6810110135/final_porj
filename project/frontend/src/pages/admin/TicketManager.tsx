import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Mail, Phone, Calendar, Loader2, Hash, Pencil, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TicketData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'resolved' | 'cancelled';
  created_at: string;
}

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("jwt_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function TicketManager() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State สำหรับ Mini Pop-up เปลี่ยนสถานะ
  const [editingTicket, setEditingTicket] = useState<TicketData | null>(null);
  const [draftStatus, setDraftStatus] = useState<string>("");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/v1/tickets", { headers: getAuthHeader() });
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setTickets(data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      // Fallback dummy data if API endpoint is not ready yet
      setTickets([
        { id: "tk1", first_name: "สมชาย", last_name: "ใจดี", email: "somchai@mail.com", phone: "0812345678", message: "อยากสอบถามเรื่องทัวร์เกาะพีพีค่ะ ว่าสามารถพาเด็กอายุ 5 ขวบไปได้ไหม?", status: "pending", created_at: new Date().toISOString() },
        { id: "tk2", first_name: "มานี", last_name: "รักดี", email: "manee@mail.com", phone: "0898765432", message: "ขอเลื่อนวันเดินทางได้ไหมคะ พอดีติดธุระด่วน", status: "resolved", created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openStatusModal = (ticket: TicketData) => {
    setEditingTicket(ticket);
    setDraftStatus(ticket.status);
  };

  const handleSaveStatus = async () => {
    if (!editingTicket) return;
    const id = editingTicket.id;
    const newStatus = draftStatus;
    
    setEditingTicket(null); // ปิด Pop-up ทันที (Optimistic)
    
    if (newStatus === editingTicket.status) return; // ไม่มีการเปลี่ยนแปลง

    const originalTickets = [...tickets];
    setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
    
    try {
      await axios.patch(`http://localhost:3000/api/v1/tickets/${id}`, { status: newStatus }, { headers: getAuthHeader() });
    } catch (error) {
      alert("อัปเดตสถานะล้มเหลว");
      setTickets(originalTickets); // ย้อนกลับถ้า API error
    }
  };

  // ฟังก์ชันสำหรับการเปิดตอบกลับทาง Gmail
  const handleReplyGmail = (ticket: TicketData) => {
    const subject = encodeURIComponent(`ตอบกลับข้อความติดต่อ: ThaiTour`);
    const body = encodeURIComponent(
      `สวัสดีคุณ ${ticket.first_name} ${ticket.last_name},\n\n` +
      `จากข้อความที่คุณสอบถามเข้ามาว่า:\n"${ticket.message}"\n\n` +
      `[พิมพ์ข้อความตอบกลับของคุณที่นี่...]\n\n` +
      `ขอแสดงความนับถือ,\nทีมงาน ThaiTour`
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${ticket.email}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const filteredTickets = tickets.filter((t) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      t.first_name.toLowerCase().includes(searchLower) ||
      t.email.toLowerCase().includes(searchLower) ||
      t.message.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColorClass = (status: string) => {
    switch(status) {
      case 'resolved':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 hover:bg-red-200';
      default:
        return 'bg-[#FFD93D]/30 text-[#4F200D] hover:bg-[#FFD93D]/50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'resolved': return 'แก้ไขแล้ว';
      case 'cancelled': return 'ยกเลิก';
      default: return 'รอดำเนินการ';
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4F200D] tracking-tight">ข้อความติดต่อ (Tickets)</h1>
          <p className="text-xs sm:text-sm font-medium text-[#4F200D]/60 mt-1">
            จัดการและตอบกลับข้อความสอบถามจากลูกค้า
          </p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-3xl border-0 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F200D]/40 w-5 h-5" />
          <Input
            placeholder="ค้นหาชื่อ อีเมล หรือเนื้อหาข้อความ..."
            className="pl-12 py-5 sm:py-6 bg-[#F6F1E9]/50 border-0 rounded-2xl font-bold text-[#4F200D] placeholder:font-medium focus:bg-white focus:ring-2 focus:ring-[#FFD93D] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto text-center px-6 py-3 bg-[#F6F1E9]/50 rounded-xl text-sm font-bold text-[#4F200D]">
          ข้อความทั้งหมด: <span className="text-[#FF8400]">{filteredTickets.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border-0 shadow-sm overflow-hidden w-full relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
            <thead className="bg-[#F6F1E9]/80 border-b-2 border-[#F6F1E9]">
              <tr>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs w-[10%]">Ticket ID</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs w-[25%]">ข้อมูลลูกค้า</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs w-[35%]">ข้อความ</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs w-[15%]">เวลา</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs w-[15%] text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6F1E9]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-[#FF8400] font-bold">
                      <Loader2 className="w-5 h-5 animate-spin" /> กำลังโหลดข้อความ...
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#4F200D]/40 font-medium">ไม่พบข้อความ</td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-[#FFD93D]/5 transition-colors group">
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center gap-1 text-xs font-bold text-[#4F200D]/40">
                        <Hash className="w-3.5 h-3.5" />
                        {ticket.id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-[#4F200D]">{ticket.first_name} {ticket.last_name}</span>
                        <span className="font-medium text-[#4F200D]/80 flex items-center gap-2 text-xs">
                          <Mail className="w-3 h-3 text-[#FF8400]" /> {ticket.email}
                        </span>
                        <span className="text-xs font-semibold text-[#4F200D]/60 flex items-center gap-2">
                          <Phone className="w-3 h-3" /> {ticket.phone || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top whitespace-normal min-w-[300px]">
                      <p className="text-[#4F200D]/80 text-sm leading-relaxed">{ticket.message}</p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4F200D]/60">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(ticket.created_at).toLocaleDateString("th-TH")}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top text-right">
                      <div className="flex flex-col gap-2 items-end w-full max-w-[140px] ml-auto">
                        
                        <button
                          onClick={() => openStatusModal(ticket)}
                          className={`w-full flex items-center justify-between px-4 py-2 rounded-full border-0 font-bold text-[11px] sm:text-xs cursor-pointer transition-colors shadow-sm ${getStatusColorClass(ticket.status)}`}
                        >
                          <span>{getStatusLabel(ticket.status)}</span>
                          <Pencil className="w-3 h-3 opacity-60 shrink-0" />
                        </button>

                        <Button 
                          onClick={() => handleReplyGmail(ticket)} 
                          className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] sm:text-xs h-8 px-2 rounded-full font-bold transition-all shadow-sm"
                        >
                          <Mail size={14} /> ตอบด้วย Gmail
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

      {/* ===== Mini Pop-up เปลี่ยนสถานะ ===== */}
      {editingTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setEditingTicket(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-extrabold text-[#4F200D]">เปลี่ยนสถานะ</h3>
                <p className="text-xs font-semibold text-[#4F200D]/50 mt-1">Ticket #{editingTicket.id.substring(0,8)}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4F200D]/40 hover:text-red-500 hover:bg-red-50 rounded-xl" onClick={() => setEditingTicket(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-2.5">
              {[
                { value: "pending", label: "รอดำเนินการ" },
                { value: "resolved", label: "แก้ไขแล้ว" },
                { value: "cancelled", label: "ยกเลิก" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDraftStatus(opt.value)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all font-bold text-sm ${
                    draftStatus === opt.value
                      ? "border-[#FF8400] bg-[#FF8400]/10 text-[#FF8400]"
                      : "border-[#F6F1E9] bg-white text-[#4F200D]/60 hover:border-[#FFD93D] hover:bg-[#FFD93D]/10 hover:text-[#4F200D]"
                  }`}
                >
                  {opt.label}
                  {draftStatus === opt.value && <Check className="w-5 h-5 text-[#FF8400]" />}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button className="flex-1 bg-[#F6F1E9] hover:bg-[#EFE6DA] text-[#4F200D] font-bold rounded-xl py-5 shadow-none text-sm transition-colors" onClick={() => setEditingTicket(null)}>
                ยกเลิก
              </Button>
              <Button 
                className="flex-1 bg-[#FF8400] hover:bg-[#e67600] text-white font-bold rounded-xl py-5 shadow-lg shadow-[#FF8400]/20 text-sm transition-all" 
                onClick={handleSaveStatus}
                disabled={draftStatus === editingTicket.status}
              >
                บันทึก
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}