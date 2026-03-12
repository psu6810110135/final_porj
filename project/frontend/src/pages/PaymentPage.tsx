import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/utils/auth";


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
  const [uploadAlert, setUploadAlert] = useState<{ title: string; message: string; isSuccess: boolean } | null>(null);
  const [renewAlert, setRenewAlert] = useState<{ title: string; message: string; isSuccess: boolean } | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const getAuthHeader = (): Record<string, string> => {
    const token = getToken();
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

      // 🌟 1. ดักขนาดไฟล์ตรงนี้เลย! (5 * 1024 * 1024 = 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        // เด้ง Popup แจ้งเตือนสวยๆ ที่เราทำไว้
        setUploadAlert({
          title: "ไฟล์ขนาดใหญ่เกินไป",
          message: "สลิปโอนเงินต้องมีขนาดไม่เกิน 5MB กรุณาย่อรูปหรือเลือกไฟล์ใหม่",
          isSuccess: false
        });
        
        // ล้างค่า input ทิ้ง เพื่อให้ลูกค้ากดเลือกไฟล์ใหม่ได้
        e.target.value = ""; 
        setFile(null); // เคลียร์รูปเก่าที่อาจจะค้างอยู่
        setPreviewUrl(""); // เคลียร์พรีวิวเก่าทิ้งด้วย (ถ้า State คุณใช้เป็น null ก็เปลี่ยนเป็น null ได้เลยครับ)
        return; // สั่งหยุดการทำงานตรงนี้เลย ไม่ไปทำคำสั่งข้างล่างต่อ
      }

      // 🌟 2. ถ้าไฟล์ขนาดโอเค (< 5MB) ก็เซฟลง State ตามปกติของคุณเลยครับ
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setIsUploading(true);

    const token = getToken();

    if (!token) {
      setUploadAlert({ title: "เซสชันหมดอายุ", message: "ไม่พบ Token! กรุณาล็อกอินใหม่", isSuccess: false });
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/upload-slip`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setPaymentStatus("pending_verify");
        // แสดง Popup สวยๆ แทน alert แบบเดิม
        setUploadAlert({
          title: "ส่งสลิปการโอนเงินสำเร็จ",
          message: "ระบบกำลังรอการตรวจสอบจากแอดมิน กรุณารอการยืนยันสถานะในหน้าประวัติการจอง",
          isSuccess: true
        });
      } else {
        const err = await res.json();
        setUploadAlert({
          title: "ไม่สามารถอัปโหลดได้",
          message: err.message || "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง",
          isSuccess: false
        });
      }
    } catch (error) {
      setUploadAlert({
        title: "เกิดข้อผิดพลาด",
        message: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ตของคุณ",
        isSuccess: false
      });
    } finally {
      setIsUploading(false);
    }
  };

  // ✨ 5. ฟังก์ชันขอคิวอาร์โค้ดใหม่ (ต่อเวลา Soft Lock)
  const handleRenewBooking = async () => {
    setIsRenewing(true);
    try {
      const token = getToken();

      const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/renew`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setRenewAlert({
          title: "ขอคิวอาร์โค้ดใหม่สำเร็จ",
          message: "ระบบสร้างคิวอาร์โค้ดใหม่ให้ท่านเรียบร้อยแล้ว กรุณาชำระเงินภายในเวลาที่กำหนด",
          isSuccess: true
        });
      } else {
        const err = await res.json();
        setRenewAlert({
          title: "ไม่สามารถขอคิวอาร์โค้ดใหม่ได้",
          message: err.message || "ขออภัยในความไม่สะดวก ที่นั่งในรอบดังกล่าวเต็มแล้ว กรุณาเลือกวันหรือเวลาเดินทางอื่น",
          isSuccess: false
        });
      }
    } catch (error) {
      setRenewAlert({
        title: "เกิดข้อผิดพลาด",
        message: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
        isSuccess: false
      });
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

      setIsDownloaded(true);
      setTimeout(() => {
        setIsDownloaded(false);
      }, 2000); // 3 วินาทีกลับเป็นเหมือนเดิม
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDownloaded
                  ? "bg-green-500 hover:bg-green-600 text-white" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {isDownloaded ? "บันทึกสำเร็จ" : "บันทึกรูป QR Code"}
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
                {isRenewing ? "กำลังตรวจสอบที่นั่ง..." : "ขอคิวอาร์โค้ดใหม่"}
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
            <div className="mb-3">
              <p className="text-sm font-bold text-gray-700">
                แนบสลิปการโอนเงิน
              </p>
              <p className="text-xs text-gray-500 mt-1">
                รองรับไฟล์: JPEG, JPG, PNG (ขนาดไม่เกิน 5MB)
              </p>
            </div>
            <input
              type="file"
              accept="image/jpeg, image/jpg, image/png"
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

      {uploadAlert && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col animate-in fade-in zoom-in">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-gray-800 font-bold text-lg">
                {uploadAlert.title}
              </h3>
            </div>
            <div className="px-5 py-5 text-left">
              <p className="text-sm text-gray-600 mb-6">{uploadAlert.message}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (uploadAlert.isSuccess) {
                      navigate("/booking-history");
                    } else {
                      setUploadAlert(null);
                    }
                  }}
                  className="text-sm font-bold px-6 py-2.5 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                >
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {renewAlert && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col animate-in fade-in zoom-in">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-gray-800 font-bold text-lg">
                {renewAlert.title}
              </h3>
            </div>
            <div className="px-5 py-5 text-left">
              <p className="text-sm text-gray-600 mb-6">{renewAlert.message}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setRenewAlert(null); // ปิด Popup ก่อน
                    if (renewAlert.isSuccess) {
                      window.location.reload(); // รีเฟรชหน้าเว็บเพื่อเริ่มนับเวลาใหม่
                    }
                  }}
                  className="text-sm font-bold px-6 py-2.5 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                >
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}