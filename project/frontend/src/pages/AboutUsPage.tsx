import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Scroll-reveal hook  ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function useRevealOnScroll(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  
  return { ref, visible };
}

export default function AboutPage() {
  // ── Hero text animation ──
  const [heroReady, setHeroReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setHeroReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // ── Scroll-reveal refs สำหรับแต่ละส่วน ──
  const heroImgReveal = useRevealOnScroll(0.1);
  const sec1Reveal = useRevealOnScroll(0.15);
  const sec2Reveal = useRevealOnScroll(0.15);
  const sec3Reveal = useRevealOnScroll(0.15);
  const ctaReveal = useRevealOnScroll(0.2);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col relative overflow-x-hidden">
      <Navbar activePage="about" />
      <div className="absolute top-1/3 left-0 w-full h-[800px] opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
      <main className="flex-grow flex flex-col items-center pt-12 md:pt-20 pb-16 relative z-10 w-full">

        {/* Hero Text */}
        <div 
          className={`text-center max-w-3xl mb-10 px-4 transition-all duration-1000 ${
            heroReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h1 className="text-3xl md:text-5xl font-black text-[#4F200D] mb-4 md:mb-6 leading-tight">
            สัมผัสเมืองไทย ในแบบที่คุณต้องการ
          </h1>
          <p className="text-base md:text-xl text-[#4F200D] font-medium">
            พร้อมพาทุกคนไปสัมผัสเสน่ห์ของเมืองไทยผ่านมุมมองใหม่ๆ ที่เข้าถึงง่ายและเป็นกันเอง
          </p>
        </div>

        {/* Hero Image with badge */}
        <div 
          ref={heroImgReveal.ref}
          className={`relative w-full mb-28 shadow-sm transition-all duration-1000 delay-200 ${
            heroImgReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <img
            src="https://img.tastelife.tv/assets/uploads/2021/12/Thailand_Relaxation_Film_16x9.jpg"
            alt="Group of friends traveling in Thailand"
            className="w-full h-[300px] md:h-[500px] object-cover"
          />
          {/* Badge */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#FF8A00] text-white text-xl md:text-3xl font-black py-4 px-10 md:px-20 rounded-full shadow-lg whitespace-nowrap">
            เรื่องราวของ ThaiTour
          </div>
        </div>

        {/* Content Sections */}
        <div className="w-full max-w-5xl space-y-20 md:space-y-28 mb-24 px-4 sm:px-6 lg:px-8">

          {/* Section 1: Text Left, Image Right */}
          <div 
            ref={sec1Reveal.ref}
            className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 transition-all duration-1000 ${
              sec1Reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
            }`}
          >
            <div className="flex-1 text-left order-2 md:order-1">
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#4F200D] leading-snug">
                เราเริ่มต้นจากความตั้งใจที่<br />
                อยากให้ <span className="text-[#FF8A00]">"การเดินทาง"</span><br />
                เป็นเรื่องที่ทุกคนเข้าถึงได้
              </h2>
            </div>
            <div className="flex-1 w-full order-1 md:order-2 relative">
              <div className="bg-[#f0e8dc] absolute -inset-4 rounded-[2rem] -z-10 rotate-3"></div>
              <img
                src="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=800&auto=format&fit=crop"
                alt="Relaxing by the lake"
                className="w-full h-[220px] md:h-[300px] object-cover rounded-[2rem] shadow-md"
              />
            </div>
          </div>

          {/* Section 2: Image Left, Text Right */}
          <div 
            ref={sec2Reveal.ref}
            className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 transition-all duration-1000 delay-100 ${
              sec2Reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
            }`}
          >
            <div className="flex-1 w-full order-2 md:order-1 relative">
              <div className="bg-[#f0e8dc] absolute -inset-4 rounded-[2rem] -z-10 -rotate-3"></div>
              <img
                src="https://islanders-properties.com/images/blogs/157.jpg"
                alt="Travel map and gear"
                className="w-full h-[220px] md:h-[300px] object-cover rounded-[2rem] shadow-md"
              />
            </div>
            <div className="flex-1 text-right order-1 md:order-2">
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#4F200D] leading-snug">
                ไม่ว่าคุณจะชอบ<br />
                <span className="text-[#FF8A00]">ความชิลล์</span> หรือ <span className="text-[#FF8A00]">ความตื่นเต้น</span>
              </h2>
            </div>
          </div>

          {/* Section 3: Text Left, Image Right */}
          <div 
            ref={sec3Reveal.ref}
            className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 transition-all duration-1000 delay-100 ${
              sec3Reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
            }`}
          >
            <div className="flex-1 text-left order-2 md:order-1">
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#4F200D] leading-snug">
                เราคัดสรรเส้นทางที่ตอบโจทย์<br />
                เพื่อให้ทุกทริปคือ<br />
                <span className="text-[#FF8A00]">"ความทรงจำที่ดี"</span>
              </h2>
            </div>
            <div className="flex-1 w-full order-1 md:order-2 relative">
              <div className="bg-[#f0e8dc] absolute -inset-4 rounded-[2rem] -z-10 rotate-3"></div>
              <img
                src="https://cdn.sanity.io/images/jwtxpoed/production/ef26d6eea12db86754582d6cc90e0b0051ffd0d4-2532x1701.jpg?w=1920&sharp=20&q=75&auto=format"
                alt="Standing on mountain peak"
                className="w-full h-[220px] md:h-[300px] object-cover rounded-[2rem] shadow-md"
              />
            </div>
          </div>

        </div>

        {/* CTA - Fixed centered styling */}
        <div 
          ref={ctaReveal.ref}
          className={`text-center w-full max-w-2xl mt-8 px-4 mx-auto transition-all duration-1000 ${
            ctaReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-2xl md:text-3xl font-black text-[#4F200D] mb-8">
            พร้อมจะไป <span className="text-[#FF8A00]">เปิดโลกใหม่</span> กับเราหรือยัง?
          </h2>
          <Link
            to="/tours"
            className="inline-flex items-center gap-3 bg-[#FF8A00] hover:bg-[#e67c00] text-white text-lg md:text-xl font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95"
          >
            เลือกดูทริปที่ใช่สำหรับคุณ
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Play size={16} fill="currentColor" />
            </div>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}