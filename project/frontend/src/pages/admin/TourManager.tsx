import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, RefreshCw } from 'lucide-react';

interface Tour {
  id: string;
  title: string;
  region: string;
  base_price: number;
}

export default function TourManager() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. ฟังก์ชันดึงข้อมูล (Read)
  const fetchTours = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/tours');
      setTours(response.data);
    } catch (error) {
      console.error("Error fetching tours:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. ฟังก์ชันลบข้อมูล (Delete)
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this tour?")) return;
    try {
      await axios.delete(`http://localhost:3000/tours/${id}`);
      fetchTours(); // โหลดข้อมูลใหม่หลังจากลบ
    } catch (error) {
      alert("Failed to delete tour");
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Tour Management</h2>
        <div className="flex gap-2">
          <Button onClick={fetchTours} variant="outline"><RefreshCw size={16} className="mr-2"/> Refresh</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus size={16} className="mr-2"/> Add New Tour
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-medium">Tour Name</th>
                <th className="p-4 font-medium">Region</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tours.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium">{tour.title}</td>
                  <td className="p-4 text-gray-600">{tour.region}</td>
                  <td className="p-4">฿{Number(tour.base_price).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <Button 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(tour.id)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tours.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500">No tours found. Start by adding one!</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}