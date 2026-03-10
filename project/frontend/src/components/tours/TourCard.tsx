import { Link } from "react-router-dom";
import { Star, Clock, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Tour {
  id: number | string;
  title: string;
  image_cover?: string;
  province?: string;
  price: string | number;
  duration?: string;
  category?: string;
  rating?: string | number;
  region?: string;
}

interface TourCardProps {
  tour: Tour;
  getImageUrl: (path?: string) => string;
  translateDuration: (duration?: string) => string;
  translateLocation: (location?: string) => string;
}

export function TourCard({ tour, getImageUrl, translateDuration, translateLocation }: TourCardProps) {
  return (
    <Link to={`/tours/${tour.id}`} key={tour.id} className="block h-full group">
      <Card className="rounded-[1.2rem] md:rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white h-full flex flex-col">
        <div className="relative h-32 sm:h-48 md:h-56 shrink-0 overflow-hidden bg-gray-100 p-1.5 md:p-2">
          <img
            src={getImageUrl(tour.image_cover)}
            className="w-full h-full object-cover rounded-[1rem] md:rounded-[1.5rem] group-hover:scale-105 transition-transform duration-500"
            alt={tour.title}
          />
          <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 px-1.5 py-0.5 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-black text-[#FF8400] shadow-sm flex items-center gap-0.5">
            <Star size={10} fill="#FF8400" stroke="#FF8400" className="md:w-[12px]" /> {tour.rating || "ใหม่"}
          </div>
          {tour.duration && (
            <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-white/90 px-1.5 py-0.5 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold text-[#4F200D] shadow-sm flex items-center gap-0.5">
              <Clock size={10} className="md:w-[12px]" /> {translateDuration(tour.duration)}
            </div>
          )}
        </div>

        <CardContent className="p-3 md:p-6 flex flex-col flex-grow">
          <h3 className="text-sm md:text-xl font-black mb-1 leading-tight text-[#2D3748] group-hover:text-[#FF8400] transition-colors line-clamp-2">
            {tour.title}
          </h3>
          <p className="text-[10px] md:text-sm text-gray-400 mb-2 md:mb-6 line-clamp-1">
            {translateLocation(tour.province)}
          </p>
          <div className="mt-auto pt-2 md:pt-4 border-t border-gray-100 flex justify-between items-end">
            <div>
              <span className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider block">เริ่ม</span>
              <div className="text-sm md:text-2xl font-black text-[#FF8400]">
                ฿{Number(tour.price).toLocaleString()}
              </div>
            </div>
            <div className="w-6 h-6 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#FF8400] text-white shadow-md">
              <Plus size={14} strokeWidth={3} className="md:w-[20px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
