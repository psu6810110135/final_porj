import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, Calendar, AlertCircle, TrendingUp, MoreHorizontal, Loader2, MessageSquare } from 'lucide-react';
import axios from 'axios';

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ month: string; revenue: number }[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayBookings: 0,
    pendingPayments: 0,
    activeTours: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes, ticketsRes] = await Promise.all([
          axios.get('http://localhost:3000/api/v1/admin/stats', { headers: getAuthHeader() }).catch(() => ({ data: { data: {} } })),
          axios.get('http://localhost:3000/api/v1/bookings', { headers: getAuthHeader() }).catch(() => ({ data: [] })),
          axios.get('http://localhost:3000/api/v1/tickets', { headers: getAuthHeader() }).catch(() => ({ data: [] }))
        ]);

        const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data.data || [];
        const tickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : ticketsRes.data.data || [];

        let calculatedRevenue = 0;
        const revenueByMonth: Record<string, number> = {};
        const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

        bookings.forEach((b: any) => {
          if (b.status === 'ยืนยันแล้ว' || b.status === 'confirmed' || b.status === 'paid') {
            const price = Number(b.total_price) || 0;
            calculatedRevenue += price;

            const date = new Date(b.created_at || b.createdAt);
            const monthLabel = monthNames[date.getMonth()];
            revenueByMonth[monthLabel] = (revenueByMonth[monthLabel] || 0) + price;
          }
        });

        const formattedChartData = Object.keys(revenueByMonth).map(month => ({
          month,
          revenue: revenueByMonth[month]
        }));
        
        // ถ้าไม่มีข้อมูล ให้แสดงข้อมูลตัวอย่างเพื่อให้เห็นกราฟ (สามารถลบออกได้หากใช้จริง)
        if (formattedChartData.length === 0) {
           setChartData([
             { month: 'ม.ค.', revenue: 15000 }, { month: 'ก.พ.', revenue: 32000 },
             { month: 'มี.ค.', revenue: 24000 }, { month: 'เม.ย.', revenue: 45000 }
           ]);
        } else {
           setChartData(formattedChartData);
        }

        const mappedBookings = bookings.map((b: any) => ({
          type: 'booking',
          title: `ได้รับการจอง: ${b.tour?.title || 'แพ็คเกจทัวร์'}`,
          subtitle: `${b.user?.full_name || 'ลูกค้า'}`,
          date: new Date(b.created_at || b.createdAt),
          icon: Calendar,
          color: "text-[#FF8400]",
          bg: "bg-[#FFD93D]/30"
        }));

        const mappedTickets = tickets.map((t: any) => ({
          type: 'ticket',
          title: `ข้อความใหม่จาก: ${t.first_name || 'ลูกค้า'}`,
          subtitle: `หัวข้อ: ${t.message.substring(0, 30)}...`,
          date: new Date(t.created_at || t.createdAt),
          icon: MessageSquare,
          color: "text-blue-500",
          bg: "bg-blue-100"
        }));

        const combinedActivities = [...mappedBookings, ...mappedTickets]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5);

        setRecentActivities(combinedActivities);

        setStats({
          totalRevenue: calculatedRevenue > 0 ? calculatedRevenue : (statsRes.data.data?.totalRevenue || 0),
          todayBookings: statsRes.data.data?.todayBookings || bookings.filter((b:any) => new Date(b.createdAt).toDateString() === new Date().toDateString()).length,
          pendingPayments: statsRes.data.data?.pendingPayments || bookings.filter((b:any) => b.status === 'รอชำระเงิน' || b.status === 'pending').length,
          activeTours: statsRes.data.data?.activeTours || 24
        });

      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-[#FF8400]">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  const maxRevenue = chartData.length > 0 ? Math.max(...chartData.map(d => d.revenue), 100) : 100;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#4F200D]">ภาพรวมระบบ</h1>
          <p className="text-sm font-medium text-[#4F200D]/60 mt-1">ติดตามผลประกอบการของธุรกิจคุณแบบเรียลไทม์</p>
        </div>
        <div className="px-5 py-2.5 bg-white border-0 rounded-xl shadow-sm text-sm font-bold text-[#4F200D]">
          {new Date().toLocaleDateString('th-TH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#4F200D]/50 mb-1 uppercase tracking-wider">รายได้รวม</p>
                <h3 className="text-3xl font-black text-[#4F200D]">฿{stats.totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#FFD93D]/30 flex items-center justify-center text-[#FF8400]">
                <DollarSign size={28} strokeWidth={2.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* กราดการ์ดอื่น ๆ (การจองวันนี้, รอตรวจสอบ, ทัวร์ที่เปิดใช้งาน) คงเดิม... */}
        <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#4F200D]/50 mb-1 uppercase tracking-wider">การจองวันนี้</p>
                <h3 className="text-3xl font-black text-[#4F200D]">{stats.todayBookings}</h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#FF8400]/10 flex items-center justify-center text-[#FF8400]">
                <Calendar size={28} strokeWidth={2.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#FF8400]/20 shadow-md rounded-3xl bg-[#FFD93D]/10 overflow-hidden relative hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#FF8400] mb-1 uppercase tracking-wider">รอตรวจสอบ</p>
                <h3 className="text-3xl font-black text-[#4F200D]">{stats.pendingPayments}</h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#FF8400] flex items-center justify-center text-white shadow-inner animate-pulse">
                <AlertCircle size={28} strokeWidth={2.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#4F200D]/50 mb-1 uppercase tracking-wider">ทัวร์ที่เปิดใช้งาน</p>
                <h3 className="text-3xl font-black text-[#4F200D]">{stats.activeTours}</h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#4F200D]/5 flex items-center justify-center text-[#4F200D]">
                <Users size={28} strokeWidth={2.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* กราฟเส้นแบบ Custom (SVG) */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border-0 p-8 flex flex-col min-h-[360px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-[#4F200D]">วิเคราะห์รายได้</h3>
            <button className="text-[#4F200D]/40 hover:text-[#FF8400] transition-colors"><MoreHorizontal size={24} /></button>
          </div>
          
          <div className="flex-1 w-full mt-auto relative pt-10">
            {chartData.length > 0 ? (
              <div className="w-full h-full flex flex-col justify-end relative">
                
                {/* SVG Area - Line Chart */}
                <svg viewBox="0 0 1000 300" className="w-full h-48 sm:h-64 overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF8400" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#FF8400" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* กริดพื้นหลัง */}
                  <line x1="0" y1="75" x2="1000" y2="75" stroke="#F6F1E9" strokeWidth="2" strokeDasharray="5,5" />
                  <line x1="0" y1="150" x2="1000" y2="150" stroke="#F6F1E9" strokeWidth="2" strokeDasharray="5,5" />
                  <line x1="0" y1="225" x2="1000" y2="225" stroke="#F6F1E9" strokeWidth="2" strokeDasharray="5,5" />
                  
                  {/* พื้นที่สีใต้กราฟ (Area) */}
                  <path 
                    d={`M 0,300 L ${chartData.map((d, i) => `${(i / Math.max(chartData.length - 1, 1)) * 1000},${300 - (d.revenue / maxRevenue) * 300}`).join(' L ')} L 1000,300 Z`}
                    fill="url(#lineGradient)"
                  />
                  
                  {/* เส้นกราฟหลัก (Line) */}
                  <polyline 
                    points={chartData.map((d, i) => `${(i / Math.max(chartData.length - 1, 1)) * 1000},${300 - (d.revenue / maxRevenue) * 300}`).join(' ')}
                    fill="none"
                    stroke="#FF8400"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* จุดบนกราฟ (Dots) */}
                  {chartData.map((d, i) => (
                    <circle 
                      key={i}
                      cx={(i / Math.max(chartData.length - 1, 1)) * 1000} 
                      cy={300 - (d.revenue / maxRevenue) * 300} 
                      r="6" 
                      fill="#fff" 
                      stroke="#FF8400" 
                      strokeWidth="3" 
                    />
                  ))}
                </svg>

                {/* Tooltips Overlay HTML (ใช้งานง่าย และ Responsive กว่า) */}
                <div className="absolute inset-0 w-full h-48 sm:h-64 pointer-events-none">
                  {chartData.map((d, i) => {
                    const leftPercent = (i / Math.max(chartData.length - 1, 1)) * 100;
                    const bottomPercent = (d.revenue / maxRevenue) * 100;
                    return (
                      <div 
                        key={`tooltip-${i}`} 
                        className="absolute w-8 h-8 -ml-4 -mb-4 rounded-full pointer-events-auto cursor-pointer group flex items-center justify-center"
                        style={{ left: `${leftPercent}%`, bottom: `${bottomPercent}%` }}
                      >
                        <div className="absolute opacity-0 group-hover:opacity-100 bg-[#4F200D] text-white text-xs font-bold px-3 py-1.5 rounded-lg bottom-full mb-1 transition-all duration-200 shadow-xl whitespace-nowrap z-10 transform scale-95 group-hover:scale-100">
                          ฿{d.revenue.toLocaleString()}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#4F200D]"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ป้ายกำกับแกน X */}
                <div className="flex justify-between w-full mt-4">
                  {chartData.map((d, i) => (
                     <span key={`label-${i}`} className="text-xs sm:text-sm font-bold text-[#4F200D]/60 w-10 text-center -ml-5">{d.month}</span>
                  ))}
                </div>

              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#4F200D]/40">
                <TrendingUp size={40} className="mb-3 text-[#FFD93D]" />
                <p className="text-sm font-bold">ยังไม่มีข้อมูลรายได้ที่ยืนยันแล้ว</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border-0 p-8 flex flex-col min-h-[360px]">
          <h3 className="text-xl font-bold text-[#4F200D] mb-8">กิจกรรมล่าสุด</h3>
          <div className="flex-1 flex flex-col gap-6">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, idx) => {
                const IconComponent = activity.icon;
                return (
                  <div key={idx} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full ${activity.bg} flex items-center justify-center ${activity.color} shrink-0 mt-0.5`}>
                      <IconComponent size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#4F200D] line-clamp-1">{activity.title}</p>
                      <p className="text-xs font-medium text-[#4F200D]/50 mt-1">
                        {activity.subtitle} • {activity.date.toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-[#4F200D]/40 font-medium py-10 flex flex-col items-center">
                <p>ไม่มีกิจกรรมล่าสุด</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}