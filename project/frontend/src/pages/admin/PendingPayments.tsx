import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

export default function PendingPayments() {
  const [payments, setPayments] = useState([]);

  const fetchPayments = () => {
    axios.get('http://localhost:3000/api/v1/payments/pending')
      .then(res => setPayments(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleVerify = async (id: string, status: 'approved' | 'rejected') => {
    let rejectReason = '';
    
    if (status === 'rejected') {
      const reason = prompt("กรุณาระบุเหตุผลที่ปฏิเสธ (เช่น สลิปไม่ชัด, ยอดเงินไม่ครบ):");
      if (!reason) return; // Cancelled
      rejectReason = reason;
    } else {
      if (!confirm(`ยืนยันการอนุมัติ?`)) return;
    }

    try {
      await axios.patch(`http://localhost:3000/api/v1/payments/${id}/verify`, { 
        status, 
        rejectReason 
      });
      alert(`Payment ${status}!`);
      fetchPayments(); // Refresh list
    } catch (error) {
      alert('Error updating status');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Payment Verification</h2>
      <div className="grid gap-4">
        {payments.length === 0 ? <p className="text-gray-500">No pending payments.</p> : payments.map((p: any) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-64 h-64 bg-gray-100 flex items-center justify-center border-r">
                 {/* Display Image if URL exists */}
                 {p.slipUrl ? (
                   <img src={`http://localhost:3000/${p.slipUrl}`} alt="Slip" className="object-cover h-full w-full"/>
                 ) : (
                   <span className="text-gray-400">No Image</span>
                 )}
              </div>
              <CardContent className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xl mb-2">ยอดโอน: ฿{Number(p.amount).toLocaleString()}</h3>
                  <div className="space-y-1 text-gray-600">
                    <p><strong>Customer:</strong> {p.booking?.user?.full_name || 'Unknown'}</p>
                    <p><strong>Tour:</strong> {p.booking?.tour?.title || 'Unknown'}</p>
                    <p><strong>Time:</strong> {new Date(p.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
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