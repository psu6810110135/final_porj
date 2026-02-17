import { useEffect, useState } from 'react';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Calling YOUR new Admin endpoint
    axios.get('http://localhost:3000/api/v1/admin/bookings')
      .then(res => setBookings(res.data))
      .catch(err => console.error(err));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500 hover:bg-green-600';
      case 'pending_verify': return 'bg-orange-500 hover:bg-orange-600';
      case 'cancelled': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">All Bookings History</h2>
      <div className="grid gap-4">
        {bookings.map((b: any) => (
          <Card key={b.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{b.tour?.title}</h3>
                <p className="text-sm text-gray-500">
                    User: {b.user?.full_name} ({b.user?.email})
                </p>
                <p className="text-sm text-gray-400">
                    Booked on: {new Date(b.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg mb-1">฿{Number(b.totalPrice).toLocaleString()}</div>
                <Badge className={`${getStatusColor(b.status)} text-white border-0`}>
                  {b.status.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}