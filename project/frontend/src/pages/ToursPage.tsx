import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function ToursPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  // Get filter values from URL
  const regionFilter = searchParams.get("region") || "";
  const categoryFilter = searchParams.get("category") || "";
  const durationFilter = searchParams.get("duration") || "";

  useEffect(() => {
    setLoading(true);
    // Build query string with filters
    const params = new URLSearchParams();
    
    if (regionFilter) params.append("region", regionFilter);
    if (categoryFilter) params.append("category", categoryFilter);
    if (durationFilter) params.append("duration", durationFilter);

    const queryString = params.toString();
    const url = `http://localhost:3000/api/v1/tours${queryString ? `?${queryString}` : ""}`;

    console.log("Fetching URL:", url);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
            setTours(data);
        } else {
            setTours([]); 
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setTours([]);
        setLoading(false);
      });
  }, [regionFilter, categoryFilter, durationFilter]);

  // Helper to toggle filters (Single select per category)
  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    
    // If clicking the same item, uncheck it. Otherwise, select it (replace old value).
    if (newParams.get(key) === value) {
        newParams.delete(key);
    } else {
        newParams.set(key, value);
    }
    
    setSearchParams(newParams);
  };

  return (
    <div className="bg-[#F6F1E9] min-h-screen p-4 md:p-10 font-sans text-[#4F200D]">
      <div className="max-w-[1400px] mx-auto">
        {/* --- Header / Back Button --- */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"
          >
            <span>←</span> กลับหน้าหลัก
          </Link>
        </div>

        <h1 className="text-4xl font-black text-center mb-12">
          ทุกจุดหมาย มั่นใจไปกับเรา
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* --- Sidebar Filters --- */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm sticky top-10 border border-orange-50 space-y-8">
              
              {/* 1. Duration Filter */}
              <div>
                <h3 className="font-extrabold text-xl mb-4">ระยะเวลา</h3>
                <div className="space-y-3">
                  {["1 Day", "2 Days", "3 Days"].map((label) => (
                    <label key={label} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={durationFilter === label}
                        onChange={() => handleFilterChange("duration", label)}
                        className="w-5 h-5 accent-[#FF8400] rounded-lg"
                      />
                      <span className={`text-sm group-hover:text-[#FF8400] transition-colors ${durationFilter === label ? "font-bold text-[#FF8400]" : "font-medium"}`}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6"></div>

              {/* 2. Region Filter (Updated with West & Northeast) */}
              <div>
                <h3 className="font-extrabold text-xl mb-4">ภูมิภาค (Region)</h3>
                <div className="space-y-3">
                  {[
                    { label: "ภาคเหนือ (North)", value: "North" },
                    { label: "ภาคกลาง (Central)", value: "Central" },
                    { label: "ภาคอีสาน (Northeast)", value: "Northeast" },
                    { label: "ภาคตะวันตก (West)", value: "West" },
                    { label: "ภาคตะวันออก (East)", value: "East" },
                    { label: "ภาคใต้ (South)", value: "South" },
                  ].map((zone) => (
                    <label key={zone.value} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={regionFilter === zone.value}
                        onChange={() => handleFilterChange("region", zone.value)}
                        className="w-5 h-5 accent-[#FF8400] rounded-lg"
                      />
                      <span className={`text-sm group-hover:text-[#FF8400] transition-colors ${regionFilter === zone.value ? "font-bold text-[#FF8400]" : "font-medium"}`}>
                        {zone.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6"></div>

              {/* 3. Category Filter (New) */}
              <div>
                <h3 className="font-extrabold text-xl mb-4">ประเภททัวร์</h3>
                <div className="space-y-3">
                  {[
                    { label: "ทะเล (Sea)", value: "Sea" },
                    { label: "ภูเขา (Mountain)", value: "Mountain" },
                    { label: "ธรรมชาติ (Nature)", value: "Nature" },
                    { label: "วัฒนธรรม (Cultural)", value: "Cultural" },
                    { label: "ในเมือง (City)", value: "City" },
                    { label: "ผจญภัย (Adventure)", value: "Adventure" },
                  ].map((cat) => (
                    <label key={cat.value} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={categoryFilter === cat.value}
                        onChange={() => handleFilterChange("category", cat.value)}
                        className="w-5 h-5 accent-[#FF8400] rounded-lg"
                      />
                      <span className={`text-sm group-hover:text-[#FF8400] transition-colors ${categoryFilter === cat.value ? "font-bold text-[#FF8400]" : "font-medium"}`}>
                        {cat.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* --- Main Content (Tour Cards) --- */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8400] mx-auto mb-4"></div>
                  <p className="text-[#4F200D]/60">กำลังโหลด...</p>
                </div>
              </div>
            ) : tours.length === 0 ? (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-[#4F200D]/10 rounded-[2.5rem]">
                <div className="text-center">
                  <p className="text-xl text-[#4F200D]/80 mb-2 font-bold">
                    ไม่พบทัวร์ที่ตรงกับเงื่อนไข
                  </p>
                  <p className="text-sm text-[#4F200D]/60">
                    ลองเปลี่ยนตัวกรอง หรือ เพิ่มข้อมูลทัวร์ในหน้า Admin
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tours.map((tour: any) => (
                  <div
                    key={tour.id}
                    className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col h-full hover:shadow-xl transition-all group duration-300"
                  >
                    <div className="relative h-52 shrink-0 overflow-hidden">
                      <img
                        src={
                          tour.image_cover && tour.image_cover.startsWith('http') 
                            ? tour.image_cover 
                            : "https://via.placeholder.com/400x300?text=No+Image"
                        }
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={tour.title}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+Error";
                        }}
                      />
                      <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-[#FF8400] shadow-sm">
                        ★ {tour.rating || "New"}
                      </div>
                      <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm">
                        {tour.category}
                      </div>
                    </div>

                    <div className="p-7 flex flex-col flex-grow">
                      <h3 className="text-2xl font-black mb-1 leading-tight text-gray-800">{tour.title}</h3>
                      <p className="text-sm text-gray-400 mb-6 line-clamp-1 flex items-center gap-1">
                        📍 {tour.province || "Thailand"} ({tour.region})
                      </p>

                      <div className="mt-auto pt-5 border-t border-gray-100 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            ราคาเริ่มต้น
                          </span>
                          <div className="text-2xl font-black text-[#FF8400]">
                            ฿{Number(tour.price).toLocaleString()}
                          </div>
                        </div>
                        <button className="bg-[#F6F1E9] text-[#4F200D] w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#FF8400] hover:text-white transition-all shadow-sm">
                          <span className="text-xl font-bold">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}