import { Search, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar"; 

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

      <main className="flex-grow py-12 px-4 md:px-0">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-[#5C3D2E] text-center mb-12 leading-tight">
            ยินดีต้อนรับสู่หน้าติดต่อเรา
          </h1>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="relative mb-8">
                <input
                  type="text"
                  placeholder="ค้นหาหัวข้อ"
                  className="w-full p-3 pl-6 pr-16 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
                />
                <button className="absolute right-0 top-0 h-full w-14 bg-gray-200 rounded-r-full flex items-center justify-center text-gray-500 hover:bg-gray-300 transition">
                  <Search size={22} />
                </button>
              </div>

              <h2 className="text-xl font-extrabold text-[#5C3D2E] mb-6">เรียกดูตามหัวข้อ</h2>
              <div className="space-y-1">
                {topics.map((topic, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center justify-between p-4 border-b border-[#E0D8C8] hover:bg-white/60 transition text-left text-[#5C3D2E] font-bold text-lg group"
                  >
                    {topic}
                    <ChevronRight size={24} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full md:w-[450px] shrink-0">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-50 sticky top-28">
                <h2 className="text-3xl font-extrabold text-[#5C3D2E] mb-1">สนใจติดต่อ</h2>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="flex gap-3">
                    <input type="text" placeholder="ชื่อจริง" className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                    <input type="text" placeholder="นามสกุล" className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                  </div>
                  
                  <div className="relative">
                    <input type="email" placeholder="อีเมลของคุณ" className="w-full p-3 pl-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                    <span className="absolute left-4 top-3.5 text-gray-400">✉️</span>
                  </div>

                  <div className="flex border border-gray-300 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-orange-400">
                    <select className="bg-transparent p-3 text-sm border-r outline-none text-gray-600">
                      <option>+66</option>
                    </select>
                    <input type="text" placeholder="หมายเลขโทรศัพท์" className="flex-1 p-3 text-sm outline-none" />
                  </div>

                  <textarea
                    placeholder="เราจะช่วยคุณได้อย่างไร?"
                    rows={6}
                    className="w-full p-4 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm resize-none"
                  ></textarea>

                  <button
                    type="submit"
                    className="w-full bg-[#FF8A00] hover:bg-[#e67c00] text-white font-bold py-4 rounded-full transition-all text-xl shadow-md active:scale-95"
                  >
                    ส่ง
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;