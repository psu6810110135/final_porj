import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import heroBg from "../assets/ไม่ว่าจุดหมายคือที่ใด.png"
import similanBg from "../assets/Rectangle.png"
import khaoSokBg from "../assets/Rectangle 19387.png"

export default function HomePage() {
  const destinations = [
    {
      id: 1,
      name: "หมู่เกาะสิมิลัน",
      description: "ดำน้ำดูปะการังระดับโลก น้ำใสหาดทรายขาว",
      image: similanBg,
      duration: "ทริป 1 วัน",
      price: "฿3,500",
    },
    {
      id: 2,
      name: "เขาสก",
      description: "นอนแพพักผ่อน ท่ามกลางป่าฝนอันอุดมสมบูรณ์",
      image: khaoSokBg,
      duration: "3 วัน / 2 คืน",
      price: "฿8,900",
    },
  ]

  const testimonials = [
    {
      id: 1,
      name: "ยศธร รัตนาประสิทธิ์",
      content: "จองง่ายมาก แอปช่วยวางแผนทริปได้แบบไม่ต้องกังวลเลย แนะนำแพ็กเกจเขาสกมาก ๆ",
    },
    {
      id: 2,
      name: "จันทรวิมล พงษ์ธนาพัฒน์",
      content: "แนะนำเลยสำหรับครอบครัว เด็ก ๆ ชอบกิจกรรมที่ภูเก็ตมาก ปีหน้ามาจองซ้ำแน่นอน!",
    },
  ]

  return (
    <div className="min-h-screen bg-[#F6F1E9]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/src/assets/Rectangle.png" alt="Thai Tours" className="h-12 w-auto" />
              <span className="text-xl font-bold text-[#4F200D]">Thai Tours</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="font-medium text-[#FF8400]">Home</a>
              <a href="#" className="font-medium text-[#4F200D] hover:text-[#FF8400]">Tours</a>
              <a href="#" className="font-medium text-[#4F200D] hover:text-[#FF8400]">About Us</a>
              <a href="#" className="font-medium text-[#4F200D] hover:text-[#FF8400]">Contact</a>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Button>
              <Button className="hidden md:inline-flex rounded-full bg-[#FF8400] text-white hover:bg-[#FF8400]/90">
                เริ่มต้นเดินทาง
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Thailand Tourism" className="h-full w-full object-cover" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            ไม่ว่าจุดหมายคือที่ใด
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 drop-shadow-md max-w-2xl mx-auto">
            เราพร้อมพาคุณไปส่งถึงที่ เที่ยวอย่างมั่นใจไปกับเรา
          </p>
          <Button size="lg" className="rounded-full bg-[#FF8400] text-white hover:bg-[#FF8400]/90 px-8 py-6 text-lg">
            สำรวจทัวร์ทั้งหมด
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-[#FF8400] text-white">จุดเด่นของเรา</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-[#4F200D]">
              ทำไมต้องเลือกเรา?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-[#FF8400]/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-[#FF8400]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="text-[#4F200D]">มั่นใจได้ 100%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">บริการรับประกันคุณภาพ พร้อมทีมงานมืออาชีพคอยดูแลตลอดการเดินทาง</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-[#FF8400]/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-[#FF8400]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="text-[#4F200D]">ประหยัดเวลา</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">จองง่ายในแอปเดียว ไม่ต้องติดต่อหลายที่ จบในที่เดียว</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-[#FF8400]/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-[#FF8400]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <CardTitle className="text-[#4F200D]">ประทับใจ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">สร้างความทรงจำที่ดี ด้วยประสบการณ์การท่องเที่ยวที่พิเศษ</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-[#FF8400] text-white">หมวดหมู่ยอดนิยม</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-[#4F200D] mb-4">
              พิกัดเที่ยวไทยที่ใครก็พูดถึง
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              คัดสรรแลนด์มาร์กสุดฮิต ถ่ายรูปสวย ทันกระแสก่อนใคร
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {destinations.map((dest) => (
              <Card key={dest.id} className="overflow-hidden border-0 shadow-xl">
                <div className="relative h-64">
                  <img src={dest.image} alt={dest.name} className="h-full w-full object-cover" />
                  <Badge className="absolute top-4 right-4 bg-white text-[#4F200D]">
                    {dest.duration}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl text-[#4F200D]">{dest.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{dest.description}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#FF8400]">{dest.price}</span>
                  <Button className="rounded-full bg-[#FF8400] text-white hover:bg-[#FF8400]/90">
                    จองเลย
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="rounded-full border-[#4F200D] text-[#4F200D] hover:bg-[#4F200D] hover:text-white">
              ดูทัวร์ทั้งหมด
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-[#FF8400] text-white">รีวิวจากลูกค้า</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-[#4F200D]">
              เสียงความประทับใจ<br className="md:hidden" />
              <span className="text-[#FF8400]">จากนักเดินทาง</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-0 shadow-lg bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-[#F6F1E9] flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#4F200D]">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-[#4F200D]">{testimonial.name}</p>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 fill-[#FFD93D]">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-[#4F200D] to-[#8B4513] text-white">
            <CardContent className="py-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                พร้อมเริ่มต้นการเดินทางหรือยัง?
              </h2>
              <p className="text-lg mb-8 text-white/80 max-w-2xl mx-auto">
                สมัครรับข่าวสารเพื่อไม่พลาดข้อมูลอัปเดตและข้อเสนอสุดพิเศษ
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  placeholder="กรอกอีเมลของคุณ"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-full"
                />
                <Button className="rounded-full bg-[#FF8400] text-white hover:bg-[#FF8400]/90 px-8">
                  สมัคร
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4F200D] text-white py-16 rounded-t-[60px]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/src/assets/Rectangle.png" alt="Thai Tours" className="h-10 w-auto" />
                <span className="text-lg font-bold">Thai Tours</span>
              </div>
              <p className="text-white/80 text-sm">
                เที่ยวอย่างมั่นใจไปกับเรา สร้างความทรงจำที่ประทับใจมิรู้ลืม ด้วยบริการระดับพรีเมียม
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">ข้อมูลองค์กร</h3>
              <ul className="space-y-2 text-white/80">
                <li><a href="#" className="hover:text-white">เกี่ยวกับเรา</a></li>
                <li><a href="#" className="hover:text-white">สถานที่ท่องเที่ยว</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-white/80">
                <li><a href="#" className="hover:text-white">ศูนย์ช่วยเหลือ</a></li>
                <li><a href="#" className="hover:text-white">เงื่อนไขการให้บริการ</a></li>
                <li><a href="#" className="hover:text-white">นโยบายความเป็นส่วนตัว</a></li>
                <li><a href="#" className="hover:text-white">ติดต่อเรา</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">ติดตามข่าวสาร</h3>
              <p className="text-white/80 text-sm mb-4">
                สมัครรับข่าวสารเพื่อไม่พลาดข้อมูลอัปเดตและข้อเสนอสุดพิเศษ
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-white/60 text-sm">
            <p>© 2026 Thai Tours Service All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
