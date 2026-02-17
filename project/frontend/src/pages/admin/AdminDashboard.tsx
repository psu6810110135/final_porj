import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Calendar, AlertCircle } from 'lucide-react';
import axios from 'axios';

// กำหนด Type ของข้อมูลที่จะได้รับจาก API
interface DashboardStats {
  totalRevenue: number;
  todayBookings: number;
  pendingPayments: number;
  activeTours: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ฟังก์ชันดึงข้อมูลจาก Backend
    const fetchStats = async () => {
      try {
        // ยิงไปที่ Backend (ต้องรัน Backend ที่ port 3000 ด้วยนะ)
        // const response = await axios.get('http://localhost:3000/api/v1/admin/stats');
        // setStats(response.data.data);
        
        // Mock ข้อมูลไปก่อนระหว่างรอเชื่อมต่อจริง
        setStats({
          totalRevenue: 150200,
          todayBookings: 12,
          pendingPayments: 4,
          activeTours: 8
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{stats?.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        {/* Card 2: Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.todayBookings}</div>
            <p className="text-xs text-muted-foreground">Orders today</p>
          </CardContent>
        </Card>

        {/* Card 3: Pending Payments */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Pending Verify</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{stats?.pendingPayments}</div>
            <p className="text-xs text-orange-600">Needs attention</p>
          </CardContent>
        </Card>

        {/* Card 4: Active Tours */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tours</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeTours}</div>
            <p className="text-xs text-muted-foreground">Tours available</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}