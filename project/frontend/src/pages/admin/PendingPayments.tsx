import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Eye } from 'lucide-react';

export default function PendingPayments() {
  const [payments, setPayments] = useState([]);

  const fetchPayments = () => {
    axios.get('http://localhost:3000/api/v1/payments/pending')
      .then(res => setPayments(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleVerify = async (id: string, status: 'approved' | 'rejected') => {
    if (!confirm(`Confirm to ${status}?`)) return;
    try {
      await axios.patch(`http://localhost:3000/api/v1/payments/${id}/verify`, { status });
      fetchPayments(); // โหลดข้อมูลใหม่เมื่อเสร็จ
    } catch (error) {
      alert('Error updating status');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Payment Verification</h2>
      <div className="grid gap-4">
        {payments.length === 0 ? <p>No pending payments.</p> : payments.map((p: any) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-48 h-48 bg-gray-100 flex items-center justify-center">
                 {/* ถ้ามีรูปจริงให้ใช้ img tag ตรงนี้ */}
                 <span className="text-gray-400">Slip Preview</span>
              </div>
              <CardContent className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg">Booking Amount: ฿{Number(p.amount).toLocaleString()}</h3>
                  <p className="text-gray-600">User: {p.booking?.user?.full_name || 'Unknown'}</p>
                  <p className="text-gray-600">Tour: {p.booking?.tour?.title || 'Unknown'}</p>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button className="bg-green-600 hover:bg-green-700 flex-1" onClick={() => handleVerify(p.id, 'approved')}>
                    <Check size={16} className="mr-2"/> Approve
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => handleVerify(p.id, 'rejected')}>
                    <X size={16} className="mr-2"/> Reject
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}