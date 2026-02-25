import { useState } from 'react';
import { Search, Map, Calendar, User, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function BookingHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // ข้อมูลสมมติ (Mock Data)
  const mockBookings = [
    { 
      id: 'BK-10045', 
      tour: { title: 'ทริปดำน้ำหมู่เกาะสิมิลัน 1 วัน' }, 
      user: { full_name: 'สมชาย ใจดี', email: 'somchai@email.com', phone: '081-234-5678' }, 
      createdAt: '2024-05-12T10:30:00Z', 
      totalPrice: 5500, 
      status: 'confirmed' 
    },
    { 
      id: 'BK-10046', 
      tour: { title: 'แพ็คเกจทัวร์เชียงใหม่ 3 วัน 2 คืน' }, 
      user: { full_name: 'สมหญิง รักสวย', email: 'ying@email.com', phone: '089-876-5432' }, 
      createdAt: '2024-05-13T14:20:00Z', 
      totalPrice: 8900, 
      status: 'pending_verify' 
    },
    { 
      id: 'BK-10047', 
      tour: { title: 'พักผ่อนชิลๆ ริมหาดภูเก็ต' }, 
      user: { full_name: 'จอห์น โด (John Doe)', email: 'john@email.com', phone: '091-111-2222' }, 
      createdAt: '2024-05-10T09:15:00Z', 
      totalPrice: 12000, 
      status: 'cancelled' 
    },
    { 
      id: 'BK-10048', 
      tour: { title: 'เดินป่าเขาสก 2 วัน 1 คืน' }, 
      user: { full_name: 'วิชัย รักป่า', email: 'wichai@email.com', phone: '086-555-4444' }, 
      createdAt: '2024-05-14T08:00:00Z', 
      totalPrice: 3500, 
      status: 'confirmed' 
    },
    { 
      id: 'BK-10049', 
      tour: { title: 'ล่องเรือชมแม่น้ำเจ้าพระยา' }, 
      user: { full_name: 'มาลี สวยมาก', email: 'malee@email.com', phone: '083-333-7777' }, 
      createdAt: '2024-05-14T16:45:00Z', 
      totalPrice: 1500, 
      status: 'pending_verify' 
    },
  ];

  // ฟังก์ชันช่วยกำหนดสีของ Badge ตามสถานะ
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': 
        return <Badge className="bg-emerald-100 text-emerald-700 border-0 px-3 py-1 font-bold shadow-none">ยืนยันแล้ว</Badge>;
      case 'pending_verify': 
        return <Badge className="bg-[#FFD93D]/40 text-[#FF8400] border-0 px-3 py-1 font-bold shadow-none">รอตรวจสอบ</Badge>;
      case 'cancelled': 
        return <Badge className="bg-red-100 text-red-600 border-0 px-3 py-1 font-bold shadow-none">ยกเลิกแล้ว</Badge>;
      default: 
        return <Badge className="bg-gray-100 text-gray-600 border-0 px-3 py-1 font-bold shadow-none">{status}</Badge>;
    }
  };

  // กรองข้อมูลตามการค้นหาและสถานะ
  const filteredBookings = mockBookings.filter((b) => {
    const matchesSearch = 
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tour.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#4F200D]">ประวัติการจอง</h1>
          <p className="text-sm font-medium text-[#4F200D]/60 mt-1">ตรวจสอบและจัดการประวัติการสั่งจองทัวร์ของลูกค้าทั้งหมด</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border-0 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F200D]/40 w-5 h-5" />
          <Input
            placeholder="ค้นหาด้วยรหัสการจอง, ชื่อลูกค้า หรือชื่อทัวร์..."
            className="pl-12 py-6 bg-[#F6F1E9]/50 border-0 rounded-2xl font-bold text-[#4F200D] placeholder:font-medium focus:bg-white focus:ring-2 focus:ring-[#FFD93D] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="text-sm border-0 bg-[#F6F1E9]/50 px-6 py-3 rounded-2xl focus:ring-2 focus:ring-[#FFD93D] text-[#4F200D] font-bold cursor-pointer outline-none transition-all w-full sm:w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">สถานะทั้งหมด</option>
          <option value="confirmed">ยืนยันแล้ว</option>
          <option value="pending_verify">รอตรวจสอบ</option>
          <option value="cancelled">ยกเลิกแล้ว</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F6F1E9]/80 border-b-2 border-[#F6F1E9]">
              <tr>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs whitespace-nowrap">รหัสการจอง</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">ข้อมูลทัวร์</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">ข้อมูลลูกค้า</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">วันที่ทำรายการ</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs">ยอดรวม</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs whitespace-nowrap">สถานะ</th>
                <th className="px-6 py-5 font-black text-[#4F200D] uppercase tracking-wider text-xs text-right whitespace-nowrap">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6F1E9]">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#4F200D]/40 font-bold">
                    ไม่พบข้อมูลการจองที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FFD93D]/5 transition-colors group">
                    {/* Booking ID */}
                    <td className="px-6 py-5">
                      <span className="font-black text-[#FF8400] bg-[#FF8400]/10 px-3 py-1.5 rounded-lg whitespace-nowrap">
                        {b.id}
                      </span>
                    </td>
                    
                    {/* Tour Info */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#F6F1E9] rounded-xl text-[#4F200D]/50 group-hover:text-[#FF8400] transition-colors shrink-0">
                          <Map size={18} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-[#4F200D] line-clamp-2">{b.tour.title}</span>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-[#4F200D]/40 shrink-0" strokeWidth={3} />
                          <span className="font-bold text-[#4F200D] truncate">{b.user.full_name}</span>
                        </div>
                        <span className="text-xs font-semibold text-[#4F200D]/50 ml-5">{b.user.phone}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[#4F200D]/70 font-semibold">
                        <Calendar size={14} className="text-[#4F200D]/40" strokeWidth={2.5} />
                        {new Date(b.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="font-black text-[#4F200D] text-base">
                        ฿{b.totalPrice.toLocaleString()}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      {getStatusBadge(b.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-[#4F200D]/40 hover:text-[#FF8400] hover:bg-[#FF8400]/10 rounded-xl" title="ดูรายละเอียด">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-[#4F200D]/40 hover:text-red-500 hover:bg-red-50 rounded-xl" title="ลบการจอง">
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
      </div>
      
    </div>
  );
}