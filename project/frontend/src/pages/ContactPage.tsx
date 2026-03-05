import { useState, useEffect } from "react";
import { Search, ChevronRight, Loader2, CheckCircle2, XCircle } from "lucide-react"; // 👈 เพิ่ม Icon แจ้งเตือน

import Navbar from "../components/Navbar"; 
import Footer from "@/components/Footer";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneCode: "+66",
    phoneNumber: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState(""); // State สำหรับเก็บข้อความแจ้งเตือน

  const topics = [
    "วางแผน ค้นหา และจอง",
    "ข้อมูลกิจกรรม",
    "การยืนยันการจอง บัตรกำนัล...",
    "จุดนัดพบและการรับส่ง",
    "ในวันทำกิจกรรม",
    "การจัดการการจอง",
    "การยกเลิก",
    "การชำระเงินและการคืนเงิน",
    "ข้อมูลและความเป็นส่วนตัว",
    "เกี่ยวกับ การรับคำแนะนำของคุณ",
  ];

  // เคลียร์ข้อความสำเร็จอัตโนมัติเมื่อผ่านไป 5 วินาที
  useEffect(() => {
    if (submitStatus === "success") {
      const timer = setTimeout(() => {
        setSubmitStatus("idle");
        setStatusMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setStatusMessage("");

    try {
      const formattedData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: `${formData.phoneCode}${formData.phoneNumber}`,
        message: formData.message
      };

      const response = await fetch("http://localhost:3000/api/v1/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setStatusMessage("ส่งข้อความสำเร็จ! ทีมงานจะติดต่อกลับโดยเร็วที่สุด");
        setFormData({
          firstName: "", lastName: "", email: "", phoneCode: "+66", phoneNumber: "", message: ""
        });
      } else {
        setSubmitStatus("error");
        setStatusMessage("เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
      setStatusMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่าเปิด Backend แล้วหรือยัง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E9] flex flex-col">
      <Navbar activePage="contact" />

      <main className="flex-grow py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#5C3D2E] text-center mb-8 md:mb-12 leading-tight">
            ยินดีต้อนรับสู่หน้าติดต่อเรา
          </h1>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* ซ้าย: หัวข้อ */}
            <div className="flex-1 order-2 lg:order-1">
              <div className="relative mb-6 md:mb-8">
                <input
                  type="text"
                  placeholder="ค้นหาหัวข้อ"
                  className="w-full p-3 pl-6 pr-16 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00] shadow-sm text-sm md:text-base"
                />
                <button className="absolute right-0 top-0 h-full w-14 bg-gray-200 rounded-r-full flex items-center justify-center text-gray-500 hover:bg-[#FF8A00] hover:text-white transition-colors duration-300">
                  <Search size={20} />
                </button>
              </div>

              <h2 className="text-xl md:text-2xl font-extrabold text-[#5C3D2E] mb-4 md:mb-6">เรียกดูตามหัวข้อ</h2>
              <div className="space-y-1">
                {topics.map((topic, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center justify-between p-4 border-b border-[#E0D8C8] hover:bg-white/60 transition text-left text-[#5C3D2E] font-bold text-base md:text-lg group"
                  >
                    <span className="pr-4">{topic}</span>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-[#FF8A00] transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* ขวา: ฟอร์มติดต่อ */}
            <div className="w-full lg:w-[450px] shrink-0 order-1 lg:order-2">
              <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-gray-50 lg:sticky lg:top-28">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#5C3D2E] mb-6">สนใจติดต่อ</h2>

                <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="ชื่อจริง" 
                      required
                      className="flex-1 min-w-0 p-3.5 rounded-2xl md:rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm bg-gray-50/50" 
                    />
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="นามสกุล" 
                      required
                      className="flex-1 min-w-0 p-3.5 rounded-2xl md:rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm bg-gray-50/50" 
                    />
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="อีเมลของคุณ" 
                      required
                      className="w-full p-3.5 pl-12 rounded-2xl md:rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm bg-gray-50/50" 
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                  </div>

                  <div className="flex border border-gray-200 rounded-2xl md:rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-[#FF8A00] bg-gray-50/50">
                    <select 
                      name="phoneCode"
                      value={formData.phoneCode}
                      onChange={handleChange}
                      className="bg-transparent p-3.5 text-sm border-r border-gray-200 outline-none text-gray-600 font-medium cursor-pointer"
                    >
                      <option value="+66">+66</option>
                    </select>
                    <input 
                      type="tel" 
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="หมายเลขโทรศัพท์" 
                      required
                      className="flex-1 p-3.5 text-sm outline-none bg-transparent" 
                    />
                  </div>

                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="เราจะช่วยคุณได้อย่างไร?"
                    rows={5}
                    required
                    className="w-full p-4 rounded-[1.2rem] md:rounded-[1.5rem] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm resize-none bg-gray-50/50"
                  ></textarea>

                  {/* ส่วนกล่องข้อความแจ้งเตือน (ซ่อนถ้าไม่มีสถานะ) */}
                  {submitStatus !== "idle" && (
                    <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${
                      submitStatus === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {submitStatus === "success" ? <CheckCircle2 className="shrink-0 mt-0.5" size={18} /> : <XCircle className="shrink-0 mt-0.5" size={18} />}
                      <p>{statusMessage}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 bg-[#FF8A00] hover:bg-[#e67c00] text-white font-bold py-3.5 md:py-4 rounded-full transition-all text-lg shadow-md hover:shadow-lg active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        กำลังส่ง...
                      </>
                    ) : (
                      "ส่งข้อความ"
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;