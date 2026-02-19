import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Pencil, Trash2, MapPin, Calendar, Users, AlertCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// --- Types (Matched to your Backend Entity & DTO) ---

export enum TourCategory {
  SEA = 'Sea',
  MOUNTAIN = 'Mountain',
  CULTURAL = 'Cultural',
  NATURE = 'Nature',
  CITY = 'City',
  ADVENTURE = 'Adventure',
}

export enum TourRegion {
  NORTH = 'North',
  SOUTH = 'South',
  CENTRAL = 'Central',
  EAST = 'East',
  WEST = 'West',
  NORTHEAST = 'Northeast',
}

export interface Tour {
  id: string;
  title: string;
  price: number;
  province: string;
  duration: string;
  category: TourCategory;
  region: TourRegion;
  is_active: boolean;
  image_cover?: string;
  description?: string;
}

// Initial Form State
const initialFormState = {
  title: '',
  price: '',
  province: '',
  region: TourRegion.CENTRAL,
  duration: '',
  category: TourCategory.NATURE,
  description: '',
  image_cover: '',
  is_active: true,
};

const API_URL = 'http://localhost:3000/api/v1/tours';

const TourManager = () => {
  // --- State ---
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // Track if editing
  const [formData, setFormData] = useState(initialFormState);

  // --- Fetch Data ---
  const fetchTours = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch tours');
      const data = await response.json();
      setTours(data);
    } catch (err) {
      console.error(err);
      setError("Could not load tours.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  // --- Handlers ---
  
  const handleAddNew = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleEdit = (tour: Tour) => {
    setEditingId(tour.id);
    setFormData({
      title: tour.title,
      price: tour.price.toString(),
      province: tour.province,
      region: tour.region,
      duration: tour.duration,
      category: tour.category,
      description: tour.description || '',
      image_cover: tour.image_cover || '',
      is_active: tour.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      ...formData,
      price: Number(formData.price),
      // Default fields if missing
      rating: 0,
      review_count: 0,
    };

    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save tour');
      }

      await fetchTours();
      setIsModalOpen(false);
      setFormData(initialFormState);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setTours(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert('Failed to delete tour');
    }
  };

  // --- Filtering & Pagination ---
  const filteredTours = tours.filter((tour) => {
    const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = tour.is_active === true;
    if (statusFilter === 'inactive') matchesStatus = tour.is_active === false;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
  const paginatedTours = filteredTours.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="relative space-y-6 p-6 bg-gray-50 min-h-screen font-sans">
      
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tour Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your tours, track availability, and update details.</p>
        </div>
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-all"
          onClick={handleAddNew}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Tour
        </Button>
      </div>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Tours</p>
            <p className="text-2xl font-bold text-gray-900">{tours.length}</p>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><MapPin className="w-5 h-5" /></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
           <div>
            <p className="text-sm font-medium text-gray-500">Active Tours</p>
            <p className="text-2xl font-bold text-green-600">{tours.filter(t => t.is_active).length}</p>
          </div>
           <div className="p-2 bg-green-50 rounded-lg text-green-600"><Calendar className="w-5 h-5" /></div>
        </div>
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
           <div>
            <p className="text-sm font-medium text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-gray-900">{new Set(tours.map(t => t.category)).size}</p>
          </div>
           <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Users className="w-5 h-5" /></div>
        </div>
      </div>

      {/* --- Filters --- */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search tours..." 
            className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors focus:ring-orange-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <select 
              className="text-sm border-none bg-transparent focus:ring-0 text-gray-600 font-medium cursor-pointer focus:outline-none hover:text-orange-600 transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
        </div>
      </div>

      {/* --- Data Table --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Tour Name</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Price</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Region</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Duration</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Category</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading tours...</td></tr>
              ) : paginatedTours.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No tours found.</td></tr>
              ) : (
                paginatedTours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-orange-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                           <img 
                             src={tour.image_cover || "https://via.placeholder.com/100"} 
                             alt="" 
                             className="w-full h-full object-cover" 
                             onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/100?text=No+Img"; }}
                           />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tour.title}</p>
                          <p className="text-xs text-gray-500">{tour.province}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">฿{Number(tour.price).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{tour.region}</td>
                    <td className="px-6 py-4 text-gray-600">{tour.duration}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{tour.category}</td>
                    <td className="px-6 py-4">
                      <Badge className={`${tour.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} border-0 shadow-none`}>
                        {tour.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:text-orange-600 hover:bg-orange-100"
                          onClick={() => handleEdit(tour)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:text-red-600 hover:bg-red-100" 
                          onClick={() => handleDelete(tour.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* --- Pagination --- */}
         <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
           <p className="text-sm text-gray-500">
             Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredTours.length)}</span> of <span className="font-medium">{filteredTours.length}</span> results
           </p>
           <div className="flex gap-2">
             <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
              >
                Previous
             </Button>
             <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
              >
                Next
             </Button>
           </div>
        </div>
      </div>

      {/* --- ADD / EDIT TOUR MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Tour' : 'Add New Tour'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Tour Title *</label>
                <Input 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. Amazing Sea Trip"
                  className="focus:ring-orange-500 focus:border-orange-500" 
                />
              </div>

              {/* Price & Duration Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Price (฿) *</label>
                  <Input type="number" required min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" className="focus:ring-orange-500" />
                </div>
                <div className="space-y-1">
                   <label className="text-sm font-medium text-gray-700">Duration *</label>
                   <Input required value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 3 Days 2 Nights" className="focus:ring-orange-500" />
                </div>
              </div>

              {/* Region & Province Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-sm font-medium text-gray-700">Region *</label>
                   <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      value={formData.region}
                      onChange={e => setFormData({...formData, region: e.target.value as TourRegion})}
                   >
                     {Object.values(TourRegion).map(r => (
                       <option key={r} value={r}>{r}</option>
                     ))}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-sm font-medium text-gray-700">Province *</label>
                   <Input required value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} placeholder="e.g. Phuket" className="focus:ring-orange-500" />
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-sm font-medium text-gray-700">Category *</label>
                   <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value as TourCategory})}
                   >
                     {Object.values(TourCategory).map(c => (
                       <option key={c} value={c}>{c}</option>
                     ))}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-sm font-medium text-gray-700">Status</label>
                   <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      value={formData.is_active ? 'active' : 'inactive'}
                      onChange={e => setFormData({...formData, is_active: e.target.value === 'active'})}
                   >
                     <option value="active">Active</option>
                     <option value="inactive">Inactive</option>
                   </select>
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Cover Image URL</label>
                <Input value={formData.image_cover} onChange={e => setFormData({...formData, image_cover: e.target.value})} placeholder="https://..." className="focus:ring-orange-500" />
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="hover:bg-orange-50 hover:text-orange-600">Cancel</Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : (editingId ? 'Update Tour' : 'Create Tour')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TourManager;