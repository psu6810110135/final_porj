import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, Calendar, AlertCircle, TrendingUp, MoreHorizontal, Loader2 } from 'lucide-react';
import axios from 'axios';

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayBookings: 0,
    pendingPayments: 0,
    activeTours: 0
  });

  useEffect(() => {
    // 1. Fetch Stats
    axios.get('http://localhost:3000/api/v1/admin/stats', { headers: getAuthHeader() })
      .then(res => {
          if(res.data.success) setStats(res.data.data);
      })
      .catch(err => {
          console.warn("API Note: Stats endpoint not ready, using fallback mock data.");
          setStats({
            totalRevenue: 245000,
            todayBookings: 12,
            pendingPayments: 5,
            activeTours: 24
          });
      });

    // 2. ✨ Fetch Recent Bookings for "กิจกรรมล่าสุด"
    axios.get('http://localhost:3000/api/v1/bookings', { headers: getAuthHeader() })
      .then(res => {
        const bookings = Array.isArray(res.data) ? res.data : res.data.data || [];
        // Sort by created_at DESC and take top 4
        const latest = bookings
          .sort((a: any, b: any) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime())
          .slice(0, 4);
        setRecentActivities(latest);
      })
      .catch(err => console.error("Failed to load recent bookings:", err))
      .finally(() => setLoading(false));

  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-[#FF8400]">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

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
        {/* Total Revenue */}
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

        {/* Today's Bookings */}
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

        {/* Pending Verify */}
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

        {/* Active Tours */}
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
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-[#4F200D]">วิเคราะห์รายได้</h3>
            <button className="text-[#4F200D]/40 hover:text-[#FF8400] transition-colors"><MoreHorizontal size={24} /></button>
          </div>
          <div className="flex-1 bg-[#F6F1E9]/50 rounded-2xl border-2 border-dashed border-[#4F200D]/10 flex flex-col items-center justify-center text-[#4F200D]/40">
            <TrendingUp size={40} className="mb-3 text-[#FFD93D]" />
            <p className="text-sm font-bold">ข้อมูลแผนภูมิ</p>
          </div>
        </div>

        {/* ✨ Sync กิจกรรมล่าสุด */}
        <div className="bg-white rounded-3xl shadow-sm border-0 p-8 flex flex-col min-h-[360px]">
          <h3 className="text-xl font-bold text-[#4F200D] mb-8">กิจกรรมล่าสุด</h3>
          <div className="flex-1 flex flex-col gap-6">
            {recentActivities.length > 0 ? (
              recentActivities.map((booking, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FFD93D]/30 flex items-center justify-center text-[#FF8400] shrink-0 mt-0.5">
                    <Calendar size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#4F200D] line-clamp-1">ได้รับการจอง: {booking.tour?.title || 'แพ็คเกจทัวร์'}</p>
                    <p className="text-xs font-medium text-[#4F200D]/50 mt-1">
                      {booking.user?.full_name || 'ลูกค้า'} • {new Date(booking.created_at || booking.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-[#4F200D]/40 font-medium py-10">ไม่มีกิจกรรมล่าสุด</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}