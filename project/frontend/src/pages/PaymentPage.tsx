import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react'; // ✅ นำเข้าตัวสร้าง QR Code

export default function PaymentPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // id คือ bookingId
  const location = useLocation();

  // State สำหรับเก็บข้อมูล
  const [amount, setAmount] = useState(location.state?.amount || 0);
  const [qrPayload, setQrPayload] = useState(''); // เก็บโค้ดยาวๆ สำหรับสร้าง QR
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'rejected' | 'expired'>('pending');
  const [timeLeft, setTimeLeft] = useState(900); // 15 นาที

  // 1. ดึงข้อมูล QR Code จาก Backend (ทำงานครั้งแรกครั้งเดียว)
  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        // ยิงไปที่ API ที่เราเพิ่งเขียนใน Backend
        const res = await fetch(`http://localhost:3000/payments/qr/${id}`);
        if (!res.ok) throw new Error('Failed to fetch QR');
        
        const data = await res.json();
        setQrPayload(data.payload); // ✅ ได้รหัสยาวๆ มาแล้ว
        setAmount(data.amount);     // อัปเดตยอดเงินให้ตรงกับ DB
      } catch (error) {
        console.error("Error fetching QR:", error);
      }
    };

    if (id) fetchQrCode();
  }, [id]);

  // 2. ฟังก์ชันดาวน์โหลด (แก้ให้รองรับ QRCodeCanvas)
  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-gen') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.download = `PromptPay-${amount}.png`;
      link.href = url;
      link.click();
    }
  };

  // 3. ตัวนับเวลาถอยหลัง
  useEffect(() => {
    if (paymentStatus !== 'pending' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('expired'); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, paymentStatus]);

  // 4. เช็คสถานะการจ่ายเงิน (Polling)
  useEffect(() => {
    let interval: any;
    const checkStatus = async () => {
      try {
        // เช็คว่า id มีค่าไหม ก่อนยิง API
        if (!id) return;

        // ยิงเช็คสถานะการจ่ายเงิน (URL ต้องตรงกับ Backend)
        // เนื่องจาก route เราคือ /payments/:id/status (เช็คใน Controller อีกทีว่าใช้ paymentId หรือ bookingId)
        // ถ้า API รับ paymentId แต่เรามี bookingId อาจต้องปรับ Backend นิดหน่อย 
        // *สมมติว่า Backend ค้นหาจาก BookingId ได้ หรือเราแก้ให้ส่ง paymentId กลับมาพร้อม QR*
        
        // ลองยิงไปที่ route นี้ (ถ้า Backend คุณใช้ bookingId ในการเช็ค)
        const response = await fetch(`http://localhost:3000/bookings/${id}`); 
        // หรือถ้าต้องเช็คที่ payment โดยตรง ต้องแน่ใจว่าได้ paymentId มาแล้ว
        
        if (response.ok) {
            const data = await response.json();
            // ปรับเงื่อนไขตามสิ่งที่ Backend ส่งกลับมา
            if (data.status === 'confirmed' || data.status === 'paid') { 
                setPaymentStatus('approved');
                clearInterval(interval);
                setTimeout(() => navigate('/'), 3000);
            }
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    };

    if (paymentStatus === 'pending') {
      interval = setInterval(checkStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [id, navigate, paymentStatus]);

  // จัดรูปแบบเวลา
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ชำระเงินผ่านพร้อมเพย์</h2>
        <p className="text-gray-500 mb-6">สแกน QR Code ด้านล่างเพื่อชำระเงิน</p>

        {/* ยอดเงิน & เวลา */}
        <div className="bg-orange-50 rounded-lg p-4 mb-6 flex flex-col gap-2">
          <p className="text-sm text-orange-600 font-medium">ยอดที่ต้องชำระ</p>
          <p className="text-3xl font-bold text-orange-600 mb-2">฿{amount.toLocaleString()}</p>
          <div className="border-t border-orange-200 pt-3 flex justify-between items-center px-2">
            <span className="text-sm text-gray-600">ชำระภายในเวลา</span>
            <span className={`text-xl font-bold font-mono ${timeLeft < 180 ? 'text-red-500 animate-pulse' : 'text-orange-600'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* ✅ ส่วนแสดง QR Code ด้วย QRCodeCanvas */}
        <div className="flex flex-col items-center justify-center mb-6 relative">
          <div className="p-4 bg-white border-2 border-gray-100 rounded-xl shadow-sm mb-4 relative overflow-hidden">
            
            {qrPayload ? (
              <QRCodeCanvas
                id="qr-gen"
                value={qrPayload} // ใส่รหัส Payload จาก Backend
                size={200}
                level={"H"}
                includeMargin={true}
                className={`transition-all duration-500 ${paymentStatus !== 'pending' ? 'opacity-20 blur-sm' : 'opacity-100'}`}
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-400">
                กำลังโหลด...
              </div>
            )}

            {/* Overlay: สำเร็จ */}
            {paymentStatus === 'approved' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-green-500 z-10 animate-in fade-in zoom-in">
                 <div className="text-6xl mb-2">✅</div>
                 <p className="font-bold bg-white/90 px-4 py-1 rounded-full">ชำระเงินสำเร็จ!</p>
              </div>
            )}

            {/* Overlay: หมดเวลา */}
            {paymentStatus === 'expired' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                 <p className="font-bold text-lg bg-white/90 text-red-500 px-4 py-1 rounded-full shadow-sm">หมดเวลาชำระเงิน</p>
              </div>
            )}
          </div>
          
          {/* ปุ่มดาวน์โหลด */}
          {paymentStatus === 'pending' && (
            <button 
              onClick={downloadQRCode}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              บันทึกรูป QR Code
            </button>
          )}

          {/* ปุ่มรีโหลด */}
          {paymentStatus === 'expired' && (
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium shadow-md"
            >
              ขอ QR Code ใหม่
            </button>
          )}
        </div>

        {/* สถานะ Text */}
        <div className="mt-2 min-h-[24px]">
          {paymentStatus === 'pending' && (
            <div className="flex items-center justify-center gap-2 text-orange-600">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <p className="font-medium text-sm">ระบบตรวจสอบอัตโนมัติ...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}