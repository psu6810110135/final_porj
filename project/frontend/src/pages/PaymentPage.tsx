import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { API_BASE_URL } from "@/config/api";

export default function PaymentPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // id คือ bookingId
  const location = useLocation();

  // State สำหรับเก็บข้อมูล
  const [amount, setAmount] = useState(location.state?.amount || 0);
  const [qrPayload, setQrPayload] = useState("");
  
  // ✨ State จัดการเวลา
  const [deadline, setDeadline] = useState<string | null>(null); // เก็บเวลาหมดอายุจาก Backend
  const [timeLeft, setTimeLeft] = useState(0); 

  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "pending_verify" | "approved" | "rejected" | "expired"
  >("pending");

  // State สำหรับอัปโหลดสลิป
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false); // ✨ โหลดตอนกดต่อเวลา

  const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem("jwt_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ✨ 1. ดึงข้อมูล QR Code และเวลาหมดอายุจาก Backend
  const fetchQrCode = useCallback(async () => {
    try {
      if (!id) return;
      const headers = getAuthHeader();
      const res = await fetch(`${API_BASE_URL}/api/payments/qr/${id}`, {
        headers,
      });
      if (!res.ok) throw new Error("Failed to fetch QR");

      const data = await res.json();
      setQrPayload(data.payload);
      setAmount(data.amount);
      
      // 🌟 ดึงเวลาหมดอายุจาก Backend (รองรับทั้งชื่อ paymentDeadline และ expiresAt)
      const expiryTime = data.paymentDeadline || data.expiresAt;
      if (expiryTime) {
        setDeadline(expiryTime);
      }
    } catch (error) {
      console.error("Error fetching QR:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchQrCode();
  }, [fetchQrCode]);

  // ✨ 2. ระบบนับเวลาอัจฉริยะ (อ้างอิงจากเวลาจริงใน DB)
  useEffect(() => {
    if (!deadline || paymentStatus !== "pending") return;

    const calculateTimeLeft = () => {
      const expireTime = new Date(deadline).getTime();
      const now = new Date().getTime();
      const diff = Math.floor((expireTime - now) / 1000); // แปลงเป็นวินาที
      return diff > 0 ? diff : 0;
    };

    // เซ็ตเวลาเริ่มต้นทันที
    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);

    if (initialTime <= 0) {
      setPaymentStatus("expired");
      return;
    }

    // อัปเดตทุกๆ 1 วินาที
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        setPaymentStatus("expired");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, paymentStatus]);

  // 3. เช็คสถานะการจ่ายเงิน (Polling)
  useEffect(() => {
    let interval: any;
    const checkStatus = async () => {
      try {
        if (!id) return;
        const headers = getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === "confirmed" || data.status === "paid") {
            setPaymentStatus("approved");
            clearInterval(interval);
            setTimeout(() => navigate("/booking-history"), 3000);
          }
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    };

    if (paymentStatus === "pending") {
      interval = setInterval(checkStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [id, navigate, paymentStatus]);

  // 4. ฟังก์ชันจัดการการอัปโหลดสลิป
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setIsUploading(true);

    const token = localStorage.getItem("jwt_token");
    if (!token) {
      alert("ไม่พบ Token! กรุณาล็อกอินใหม่");
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/bookings/${id}/upload-slip`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (res.ok) {
        setPaymentStatus("pending_verify");
        alert("ส่งสลิปสำเร็จ! ระบบกำลังรอการตรวจสอบจากแอดมิน");
        setTimeout(() => navigate("/booking-history"), 2000);
      } else {
        const err = await res.json();
        alert(`เกิดข้อผิดพลาด: ${err.message || "ไม่สามารถอัปโหลดได้"}`);
      }
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsUploading(false);
    }
  };

  // ✨ 5. ฟังก์ชันขอคิวอาร์โค้ดใหม่ (ต่อเวลา Soft Lock)
  const handleRenewBooking = async () => {
    setIsRenewing(true);
    try {
      const headers = getAuthHeader();
      const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/renew`, {
        method: "POST",
        headers,
      });

      if (res.ok) {
        alert("ต่อเวลาสำเร็จ! ระบบได้ยืดเวลาชำระเงินให้คุณอีก 15 นาที");
        setPaymentStatus("pending");
        fetchQrCode(); // โหลด QR Code และเวลาใหม่
      } else {
        const err = await res.json();
        alert(err.message || "ขออภัย ทัวร์นี้ที่นั่งเต็มแล้ว กรุณากดจองใหม่");
        navigate("/"); // ถ้าที่นั่งโดนแย่งไปแล้ว ให้เด้งกลับหน้าแรก
      }
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsRenewing(false);
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-gen") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `PromptPay-${amount}.png`;
      link.href = url;
      link.click();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ชำระเงินผ่านพร้อมเพย์
        </h2>
        <p className="text-gray-500 mb-6">สแกน QR Code ด้านล่างเพื่อชำระเงิน</p>

        {/* ยอดเงิน & เวลา */}
        <div className="bg-orange-50 rounded-lg p-4 mb-6 flex flex-col gap-2">
          <p className="text-sm text-orange-600 font-medium">ยอดที่ต้องชำระ</p>
          <p className="text-3xl font-bold text-orange-600 mb-2">
            ฿{amount.toLocaleString()}
          </p>
          <div className="border-t border-orange-200 pt-3 flex justify-between items-center px-2">
            <span className="text-sm text-gray-600">ชำระภายในเวลา</span>
            <span
              className={`text-xl font-bold font-mono ${
                timeLeft < 180 && paymentStatus === "pending"
                  ? "text-red-500 animate-pulse"
                  : "text-orange-600"
              }`}
            >
              {paymentStatus === "expired" ? "00:00" : formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* ส่วนแสดง QR Code */}
        <div className="flex flex-col items-center justify-center mb-6 relative">
          <div className="p-4 bg-white border-2 border-gray-100 rounded-xl shadow-sm mb-4 relative overflow-hidden">
            {qrPayload ? (
              <QRCodeCanvas
                id="qr-gen"
                value={qrPayload}
                size={200}
                level={"H"}
                includeMargin={true}
                className={`transition-all duration-500 ${
                  paymentStatus !== "pending" ? "opacity-10 blur-md" : "opacity-100"
                }`}
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-400">
                กำลังโหลด...
              </div>
            )}

            {/* Overlay: หมดเวลา (เพิ่ม UI ปิดทับ QR ไปเลย) */}
            {paymentStatus === "expired" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 p-2">
                <div className="text-5xl mb-2">⏳</div>
                <p className="font-bold text-lg text-red-500 bg-red-50 px-3 py-1 rounded-lg">
                  หมดเวลาชำระเงิน
                </p>
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  ห้ามโอนเงินด้วย QR Code นี้เด็ดขาด
                </p>
              </div>
            )}

            {/* Overlay: ส่งสลิปแล้ว */}
            {paymentStatus === "pending_verify" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-orange-500 z-10 animate-in fade-in zoom-in bg-white/90">
                <div className="text-6xl mb-2">📄</div>
                <p className="font-bold bg-white px-4 py-1 rounded-full border border-orange-200 shadow-sm">
                  ส่งสลิปแล้ว
                </p>
                <p className="text-sm mt-2 font-medium">รอแอดมินตรวจสอบ</p>
              </div>
            )}

            {/* Overlay: สำเร็จ */}
            {paymentStatus === "approved" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-green-500 z-10 animate-in fade-in zoom-in bg-white/90">
                <div className="text-6xl mb-2">✅</div>
                <p className="font-bold bg-white px-4 py-1 rounded-full shadow-sm">
                  ชำระเงินสำเร็จ!
                </p>
              </div>
            )}
          </div>

          {/* ปุ่มดาวน์โหลด (โชว์เฉพาะตอนยังไม่หมดเวลา) */}
          {paymentStatus === "pending" && (
            <button
              onClick={downloadQRCode}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              บันทึกรูป QR Code
            </button>
          )}

          {/* ✨ ปุ่มขอคิวอาร์ใหม่ (โชว์เฉพาะตอนหมดเวลา) */}
          {paymentStatus === "expired" && (
            <div className="w-full flex flex-col gap-3 mt-2">
              <button
                onClick={handleRenewBooking}
                disabled={isRenewing}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg shadow-sm disabled:bg-blue-300"
              >
                {isRenewing ? "กำลังตรวจสอบที่นั่ง..." : "ขอคิวอาร์โค้ดใหม่ (ต่อเวลา)"}
              </button>
              
              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg"
              >
                กลับหน้าหลัก
              </button>
            </div>
          )}
        </div>

        {/* ส่วนฟอร์มอัปโหลดสลิป (ซ่อนทันทีถ้าหมดเวลา) */}
        {paymentStatus === "pending" && (
          <div className="mt-6 border-t border-gray-200 pt-6 text-left animate-in fade-in">
            <p className="text-sm font-bold text-gray-700 mb-3">
              แนบสลิปการโอนเงิน
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-50 file:text-orange-600
                hover:file:bg-orange-100 cursor-pointer mb-3"
            />

            {previewUrl && (
              <div className="mb-4 text-center">
                <img
                  src={previewUrl}
                  alt="Slip Preview"
                  className="mx-auto h-32 object-contain rounded-md shadow-sm border border-gray-200"
                />
              </div>
            )}

            <button
              onClick={handleUploadSubmit}
              disabled={isUploading || !file}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all 
                ${
                  !file || isUploading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 shadow-md"
                }`}
            >
              {isUploading ? "กำลังส่งข้อมูล..." : "ยืนยันการโอนเงินด้วยสลิป"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}