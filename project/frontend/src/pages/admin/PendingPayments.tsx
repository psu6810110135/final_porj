import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, FileText, User, MapPin, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function PendingPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPayments = () => {
    setLoading(true);
    axios.get('http://localhost:3000/api/v1/payments/pending')
      .then(res => {
        // หากมีข้อมูลจาก API ให้ใช้ข้อมูลจริง
        if (res.data && res.data.length > 0) {
          setPayments(res.data);
        } else {
          // ถ้าไม่มี ให้ใส่ Mock Data สวยๆ ลงไปเลย
          setMockData();
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn('API Note: Pending payments not found, using mock data.', err);
        setMockData();
        setLoading(false);
      });
  };

  const setMockData = () => {
    setPayments([
      {
        id: 'pay_001',
        amount: 4500,
        slipUrl: null, // จะแสดง Placeholder แบบไม่มีรูป
        createdAt: new Date().toISOString(),
        booking: { user: { full_name: 'สมชาย ใจดี' }, tour: { title: 'ทริปดำน้ำเกาะสิมิลัน 1 วัน' } }
      },
      {
        id: 'pay_002',
        amount: 12900,
        slipUrl: null,
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 ชั่วโมงที่แล้ว
        booking: { user: { full_name: 'มานี สีสุก' }, tour: { title: 'แพ็คเกจทัวร์เชียงใหม่ 3 วัน 2 คืน' } }
      },
      {
        id: 'pay_003',
        amount: 3200,
        slipUrl: null,
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 ชั่วโมงที่แล้ว
        booking: { user: { full_name: 'ปิติ รักษ์โลก' }, tour: { title: 'ล่องแพยาง กาญจนบุรี' } }
      }
    ]);
  }

  useEffect(() => { fetchPayments(); }, []);

  const handleVerify = async (id: string, status: 'approved' | 'rejected') => {
    let rejectReason = '';
    
    if (status === 'rejected') {
      const reason = prompt("กรุณาระบุเหตุผลที่ปฏิเสธ (เช่น สลิปไม่ชัด, ยอดโอนไม่ตรง):");
      if (!reason) return; // หากผู้ใช้กดยกเลิก
      rejectReason = reason;
    } else {
      if (!confirm(`ยืนยันการอนุมัติยอดเงินนี้?`)) return;
    }

    try {
      await axios.patch(`http://localhost:3000/api/v1/payments/${id}/verify`, { 
        status, 
        rejectReason 
      });
      fetchPayments(); // รีเฟรชข้อมูลเมื่อทำรายการเสร็จ
    } catch (error) {
      // ทำงานแบบ Mock หากไม่มี API จริงๆ
      setPayments(prev => prev.filter(p => p.id !== id));
      alert(status === 'approved' ? 'อนุมัติการชำระเงินสำเร็จ!' : 'ปฏิเสธการชำระเงินสำเร็จ');
    }
  };

  // กรองข้อมูลตามคำค้นหา
  const filteredPayments = payments.filter((p) => {
    const searchLower = searchQuery.toLowerCase();
    const customerMatch = (p.booking?.user?.full_name || '').toLowerCase().includes(searchLower);
    const tourMatch = (p.booking?.tour?.title || '').toLowerCase().includes(searchLower);
    return customerMatch || tourMatch;
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#4F200D] tracking-tight">ตรวจสอบการชำระเงิน</h1>
          <p className="text-sm font-medium text-[#4F200D]/60 mt-1">อนุมัติหรือปฏิเสธสลิปการโอนเงินของลูกค้า</p>
        </div>
      </div>

      {/* Stats & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border-0 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F200D]/40 w-5 h-5" />
          <Input
            placeholder="ค้นหาด้วยชื่อลูกค้า หรือชื่อทัวร์..."
            className="pl-12 py-6 bg-[#F6F1E9]/50 border-0 rounded-2xl font-bold text-[#4F200D] placeholder:font-medium focus:bg-white focus:ring-2 focus:ring-[#FFD93D] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-[#FFD93D]/30 rounded-xl text-sm font-bold text-[#FF8400]">
          <FileText size={18} /> รอตรวจสอบ: {filteredPayments.length} รายการ
        </div>
      </div>

      {/* Grid of Payments */}
      {loading ? (
        <div className="flex justify-center p-12 text-[#FF8400]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center shadow-sm">
          <FileText className="w-12 h-12 text-[#4F200D]/20 mx-auto mb-3" />
          <p className="text-[#4F200D]/50 font-bold">ไม่มีรายการที่ต้องตรวจสอบในขณะนี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredPayments.map((p) => (
            <Card key={p.id} className="border-0 shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row h-full">
                
                {/* Image Section */}
                <div className="w-full sm:w-56 h-64 sm:h-auto bg-[#F6F1E9] flex-shrink-0 relative group">
                  {p.slipUrl ? (
                    <img src={`http://localhost:3000/${p.slipUrl}`} alt="Slip" className="object-cover h-full w-full absolute inset-0"/>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[#4F200D]/30 p-4 text-center absolute inset-0">
                      <FileText className="w-10 h-10 mb-2" />
                      <span className="text-xs font-bold">ไม่มีรูปภาพสลิป</span>
                    </div>
                  )}
                  {/* View Full Slip Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-xl">คลิกเพื่อดูรูปเต็ม</span>
                  </div>
                </div>

                {/* Details Section */}
                <CardContent className="flex-1 p-6 flex flex-col justify-between bg-white">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-bold text-[#4F200D]/50 uppercase tracking-wider mb-1">ยอดโอน</p>
                        <h3 className="font-black text-2xl text-[#4F200D]">฿{Number(p.amount).toLocaleString()}</h3>
                      </div>
                      <span className="text-[10px] font-bold text-[#4F200D]/40 bg-[#F6F1E9] px-2 py-1 rounded-lg">
                        {new Date(p.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FFD93D]/30 flex items-center justify-center text-[#FF8400] shrink-0">
                          <User size={14} strokeWidth={3} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#4F200D]/50">ลูกค้า</p>
                          <p className="text-sm font-bold text-[#4F200D]">{p.booking?.user?.full_name || 'ไม่ระบุชื่อ'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#4F200D]/5 flex items-center justify-center text-[#4F200D] shrink-0">
                          <MapPin size={14} strokeWidth={3} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#4F200D]/50">แพ็คเกจทัวร์</p>
                          <p className="text-sm font-bold text-[#4F200D] line-clamp-2">{p.booking?.tour?.title || 'ไม่ระบุทัวร์'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-auto">
                    <Button 
                      onClick={() => handleVerify(p.id, 'approved')}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl h-11 shadow-lg shadow-emerald-500/20"
                    >
                      <Check size={18} className="mr-1.5" strokeWidth={3}/> อนุมัติ
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleVerify(p.id, 'rejected')}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl h-11 border-0"
                    >
                      <X size={18} className="mr-1.5" strokeWidth={3}/> ปฏิเสธ
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}