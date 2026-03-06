import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react"; // ✅ นำเข้าตัวสร้าง QR Code
import { API_BASE_URL } from "@/config/api";

export default function PaymentPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // id คือ bookingId
  const location = useLocation();

  // State สำหรับเก็บข้อมูล
  const [amount, setAmount] = useState(location.state?.amount || 0);
  const [qrPayload, setQrPayload] = useState(""); // เก็บโค้ดยาวๆ สำหรับสร้าง QR

  // ✨ แก้ไข Type ให้รองรับสถานะ 'pending_verify' ตอนส่งสลิปเสร็จ
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "pending_verify" | "approved" | "rejected" | "expired"
  >("pending");
  const [timeLeft, setTimeLeft] = useState(900); // 15 นาที

  // ✨ State ที่เพิ่มมาใหม่สำหรับระบบอัปโหลดสลิป
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem("jwt_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 1. ดึงข้อมูล QR Code จาก Backend (ทำงานครั้งแรกครั้งเดียว)
  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const headers = getAuthHeader();
        // ยิงไปที่ API ที่เราเพิ่งเขียนใน Backend
        const res = await fetch(`${API_BASE_URL}/api/payments/qr/${id}`, {
          headers,
        });
        if (!res.ok) throw new Error("Failed to fetch QR");

        const data = await res.json();
        setQrPayload(data.payload); // ✅ ได้รหัสยาวๆ มาแล้ว
        setAmount(data.amount); // อัปเดตยอดเงินให้ตรงกับ DB
      } catch (error) {
        console.error("Error fetching QR:", error);
      }
    };

    if (id) fetchQrCode();
  }, [id]);

  // 2. ฟังก์ชันดาวน์โหลด (แก้ให้รองรับ QRCodeCanvas)
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

  // 3. ตัวนับเวลาถอยหลัง
  useEffect(() => {
    if (paymentStatus !== "pending" || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus("expired");
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

        const headers = getAuthHeader();

        const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === "confirmed" || data.status === "paid") {
            setPaymentStatus("approved");
            clearInterval(interval);
            setTimeout(() => navigate("/booking-history"), 3000); // ✨ แก้กลับไปหน้าประวัติ
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

  // ✨ 5. ฟังก์ชันจัดการการอัปโหลดสลิป (เพิ่มใหม่)
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

    // 🔍 เช็คว่า Token มีอยู่จริงไหมใน LocalStorage
    const token = localStorage.getItem("jwt_token");
    console.log("Token ที่ดึงมาจาก LocalStorage:", token);

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
            // 🌟 ใส่ Bearer ตรงๆ แบบนี้เพื่อความชัวร์ (ตรวจสอบว่ามีช่องว่างหลัง Bearer)
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (res.ok) {
        setPaymentStatus("pending_verify");
        alert("ส่งสลิปสำเร็จ! ระบบกำลังรอการตรวจสอบจากแอดมิน");
        setTimeout(() => navigate("/booking-history"), 2000);
      } else {
        // 🌟 ดู Error ละเอียดจากหลังบ้าน
        const err = await res.json();
        console.error("Server Error:", err);
        alert(`เกิดข้อผิดพลาด: ${err.message || "ไม่สามารถอัปโหลดได้"}`);
      }
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsUploading(false);
    }
  };

  // จัดรูปแบบเวลา
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
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
              className={`text-xl font-bold font-mono ${timeLeft < 180 ? "text-red-500 animate-pulse" : "text-orange-600"}`}
            >
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
                className={`transition-all duration-500 ${paymentStatus !== "pending" ? "opacity-20 blur-sm" : "opacity-100"}`}
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-400">
                กำลังโหลด...
              </div>
            )}

            {/* ✨ Overlay: รอแอดมินตรวจสอบ (เพิ่มใหม่) */}
            {paymentStatus === "pending_verify" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-orange-500 z-10 animate-in fade-in zoom-in bg-white/80">
                <div className="text-6xl mb-2">📄</div>
                <p className="font-bold bg-white px-4 py-1 rounded-full border border-orange-200 shadow-sm">
                  ส่งสลิปแล้ว
                </p>
                <p className="text-sm mt-2 font-medium">รอแอดมินตรวจสอบ</p>
              </div>
            )}

            {/* Overlay: สำเร็จ */}
            {paymentStatus === "approved" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-green-500 z-10 animate-in fade-in zoom-in">
                <div className="text-6xl mb-2">✅</div>
                <p className="font-bold bg-white/90 px-4 py-1 rounded-full">
                  ชำระเงินสำเร็จ!
                </p>
              </div>
            )}

            {/* Overlay: หมดเวลา */}
            {paymentStatus === "expired" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <p className="font-bold text-lg bg-white/90 text-red-500 px-4 py-1 rounded-full shadow-sm">
                  หมดเวลาชำระเงิน
                </p>
              </div>
            )}
          </div>

          {/* ปุ่มดาวน์โหลด */}
          {paymentStatus === "pending" && (
            <button
              onClick={downloadQRCode}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              บันทึกรูป QR Code
            </button>
          )}

          {/* ปุ่มรีโหลด */}
          {paymentStatus === "expired" && (
            <button
              onClick={() => navigate("/booking-history")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg mt-4"
            >
              กลับไปหน้าประวัติการจอง
            </button>
          )}
        </div>

        {/* สถานะ Text */}
        <div className="mt-2 min-h-[24px]">
          {paymentStatus === "pending" && (
            <div className="flex items-center justify-center gap-2 text-orange-600">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <p className="font-medium text-sm">ระบบตรวจสอบอัตโนมัติ...</p>
            </div>
          )}
        </div>

        {/* ✨ ส่วนฟอร์มอัปโหลดสลิปที่เพิ่มมาใหม่ (แสดงตอนที่ยังไม่หมดเวลา) */}
        {paymentStatus === "pending" && (
          <div className="mt-6 border-t border-gray-200 pt-6 text-left">
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
