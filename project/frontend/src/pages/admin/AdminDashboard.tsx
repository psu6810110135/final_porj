import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, Calendar, AlertCircle, TrendingUp, Loader2, MessageSquare, ChevronDown } from 'lucide-react';
import axios from 'axios';

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const CONFIRMED_STATUSES = new Set(['confirmed', 'paid', 'ยืนยันแล้ว']);
const MONTH_NAMES = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

type RevenueFilter = 'date' | 'week' | 'month' | 'year';

const getBookingDate = (booking: any): Date => new Date(booking.created_at || booking.createdAt);

const getBookingPrice = (booking: any): number => Number(booking.totalPrice ?? booking.total_price ?? 0) || 0;

const isConfirmedBooking = (booking: any): boolean => CONFIRMED_STATUSES.has(String(booking.status || '').toLowerCase());

const getIsoWeekData = (date: Date): { year: number; week: number } => {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: utcDate.getUTCFullYear(), week };
};

const buildRevenueChartData = (bookings: any[], filter: RevenueFilter): { label: string; revenue: number }[] => {
  const buckets = new Map<string, { label: string; sortKey: number; revenue: number }>();

  bookings.forEach((booking) => {
    if (!isConfirmedBooking(booking)) {
      return;
    }

    const price = getBookingPrice(booking);
    const date = getBookingDate(booking);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    let bucketKey = '';
    let label = '';
    let sortKey = 0;

    if (filter === 'date') {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      bucketKey = `${year}-${month + 1}-${day}`;
      label = date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
      sortKey = new Date(year, month, day).getTime();
    } else if (filter === 'week') {
      const { year, week } = getIsoWeekData(date);
      bucketKey = `${year}-W${week}`;
      label = `W${week} ${year}`;
      sortKey = year * 100 + week;
    } else if (filter === 'month') {
      const year = date.getFullYear();
      const month = date.getMonth();
      bucketKey = `${year}-${month}`;
      label = `${MONTH_NAMES[month]} ${year}`;
      sortKey = year * 100 + month;
    } else {
      const year = date.getFullYear();
      bucketKey = `${year}`;
      label = `${year}`;
      sortKey = year;
    }

    const current = buckets.get(bucketKey);
    if (current) {
      current.revenue += price;
    } else {
      buckets.set(bucketKey, { label, sortKey, revenue: price });
    }
  });

  return Array.from(buckets.values())
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((bucket) => ({ label: bucket.label, revenue: bucket.revenue }));
};

/* ─── Custom Select Component (Theme Oriented & Round) ─── */
interface Option {
  value: string;
  label: string;
}

const CustomSelect = ({
  value,
  onChange,
  options,
  className,
  containerClassName,
}: {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  className?: string;
  containerClassName?: string;
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

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className={containerClassName ?? "relative w-full sm:w-auto"} ref={ref}>
      <div
        className={`flex items-center justify-between ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={`w-4 h-4 ml-2 transition-transform duration-200 text-[#4F200D]/50 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-[80] w-full min-w-[140px] bg-white border-2 border-[#F6F1E9] rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 top-full mt-2 right-0">
          <div className="overflow-y-auto custom-scrollbar py-2 max-h-[240px]">
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

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [revenueFilter, setRevenueFilter] = useState<RevenueFilter>('month');
  const [chartData, setChartData] = useState<{ label: string; revenue: number }[]>([]);
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
        setAllBookings(bookings);

        const calculatedRevenue = bookings.reduce((sum: number, booking: any) => {
          if (!isConfirmedBooking(booking)) {
            return sum;
          }
          return sum + getBookingPrice(booking);
        }, 0);

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
          pendingPayments: bookings.filter((b:any) => b.status === 'pending_verify').length,
          activeTours: statsRes.data.data?.activeTours || 24
        });

      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    setChartData(buildRevenueChartData(allBookings, revenueFilter));
  }, [allBookings, revenueFilter]);

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
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border-0 p-8 flex flex-col min-h-[360px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-xl font-bold text-[#4F200D]">วิเคราะห์รายได้</h3>
            
            {/* 🔴 Updated Custom Theme Oriented Select */}
            <CustomSelect
              className="text-sm border-0 bg-[#F6F1E9]/50 px-5 py-2.5 rounded-full focus:ring-2 focus:ring-[#FFD93D] text-[#4F200D] font-bold cursor-pointer outline-none transition-all shadow-sm w-[160px]"
              value={revenueFilter}
              onChange={(val) => setRevenueFilter(val as RevenueFilter)}
              options={[
                { value: "date", label: "รายวัน" },
                { value: "week", label: "รายสัปดาห์" },
                { value: "month", label: "รายเดือน" },
                { value: "year", label: "รายปี" },
              ]}
            />
          </div>
          
          <div className="flex-1 w-full mt-auto relative pt-10">
            {chartData.length > 0 ? (
              <div className="w-full h-full flex flex-col justify-end relative">
                
                <svg viewBox="0 0 1000 300" className="w-full h-48 sm:h-64 overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF8400" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#FF8400" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  <line x1="0" y1="75" x2="1000" y2="75" stroke="#F6F1E9" strokeWidth="2" strokeDasharray="5,5" />
                  <line x1="0" y1="150" x2="1000" y2="150" stroke="#F6F1E9" strokeWidth="2" strokeDasharray="5,5" />
                  <line x1="0" y1="225" x2="1000" y2="225" stroke="#F6F1E9" strokeWidth="2" strokeDasharray="5,5" />
                  
                  <path 
                    d={`M 0,300 L ${chartData.map((d, i) => `${(i / Math.max(chartData.length - 1, 1)) * 1000},${300 - (d.revenue / maxRevenue) * 300}`).join(' L ')} L 1000,300 Z`}
                    fill="url(#lineGradient)"
                  />
                  
                  <polyline 
                    points={chartData.map((d, i) => `${(i / Math.max(chartData.length - 1, 1)) * 1000},${300 - (d.revenue / maxRevenue) * 300}`).join(' ')}
                    fill="none"
                    stroke="#FF8400"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
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

                <div className="flex justify-between w-full mt-4">
                  {chartData.map((d, i) => (
                     <span key={`label-${i}`} className="text-xs sm:text-sm font-bold text-[#4F200D]/60 w-10 text-center -ml-5">{d.label}</span>
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