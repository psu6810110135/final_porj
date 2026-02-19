import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, MapPin, Image as ImageIcon } from 'lucide-react';

// Define Enums to match Backend
const REGIONS = ['North', 'South', 'Central', 'East', 'West', 'Northeast'];
const CATEGORIES = ['Sea', 'Mountain', 'Cultural', 'Nature', 'City', 'Adventure'];

export default function TourManager() {
  const [tours, setTours] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State matches CreateTourDto
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    province: '', // Was 'location'
    region: 'Central', // Default
    category: 'Nature', // Default
    duration: '',
    image_cover: '' // Was 'image_url'
  });

  const fetchTours = () => {
    axios.get('http://localhost:3000/api/v1/tours')
      .then(res => setTours(res.data))
      .catch(err => console.error("Error fetching tours:", err));
  };

  useEffect(() => { fetchTours(); }, []);

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this tour?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/v1/tours/${id}`);
      fetchTours();
    } catch (err) {
      alert("Failed to delete tour");
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Prepare payload matches backend DTO
      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        province: formData.province,
        region: formData.region,
        category: formData.category,
        duration: formData.duration,
        image_cover: formData.image_cover,
      };

      console.log("Sending Payload:", payload); // Debugging

      await axios.post('http://localhost:3000/api/v1/tours', payload);
      
      setIsCreating(false);
      fetchTours();
      // Reset form
      setFormData({ 
        title: '', 
        description: '', 
        price: '', 
        province: '', 
        region: 'Central', 
        category: 'Nature', 
        duration: '', 
        image_cover: '' 
      });
      alert("Tour created successfully!");
    } catch (err: any) {
      console.error("Error creating tour:", err.response?.data || err);
      alert(`Failed to create tour: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Tour Management</h2>
        <Button onClick={() => setIsCreating(!isCreating)} className={isCreating ? "bg-red-500 hover:bg-red-600" : ""}>
          {isCreating ? "Cancel" : <><Plus size={16} className="mr-2"/> Add New Tour</>}
        </Button>
      </div>

      {/* CREATE FORM */}
      {isCreating && (
        <Card className="bg-white shadow-lg border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-700">Create New Tour Package</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  
                  {/* Title */}
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1 block">Tour Title</label>
                    <Input 
                      placeholder="e.g. Grand Palace Tour" 
                      value={formData.title} 
                      onChange={e => handleChange('title', e.target.value)} 
                      required 
                    />
                  </div>

                  {/* Province */}
                  <div>
                    <label className="text-sm font-medium mb-1 block">Province</label>
                    <Input 
                      placeholder="e.g. Bangkok" 
                      value={formData.province} 
                      onChange={e => handleChange('province', e.target.value)} 
                      required 
                    />
                  </div>

                  {/* Region (Dropdown) */}
                  <div>
                    <label className="text-sm font-medium mb-1 block">Region</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={formData.region}
                      onChange={e => handleChange('region', e.target.value)}
                    >
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  {/* Category (Dropdown) */}
                  <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={formData.category}
                      onChange={e => handleChange('category', e.target.value)}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-sm font-medium mb-1 block">Price (THB)</label>
                    <Input 
                      placeholder="0.00" 
                      type="number" 
                      min="0"
                      value={formData.price} 
                      onChange={e => handleChange('price', e.target.value)} 
                      required 
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-sm font-medium mb-1 block">Duration</label>
                    <Input 
                      placeholder="e.g. 3 Days 2 Nights" 
                      value={formData.duration} 
                      onChange={e => handleChange('duration', e.target.value)} 
                      required 
                    />
                  </div>

                  {/* Image URL */}
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1 block">Cover Image URL</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://..." 
                        value={formData.image_cover} 
                        onChange={e => handleChange('image_cover', e.target.value)} 
                      />
                      {formData.image_cover && (
                        <div className="w-16 h-10 rounded overflow-hidden bg-gray-100 border">
                          <img src={formData.image_cover} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Describe the tour details..." 
                      value={formData.description} 
                      onChange={e => handleChange('description', e.target.value)} 
                    />
                  </div>

                  <Button type="submit" className="col-span-2 bg-blue-600 hover:bg-blue-700 h-12 text-lg" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Create Tour"}
                  </Button>
              </form>
            </CardContent>
        </Card>
      )}

      {/* LIST TOURS */}
      <div className="grid gap-4">
        {tours.map((tour: any) => (
          <Card key={tour.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-4">
                    {/* Image Thumbnail */}
                    <div className="h-20 w-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border">
                        {tour.image_cover ? (
                          <img src={tour.image_cover} className="object-cover h-full w-full" alt={tour.title} />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <ImageIcon size={24} />
                          </div>
                        )}
                    </div>
                    
                    {/* Info */}
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{tour.title}</h3>
                        <div className="text-sm text-gray-500 space-y-1 mt-1">
                           <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-blue-500"/> 
                              <span>{tour.province} ({tour.region})</span>
                           </div>
                           <div className="flex gap-3">
                              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                                {tour.category}
                              </span>
                              <span className="font-semibold text-gray-700">฿{Number(tour.price).toLocaleString()}</span>
                              <span>• {tour.duration}</span>
                           </div>
                        </div>
                    </div>
                </div>
                
                {/* Actions */}
                <Button 
                  variant="outline" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200" 
                  size="sm" 
                  onClick={() => handleDelete(tour.id)}
                >
                    <Trash2 size={16} className="mr-2"/> Delete
                </Button>
            </CardContent>
          </Card>
        ))}

        {tours.length === 0 && (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
            No tours available. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
}