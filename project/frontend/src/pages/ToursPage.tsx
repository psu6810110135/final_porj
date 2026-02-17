import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // อย่าลืม import Link มาด้วยนะครับ

export default function ToursPage() {
  const [tours, setTours] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/tours")
      .then((res) => res.json())
      .then((data) => setTours(data))
      .catch((err) => console.error("Error:", err));
  }, []);

  return (
    <div className="bg-[#F6F1E9] min-h-screen p-4 md:p-10 font-sans text-[#4F200D]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* --- ปุ่มกลับหน้าหลัก --- */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"
          >
            <span>←</span> กลับหน้าหลัก
          </Link>
        </div>

        <h1 className="text-4xl font-black text-center mb-12">ทุกจุดหมาย มั่นใจไปกับเรา</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- แถบ Filter ด้านซ้าย --- */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm sticky top-10 border border-orange-50">
              <h3 className="font-extrabold text-xl mb-6">ระยะเวลา</h3>
              <div className="space-y-4">
                {['1 วัน', 'หลายวัน', '2 วัน 1 คืน', 'ครึ่งวัน'].map((label) => (
                  <label key={label} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-5 h-5 accent-[#FF8400] rounded-lg" />
                    <span className="text-sm font-medium group-hover:text-[#FF8400]">{label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="font-extrabold text-xl mb-6">โซน / ภูมิภาค</h3>
                <div className="space-y-4">
                  {['ภาคเหนือ', 'ภาคใต้', 'ภาคกลาง', 'เกาะ/ทะเล'].map((zone) => (
                    <label key={zone} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 accent-[#FF8400] rounded-lg" />
                      <span className="text-sm font-medium group-hover:text-[#FF8400]">{zone}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* --- ส่วนแสดง Card ทัวร์ (3 Columns) --- */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tours.map((tour: any) => (
                <div key={tour.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col h-full hover:shadow-xl transition-all group">
                  <div className="relative h-52 shrink-0 overflow-hidden">
                    <img 
                      src={tour.image_cover || "https://via.placeholder.com/400x300"} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt={tour.title} 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-[#FF8400]">
                      ★ 4.8/5
                    </div>
                  </div>
                  
                  <div className="p-7 flex flex-col flex-grow">
                    <h3 className="text-2xl font-black mb-1">{tour.title}</h3>
                    <p className="text-sm text-gray-400 mb-6 line-clamp-1">{tour.province || 'ประเทศไทย'}</p>
                    
                    <div className="mt-auto pt-5 border-t border-gray-100 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">เริ่มต้น</span>
                        <div className="text-2xl font-black">฿{parseFloat(tour.price).toLocaleString()}</div>
                      </div>
                      <button className="bg-[#F6F1E9] text-[#4F200D] w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#FF8400] hover:text-white transition-all shadow-sm">
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}