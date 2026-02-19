import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const amount = location.state?.amount || 3500;
  const promptPayNumber = "0812345678"; // ⚠️ อย่าลืมเปลี่ยนเบอร์
  const qrCodeUrl = `https://promptpay.io/${promptPayNumber}/${amount}.png`;

  // เพิ่มสถานะ 'expired' (หมดเวลา) เข้ามา
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'rejected' | 'expired'>('pending');
  
  // ตั้งเวลา 15 นาที = 900 วินาที
  const [timeLeft, setTimeLeft] = useState(10);

  // ฟังก์ชันดาวน์โหลด QR Code
  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PromptPay-QR-${amount}THB.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(qrCodeUrl, '_blank'); 
    }
  };

  // 1. Effect สำหรับตัวนับเวลาถอยหลัง
  useEffect(() => {
    // ถ้าไม่ได้อยู่ในสถานะรอดำเนินการ หรือเวลาหมดแล้ว ให้หยุดนับ
    if (paymentStatus !== 'pending' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('expired'); // เปลี่ยนสถานะเป็นหมดเวลา
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, paymentStatus]);

  // 2. Effect สำหรับยิง API เช็คสถานะการจ่ายเงิน (Polling)
  useEffect(() => {
    let interval: any;

    const checkStatus = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/payments/${id}/status`);
        const data = await response.json();

        if (data.status === 'approved') {
          setPaymentStatus('approved');
          clearInterval(interval);
          setTimeout(() => navigate('/'), 2000);
        } else if (data.status === 'rejected') {
          setPaymentStatus('rejected');
          clearInterval(interval);
        }
      } catch (error) {
        console.error(error);
      }
    };

    // จะยิงถาม API ก็ต่อเมื่อยังเป็นสถานะ pending เท่านั้น (ถ้าหมดเวลาแล้วก็เลิกถาม)
    if (paymentStatus === 'pending') {
      interval = setInterval(checkStatus, 3000);
    }

    return () => clearInterval(interval);
  }, [id, navigate, paymentStatus]);

  // แปลงวินาทีให้เป็นรูปแบบ นาที:วินาที (เช่น 14:59)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ชำระเงินผ่านพร้อมเพย์</h2>
        <p className="text-gray-500 mb-6">สแกน QR Code ด้านล่างเพื่อชำระเงิน ระบบจะยืนยันอัตโนมัติ</p>

        {/* กล่องแสดงยอดเงิน และ เวลานับถอยหลัง */}
        <div className="bg-orange-50 rounded-lg p-4 mb-6 flex flex-col gap-2">
          <p className="text-sm text-orange-600 font-medium">ยอดที่ต้องชำระ</p>
          <p className="text-3xl font-bold text-orange-600 mb-2">฿{amount.toLocaleString()}</p>
          
          <div className="border-t border-orange-200 pt-3 flex justify-between items-center px-2">
            <span className="text-sm text-gray-600">กรุณาชำระเงินภายใน</span>
            <span className={`text-xl font-bold font-mono ${timeLeft < 180 ? 'text-red-500 animate-pulse' : 'text-orange-600'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* รูป QR Code */}
        <div className="flex flex-col items-center justify-center mb-6 relative">
          <div className="p-4 bg-white border-2 border-gray-100 rounded-xl shadow-sm mb-4 relative overflow-hidden">
            <img 
              src={qrCodeUrl} 
              alt="PromptPay QR Code" 
              // ถ้าจ่ายแล้ว หรือหมดเวลา จะทำให้ QR Code จางลง
              className={`w-48 h-48 object-contain transition-all duration-500 ${paymentStatus !== 'pending' ? 'opacity-20 grayscale blur-sm' : 'opacity-100'}`}
            />
            
            {/* โชว์ทับตอนจ่ายสำเร็จ */}
            {paymentStatus === 'approved' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-green-500 z-10">
                 <div className="text-6xl mb-2">✅</div>
                 <p className="font-bold text-lg bg-white/80 px-4 py-1 rounded-full">ชำระเงินสำเร็จ!</p>
              </div>
            )}

            {/* โชว์ทับตอนหมดเวลา */}
            {paymentStatus === 'expired' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-10">
                 
                 <p className="font-bold text-lg bg-white/90 px-4 py-1 rounded-full shadow-sm text-red-500">หมดเวลาชำระเงิน</p>
              </div>
            )}
          </div>
          
          {/* ปุ่มดาวน์โหลด (โชว์เฉพาะตอนยังไม่จ่ายเงินและเวลาไม่หมด) */}
          {paymentStatus === 'pending' && (
            <button 
              onClick={downloadQRCode}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              บันทึกรูป QR Code
            </button>
          )}

          {/* ปุ่มกลับหน้าหลัก (โชว์ตอนหมดเวลา) */}
          {paymentStatus === 'expired' && (
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
            >
              ทำรายการใหม่
            </button>
          )}
        </div>

        {/* สถานะด้านล่าง */}
        <div className="mt-2 flex items-center justify-center gap-2 min-h-[24px]">
          {paymentStatus === 'pending' && (
            <>
              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-orange-600 font-medium">กำลังรอการชำระเงิน...</p>
            </>
          )}
          {paymentStatus === 'approved' && (
            <p className="text-green-600 font-medium">ระบบกำลังพากลับไปหน้าหลัก...</p>
          )}
          {paymentStatus === 'rejected' && (
            <p className="text-red-600 font-medium">การชำระเงินถูกปฏิเสธ กรุณาติดต่อแอดมิน</p>
          )}
          {paymentStatus === 'expired' && (
            <p className="text-gray-500 font-medium">กรุณาทำรายการจองใหม่อีกครั้ง</p>
          )}
        </div>

      </div>
    </div>
  );
}