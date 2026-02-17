import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, RefreshCw, X } from 'lucide-react';

// Define the interface
interface Tour {
  id: string;
  title: string;
  region: string;
  base_price: number;
  max_capacity: number;
}

export default function TourManager() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    region: 'Central',
    category: 'Nature',
    base_price: 0,
    max_capacity: 10
  });

  const fetchTours = async () => {
    try {
      // Updated URL to match the new controller path
      const response = await axios.get('http://localhost:3000/api/v1/tours');
      setTours(response.data);
    } catch (error) {
      console.error("Error fetching tours:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this tour?")) return;
    await axios.delete(`http://localhost:3000/api/v1/tours/${id}`);
    fetchTours();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/v1/tours', formData);
      setShowForm(false);
      fetchTours(); // Refresh list
      // Reset form
      setFormData({ title: '', region: 'Central', category: 'Nature', base_price: 0, max_capacity: 10 });
    } catch (error) {
      alert("Error creating tour");
    }
  };

  useEffect(() => { fetchTours(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Tour Management</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600">
          {showForm ? <><X className="mr-2"/> Cancel</> : <><Plus className="mr-2"/> Add New Tour</>}
        </Button>
      </div>

      {/* Simple Create Form */}
      {showForm && (
        <Card className="bg-blue-50 p-4 border-blue-200">
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
            <Input 
              placeholder="Tour Title" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
            <Input 
              placeholder="Region (e.g., North)" 
              value={formData.region}
              onChange={e => setFormData({...formData, region: e.target.value})}
              required
            />
             <Input 
              type="number" 
              placeholder="Price" 
              value={formData.base_price}
              onChange={e => setFormData({...formData, base_price: +e.target.value})}
              required
            />
             <Input 
              type="number" 
              placeholder="Max Capacity" 
              value={formData.max_capacity}
              onChange={e => setFormData({...formData, max_capacity: +e.target.value})}
              required
            />
            <Button type="submit" className="md:col-span-2">Save Tour</Button>
          </form>
        </Card>
      )}

      {/* Tour List */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Tour Name</th>
                <th className="p-4">Region</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tours.map((tour) => (
                <tr key={tour.id}>
                  <td className="p-4">{tour.title}</td>
                  <td className="p-4 text-gray-600">{tour.region}</td>
                  <td className="p-4">฿{Number(tour.base_price).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" className="text-red-500" onClick={() => handleDelete(tour.id)}>
                      <Trash2 size={18} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}