import { Link } from "react-router-dom";
import logoImage from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-[#4F200D] text-white py-6 md:py-9 rounded-t-[30px] md:rounded-t-[45px] lg:rounded-t-[60px]">
      <div className="max-w-[1920px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <img src={logoImage} alt="Thai Tours Logo" className="h-8 md:h-12 w-auto object-contain" />
              <span className="text-lg md:text-xl font-bold">Thai Tours Service</span>
            </div>
            <p className="text-xs md:text-sm xl:text-base font-extralight leading-relaxed text-white/80 max-w-xs md:max-w-sm">
              เที่ยวอย่างมั่นใจไปกับเรา สร้างความทรงจำที่ประทับใจมิรู้ลืม ด้วยบริการระดับพรีเมียม
            </p>
          </div>

          {/* Organization Info */}
          <div>
            <h3 className="text-base md:text-lg xl:text-xl font-bold mb-2 md:mb-3">ข้อมูลองค์กร</h3>
            <ul className="space-y-1 md:space-y-2">
              <li><Link to="/about" className="text-xs md:text-sm xl:text-base font-extralight text-white/80 hover:text-white transition-colors">เกี่ยวกับเรา</Link></li>
              <li><Link to="/tours" className="text-xs md:text-sm xl:text-base font-extralight text-white/80 hover:text-white transition-colors">สถานที่ท่องเที่ยว</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-base md:text-lg xl:text-xl font-bold mb-2 md:mb-3">Support</h3>
            <ul className="space-y-1 md:space-y-2">
              <li><a href="#" className="text-xs md:text-sm xl:text-base font-extralight text-white/80 hover:text-white transition-colors">ศูนย์ช่วยเหลือ</a></li>
              <li><a href="#" className="text-xs md:text-sm xl:text-base font-extralight text-white/80 hover:text-white transition-colors">เงื่อนไขการให้บริการ</a></li>
              <li><a href="#" className="text-xs md:text-sm xl:text-base font-extralight text-white/80 hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</a></li>
              <li><Link to="/contact" className="text-xs md:text-sm xl:text-base font-extralight text-white/80 hover:text-white transition-colors">ติดต่อเรา</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg md:text-xl xl:text-[32px] font-bold mb-4 md:mb-6">ติดตามข่าวสาร</h3>
            <p className="text-sm md:text-base xl:text-[24px] font-extralight mb-4 md:mb-6 text-white/80 max-w-xs">
              สมัครรับข่าวสารเพื่อไม่พลาดข้อมูลอัปเดตและข้อเสนอสุดพิเศษ
            </p>
            <div className="flex gap-3 md:gap-4">
              {["facebook", "twitter", "instagram"].map((social) => (
                <a key={social} href="#" className="w-10 h-10 md:w-14 md:h-14 xl:w-[57px] xl:h-[57px] rounded-full bg-[#F6F1E9] flex items-center justify-center hover:bg-white/30 transition-colors">
                  <span className="text-xs md:text-sm capitalize text-[#4F200D]">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/20 pt-4 md:pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs md:text-sm text-white/80 text-center md:text-left">
              2024 Thai Tours Service. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}