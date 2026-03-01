import { Search, ChevronRight } from "lucide-react";

import Navbar from "../components/Navbar"; 
import Footer from "@/components/Footer";

const ContactPage = () => {
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

  return (
    <div className="min-h-screen bg-[#F5F1E9] flex flex-col">
      <Navbar activePage="contact" />

      <main className="flex-grow py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#5C3D2E] text-center mb-8 md:mb-12 leading-tight">
            ยินดีต้อนรับสู่หน้าติดต่อเรา
          </h1>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
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

            <div className="w-full lg:w-[450px] shrink-0 order-1 lg:order-2">
              <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-gray-50 lg:sticky lg:top-28">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#5C3D2E] mb-6">สนใจติดต่อ</h2>

                <form className="space-y-4 md:space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <input type="text" placeholder="ชื่อจริง" className="flex-1 min-w-0 p-3.5 rounded-2xl md:rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm bg-gray-50/50" />
                    <input type="text" placeholder="นามสกุล" className="flex-1 min-w-0 p-3.5 rounded-2xl md:rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm bg-gray-50/50" />
                  </div>
                  
                  <div className="relative">
                    <input type="email" placeholder="อีเมลของคุณ" className="w-full p-3.5 pl-12 rounded-2xl md:rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm bg-gray-50/50" />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                  </div>

                  <div className="flex border border-gray-200 rounded-2xl md:rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-[#FF8A00] bg-gray-50/50">
                    <select className="bg-transparent p-3.5 text-sm border-r border-gray-200 outline-none text-gray-600 font-medium cursor-pointer">
                      <option>+66</option>
                    </select>
                    <input type="tel" placeholder="หมายเลขโทรศัพท์" className="flex-1 p-3.5 text-sm outline-none bg-transparent" />
                  </div>

                  <textarea
                    placeholder="เราจะช่วยคุณได้อย่างไร?"
                    rows={5}
                    className="w-full p-4 rounded-[1.2rem] md:rounded-[1.5rem] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm resize-none bg-gray-50/50"
                  ></textarea>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#FF8A00] hover:bg-[#e67c00] text-white font-bold py-3.5 md:py-4 rounded-full transition-all text-lg shadow-md hover:shadow-lg active:scale-95"
                  >
                    ส่งข้อความ
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