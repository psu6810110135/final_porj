import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Calendar, Users, Star, ChevronRight, Sparkles } from "lucide-react"

export default function HomePage() {
  const featuredTours = [
    {
      id: 1,
      title: "Chiang Mai Ancient Temple Tour",
      location: "เชียงใหม่",
      rating: 4.9,
      reviews: 128,
      price: 2500,
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop",
      duration: "3 วัน 2 คืน"
    },
    {
      id: 2,
      title: "Phuket Beach Paradise",
      location: "ภูเก็ต",
      rating: 4.8,
      reviews: 256,
      price: 4500,
      image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&h=300&fit=crop",
      duration: "4 วัน 3 คืน"
    },
    {
      id: 3,
      title: "Bangkok City Exploration",
      location: "กรุงเทพฯ",
      rating: 4.7,
      reviews: 312,
      price: 1800,
      image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&h=300&fit=crop",
      duration: "2 วัน 1 คืน"
    },
    {
      id: 4,
      title: "Ayutthaya Heritage Trip",
      location: "พระนครศรีอยุธยา",
      rating: 4.9,
      reviews: 189,
      price: 1500,
      image: "https://images.unsplash.com/photo-1588442573738-d1e87caa5272?w=400&h=300&fit=crop",
      duration: "1 วัน"
    }
  ]

  const regions = [
    { name: "ภาคเหนือ", icon: "🏔️", count: 45 },
    { name: "ภาคใต้", icon: "🏖️", count: 38 },
    { name: "ภาคกลาง", icon: "🏛️", count: 52 },
    { name: "ภาคตะวันออก", icon: "🌊", count: 28 },
    { name: "ภาคตะวันตก", icon: "🌅", count: 22 },
    { name: "ภาคอีสาน", icon: "🏺", count: 35 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-cover bg-center" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1920&h=600&fit=crop')"
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-sky-900/80 to-sky-700/60" />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <span className="text-sm font-medium">Thai Tour - เที่ยวไทยไปกับเรา</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">เราพร้อมพาคุณไปส่งถึงที่</h1>
            <p className="text-xl mb-8 text-sky-100">ไม่ว่าจุดหมายคือที่ใด... เราพร้อมพาคุณไปให้ถึง</p>
          </div>
        </div>

        {/* Search Card */}
        <Card className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl shadow-2xl">
          <CardContent className="p-6">
            <Tabs defaultValue="tours" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                <TabsTrigger value="tours">ทัวร์ท่องเที่ยว</TabsTrigger>
                <TabsTrigger value="hotels">ที่พัก</TabsTrigger>
                <TabsTrigger value="packages">แพ็กเกจ</TabsTrigger>
              </TabsList>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    จุดหมายปลายทาง
                  </label>
                  <Input placeholder="ค้นหาสถานที่..." className="w-full" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    วันที่เดินทาง
                  </label>
                  <Input type="date" className="w-full" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    จำนวนผู้เดินทาง
                  </label>
                  <Input type="number" placeholder="2 คน" min="1" className="w-full" />
                </div>
                <div className="flex items-end">
                  <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white h-12">
                    <Search className="w-4 h-4 mr-2" />
                    ค้นหา
                  </Button>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      {/* Content Section - with top margin for search card */}
      <section className="container mx-auto px-4 pt-32 pb-16">
        {/* Regions Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">สำรวจตามภูมิภาค</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {regions.map((region) => (
              <Card key={region.name} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{region.icon}</div>
                  <h3 className="font-semibold text-gray-800">{region.name}</h3>
                  <p className="text-sm text-gray-500">{region.count} ทัวร์</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Tours Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">ทัวร์แนะนำประจำเดือนนี้</h2>
            <Button variant="ghost" className="text-sky-600">
              ดูทั้งหมด
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTours.map((tour) => (
              <Card key={tour.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-white/90 text-sky-700 hover:bg-white">
                    {tour.duration}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4 mr-1 text-sky-600" />
                    {tour.location}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{tour.title}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-800">{tour.rating}</span>
                    <span className="text-sm text-gray-500">({tour.reviews} รีวิว)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500">เริ่มต้น</span>
                      <p className="text-lg font-bold text-sky-600">฿{tour.price.toLocaleString()}</p>
                    </div>
                    <Button size="sm" className="bg-sky-600 hover:bg-sky-700">
                      ดูรายละเอียด
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="bg-gradient-to-r from-sky-600 to-sky-700 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 class="text-3xl font-bold mb-4">พิเศษ! ลดทันที 15% สำหรับการจองครั้งแรก</h2>
          <p className="text-sky-100 mb-6">สมัครสมาชิกวันนี้ รับสิทธิพิเศษมากมาย</p>
          <Button size="lg" className="bg-white text-sky-600 hover:bg-sky-50">
            สมัครสมาชิกฟรี
          </Button>
        </div>
      </section>
    </div>
  )
}
