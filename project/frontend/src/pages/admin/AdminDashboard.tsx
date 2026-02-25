import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, Calendar, AlertCircle, TrendingUp, MoreHorizontal } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayBookings: 0,
    pendingPayments: 0,
    activeTours: 0
  });

  useEffect(() => {
    axios.get('http://localhost:3000/api/v1/admin/stats')
      .then(res => {
          if(res.data.success) setStats(res.data.data);
      })
      .catch(err => console.error("Failed to load stats:", err));
  }, []);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#4F200D]">Dashboard Overview</h1>
          <p className="text-sm font-medium text-[#4F200D]/60 mt-1">Track your business performance in real-time.</p>
        </div>
        <div className="px-5 py-2.5 bg-white border-0 rounded-xl shadow-sm text-sm font-bold text-[#4F200D]">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#4F200D]/50 mb-1 uppercase tracking-wider">Total Revenue</p>
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
                <p className="text-sm font-bold text-[#4F200D]/50 mb-1 uppercase tracking-wider">Today's Bookings</p>
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
                <p className="text-sm font-bold text-[#FF8400] mb-1 uppercase tracking-wider">Pending Verify</p>
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
                <p className="text-sm font-bold text-[#4F200D]/50 mb-1 uppercase tracking-wider">Active Tours</p>
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
            <h3 className="text-xl font-bold text-[#4F200D]">Revenue Analytics</h3>
            <button className="text-[#4F200D]/40 hover:text-[#FF8400] transition-colors"><MoreHorizontal size={24} /></button>
          </div>
          <div className="flex-1 bg-[#F6F1E9]/50 rounded-2xl border-2 border-dashed border-[#4F200D]/10 flex flex-col items-center justify-center text-[#4F200D]/40">
            <TrendingUp size={40} className="mb-3 text-[#FFD93D]" />
            <p className="text-sm font-bold">Chart Data Visualization</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border-0 p-8 flex flex-col min-h-[360px]">
          <h3 className="text-xl font-bold text-[#4F200D] mb-8">Recent Activity</h3>
          <div className="flex-1 flex flex-col gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FFD93D]/30 flex items-center justify-center text-[#FF8400] shrink-0 mt-0.5">
                  <Calendar size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#4F200D]">New Booking Received</p>
                  <p className="text-xs font-medium text-[#4F200D]/50 mt-1">Booking #{1020 + i} requires verification.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}