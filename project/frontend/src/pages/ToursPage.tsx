import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ToursPage() {
  const [tours, setTours] = useState([]);

  useEffect(() => {
    // ดึงข้อมูลจาก Backend ที่คุณรันอยู่ที่พอร์ต 3000
    fetch("http://localhost:3000/tours")
      .then((res) => res.json())
      .then((data) => setTours(data));
  }, []);

  return (
    <div className="p-8 bg-[#F6F1E9] min-h-screen">
      <Link to="/" className="text-[#4F200D] mb-4 inline-block">← กลับหน้าหลัก</Link>
      <h1 className="text-3xl font-bold text-[#4F200D] mb-8">แพ็กเกจทัวร์ทั้งหมด</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tours.map((tour: any) => (
          <div key={tour.id} className="bg-white rounded-2xl overflow-hidden shadow-md">
            <img src={tour.image_cover} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-bold text-lg">{tour.title}</h3>
              <p className="text-orange-500 font-bold">฿{tour.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}