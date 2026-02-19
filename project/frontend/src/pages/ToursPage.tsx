import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Import logo
import logoImage from "../assets/logo.png";

interface Tour {
  id: number | string;
  title: string;
  image_cover?: string;
  province?: string;
  price: string | number;
  duration?: string;
}

// SVG ICON Components
const UserIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
  </svg>
);

const ShoppingCartIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M17 17h-11v-14h-2" />
    <path d="M6 5l14 1l-1 7h-13" />
  </svg>
);

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/v1/tours")
      .then((res) => res.json())
      .then((data) => setTours(data))
      .catch((err) => console.error("Error:", err));
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F1E9]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8">
          <div className="flex items-center h-16 md:h-24">
            
            {/* Logo */}
            <div className="flex-1 flex items-center gap-4">
              <Link to="/" className="flex items-center gap-4">
                <div className="relative h-10 md:h-16">
                  <img
                    src={logoImage}
                    alt="Thai Tours Logo"
                    className="h-full w-auto object-contain"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
                <span className="text-lg md:text-xl font-bold text-[#4F200D] hidden sm:block">
                  Thai Tours Service
                </span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <Link
                to="/"
                className="font-extralight text-base md:text-lg text-[#4F200D] hover:text-[#FF8400] transition-colors"
              >
                Home
              </Link>

              <Link
                to="/tours"
                className="font-bold text-lg md:text-xl text-[#FF8400]"
              >
                Tours
              </Link>
              
              <Link
                to="#"
                className="font-extralight text-base md:text-lg text-[#4F200D] hover:text-[#FF8400] transition-colors"
              >
                About Us
              </Link>
              <Link
                to="#"
                className="font-extralight text-base md:text-lg text-[#4F200D] hover:text-[#FF8400] transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Cart & User Icons */}
            <div className="flex-1 flex items-center justify-end gap-3">
              <Button className="w-10 h-10 md:w-12 md:h-12 rounded-full border-3 border-[#F6F1E9] bg-white hover:bg-[#FF8400]/90 flex items-center justify-center p-0">
                <ShoppingCartIcon className="w-4 h-4 md:w-5 md:h-5 text-[#4F200D]" />
              </Button>
              <Button className="w-10 h-10 md:w-12 md:h-12 rounded-full border-3 border-[#F6F1E9] bg-white hover:bg-[#FF8400]/90 flex items-center justify-center p-0">
                <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-[#4F200D]" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-grow p-4 md:p-10">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"
            >
              <span>←</span> กลับหน้าหลัก
            </Link>
          </div>

          <h1 className="text-4xl font-black text-center mb-8 text-[#4F200D]">ทุกจุดหมาย มั่นใจไปกับเรา</h1>

          {/* ช่องค้นหา */}
          <div className="flex gap-3 max-w-2xl mx-auto mb-12">
            <Input 
              type="text" 
              placeholder="ค้นหาสถานที่ท่องเที่ยว..." 
              className="h-12 rounded-full border-none shadow-sm bg-white px-6 focus-visible:ring-[#FF8400]" 
            />
            <Button className="h-12 px-8 rounded-full bg-[#FF8400] hover:bg-[#E67700] text-white font-bold">
              ค้นหา
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Filter Sidebar */}
            <aside className="w-full lg:w-72 shrink-0">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm sticky top-28 border border-orange-50">
                <h3 className="font-extrabold text-xl mb-6 text-[#4F200D]">ระยะเวลา</h3>
                <div className="space-y-4">
                  {['1 วัน', 'หลายวัน', '2 วัน 1 คืน', 'ครึ่งวัน'].map((label) => (
                    <label key={label} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 accent-[#FF8400] rounded-lg" />
                      <span className="text-sm font-medium text-[#4F200D] group-hover:text-[#FF8400]">{label}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="font-extrabold text-xl mb-6 text-[#4F200D]">โซน / ภูมิภาค</h3>
                  <div className="space-y-4">
                    {['ภาคเหนือ', 'ภาคใต้', 'ภาคกลาง', 'เกาะ/ทะเล'].map((zone) => (
                      <label key={zone} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-5 h-5 accent-[#FF8400] rounded-lg" />
                        <span className="text-sm font-medium text-[#4F200D] group-hover:text-[#FF8400]">{zone}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Tours Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tours.map((tour) => (
                  <Card key={tour.id} className="rounded-[2.5rem] overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 group bg-white h-full flex flex-col">
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
                    
                    <CardContent className="p-7 flex flex-col flex-grow">
                      <h3 className="text-2xl font-black mb-1 text-[#4F200D]">{tour.title}</h3>
                      
                      {/* 2. แสดงระยะเวลา คู่กับจังหวัด */}
                      <div className="flex items-center gap-2 mb-6 text-sm">
                        <span className="text-gray-400 line-clamp-1">{tour.province || 'ประเทศไทย'}</span>
                        {/* เช็คว่ามีข้อมูล duration ส่งมาไหม ถ้ามีค่อยแสดง */}
                        {tour.duration && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="font-medium text-[#FF8400] bg-orange-50 px-2 py-0.5 rounded-md">
                              {tour.duration}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="mt-auto pt-5 border-t border-gray-100 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">เริ่มต้น</span>
                          <div className="text-2xl font-black text-[#4F200D]">
                            ฿{Number(tour.price).toLocaleString()}
                          </div>
                        </div>
                        <Button size="icon" className="w-12 h-12 rounded-full bg-[#F6F1E9] hover:bg-[#FF8400] text-[#4F200D] hover:text-white transition-all shadow-none hover:shadow-md">
                          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#4F200D] text-white py-6 md:py-9 rounded-t-[30px] md:rounded-t-[45px] lg:rounded-t-[60px]">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
            {/* Logo & Description */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <img
                  src={logoImage}
                  alt="Thai Tours Logo"
                  className="h-8 md:h-12 w-auto object-contain"
                />
                <span className="text-lg md:text-xl font-bold">
                  Thai Tours Service
                </span>
              </div>
              <p className="text-xs md:text-sm xl:text-base font-extralight leading-relaxed text-white/80 max-w-xs md:max-w-sm">
                เที่ยวอย่างมั่นใจไปกับเรา สร้างความทรงจำที่ประทับใจมิรู้ลืม
                ด้วยบริการระดับพรีเมียม
              </p>
            </div>

            {/* Organization Info */}
            <div>
              <h3 className="text-base md:text-lg xl:text-xl font-bold mb-2 md:mb-3">
                ข้อมูลองค์กร
              </h3>
              <ul className="space-y-1 md:space-y-2">
                <li>
                  <Link
                    to="#"
                    className="text-xs md:text-sm xl:text-base font-extralight text-white/80 hover:text-white transition-colors"
                  >
                    เกี่ยวกับเรา
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-xs md:text-sm xl:text-base font-extralight text-white/80 hover:text-white transition-colors"
                  >
                    สถานที่ท่องเที่ยว
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-base md:text-lg xl:text-xl font-bold mb-2 md:mb-3">
                Support
              </h3>
              <ul className="space-y-1 md:space-y-2">
                <li>
                  <Link
                    to="#"
                    className="text-xs md:text-sm xl:text-base font-extralight text-white/80 hover:text-white transition-colors"
                  >
                    ศูนย์ช่วยเหลือ
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-xs md:text-sm xl:text-base font-extralight text-white/80 hover:text-white transition-colors"
                  >
                    เงื่อนไขการให้บริการ
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-xs md:text-sm xl:text-base font-extralight text-white/80 hover:text-white transition-colors"
                  >
                    นโยบายความเป็นส่วนตัว
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-xs md:text-sm xl:text-base font-extralight text-white/80 hover:text-white transition-colors"
                  >
                    ติดต่อเรา
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-lg md:text-xl xl:text-[32px] font-bold mb-4 md:mb-6">
                ติดตามข่าวสาร
              </h3>
              <p className="text-sm md:text-base xl:text-[24px] font-extralight mb-4 md:mb-6 text-white/80 max-w-xs">
                สมัครรับข่าวสารเพื่อไม่พลาดข้อมูลอัปเดตและข้อเสนอสุดพิเศษ
              </p>
              <div className="flex gap-3 md:gap-4">
                {["facebook", "twitter", "instagram"].map((social) => (
                  <Link
                    key={social}
                    to="#"
                    className="w-10 h-10 md:w-14 md:h-14 xl:w-[57px] xl:h-[57px] rounded-full bg-[#F6F1E9] flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <span className="text-xs md:text-sm capitalize">
                      {social[0]}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/20 pt-4 md:pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs md:text-sm text-white/80 text-center md:text-left">
                2024 Thai Tours Service. All rights reserved.
              </p>
              <div className="flex gap-4">
                <Link
                  to="#"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </Link>
                <Link
                  to="#"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}