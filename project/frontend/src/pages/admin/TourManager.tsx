import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, MapPin } from 'lucide-react';

export default function TourManager() {
  const [tours, setTours] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Simple Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    max_people: '',
    location: '',
    image_url: '' // Simple URL input for now
  });

  const fetchTours = () => {
    axios.get('http://localhost:3000/api/v1/tours')
      .then(res => setTours(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchTours(); }, []);

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this tour?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/v1/tours/${id}`);
      fetchTours();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/v1/tours', {
        ...formData,
        price: Number(formData.price),
        max_people: Number(formData.max_people)
      });
      setIsCreating(false);
      fetchTours();
      // Reset form
      setFormData({ title: '', description: '', price: '', duration: '', max_people: '', location: '', image_url: '' });
    } catch (err) {
      alert("Failed to create tour");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Manage Tours</h2>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus size={16} className="mr-2"/> Add New Tour
        </Button>
      </div>

      {isCreating && (
        <Card className="bg-blue-50 p-6 border-blue-100">
            <h3 className="font-bold mb-4 text-blue-800">Create New Tour</h3>
            <form onSubmit={handleCreate} className="grid gap-4 grid-cols-2">
                <Input placeholder="Tour Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                <Input placeholder="Location (e.g. Phuket)" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
                <Input placeholder="Price (THB)" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                <Input placeholder="Duration (e.g. 3 Days)" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required />
                <Input placeholder="Max People" type="number" value={formData.max_people} onChange={e => setFormData({...formData, max_people: e.target.value})} required />
                <Input placeholder="Image URL (http://...)" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                <Input placeholder="Description" className="col-span-2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                <Button type="submit" className="col-span-2 bg-blue-600 hover:bg-blue-700">Save Tour</Button>
            </form>
        </Card>
      )}

      <div className="grid gap-4">
        {tours.map((tour: any) => (
          <Card key={tour.id}>
            <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-md overflow-hidden">
                        {tour.image_url && <img src={tour.image_url} className="object-cover h-full w-full" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{tour.title}</h3>
                        <p className="text-gray-500 text-sm flex items-center">
                            <MapPin size={14} className="mr-1"/> {tour.location} • ฿{tour.price} • {tour.duration}
                        </p>
                    </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(tour.id)}>
                    <Trash2 size={16}/>
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}