import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  Users,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/* ─── Auth Helper ────────────────────────────────── */
const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("jwt_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ─── Enums & Types ──────────────────────────────── */
export const TourCategory = {
  SEA: "Sea",
  MOUNTAIN: "Mountain",
  CULTURAL: "Cultural",
  NATURE: "Nature",
  CITY: "City",
  ADVENTURE: "Adventure",
};

export const TourRegion = {
  NORTH: "North",
  SOUTH: "South",
  CENTRAL: "Central",
  EAST: "East",
  WEST: "West",
  NORTHEAST: "Northeast",
};

export interface Tour {
  id: string;
  title: string;
  price: number;
  child_price?: number;
  province: string;
  duration: string;
  category: string;
  region: string;
  is_active: boolean;
  image_cover?: string;
  images?: string[];
  description?: string;
  max_group_size?: number;
  rating?: number;
  review_count?: number;
  highlights?: string[];
  preparation?: string[];
  itinerary?: string;
  itinerary_data?: { time: string; detail: string }[];
  included?: string;
  excluded?: string;
  conditions?: string;
}

/* ─── Initial Form State ─────────────────────────── */
const initialFormState = {
  title: "",
  price: "",
  child_price: "",
  province: "",
  region: TourRegion.CENTRAL,
  duration: "",
  category: TourCategory.NATURE,
  description: "",
  image_cover: "",
  images_str: "",
  is_active: true,
  max_group_size: 15,
  rating: 0,
  review_count: 0,
  highlights_str: "",
  preparation_str: "",
  itinerary: "",
  itinerary_data: [{ time: "", detail: "" }],
  included: "",
  excluded: "",
  conditions: "",
};

const API_URL = "http://localhost:3000/api/v1/tours";

/* ─── Component ──────────────────────────────────── */
const TourManager = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  /* ── Fetch ─────────────────────────────────────── */
  const fetchTours = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?show_all=true`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error("Failed to fetch tours");
      const data = await response.json();
      setTours(data);
    } catch (err) {
      console.error("Could not load tours:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  /* ── Handlers ──────────────────────────────────── */
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
      child_price: tour.child_price?.toString() || "",
      province: tour.province,
      region: tour.region,
      duration: tour.duration,
      category: tour.category,
      description: tour.description || "",
      image_cover: tour.image_cover || "",
      images_str: tour.images?.join(", ") || "",
      is_active: tour.is_active,
      max_group_size: tour.max_group_size ?? 15,
      rating: tour.rating ?? 0,
      review_count: tour.review_count ?? 0,
      highlights_str: tour.highlights?.join(", ") || "",
      preparation_str: tour.preparation?.join(", ") || "",
      itinerary: tour.itinerary || "",
      itinerary_data: tour.itinerary_data?.length
        ? tour.itinerary_data
        : [{ time: "", detail: "" }],
      included: tour.included || "",
      excluded: tour.excluded || "",
      conditions: tour.conditions || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      title: formData.title,
      price: Number(formData.price),
      child_price: formData.child_price ? Number(formData.child_price) : null,
      province: formData.province,
      region: formData.region,
      duration: formData.duration,
      category: formData.category,
      description: formData.description,
      image_cover: formData.image_cover,
      images: formData.images_str
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== ""),
      is_active: formData.is_active,
      max_group_size: Number(formData.max_group_size),
      highlights: formData.highlights_str
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== ""),
      preparation: formData.preparation_str
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== ""),
      itinerary: formData.itinerary,
      itinerary_data: formData.itinerary_data.filter((i) => i.time && i.detail),
      included: formData.included,
      excluded: formData.excluded,
      conditions: formData.conditions,
    };

    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to save tour");
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
    if (!confirm("Are you sure you want to delete this tour?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error();
      setTours((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Failed to delete tour");
    }
  };

  /* ── Itinerary helpers ─────────────────────────── */
  const updateItinerary = (
    index: number,
    field: "time" | "detail",
    value: string,
  ) => {
    const updated = formData.itinerary_data.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setFormData({ ...formData, itinerary_data: updated });
  };

  const addItineraryRow = () =>
    setFormData({
      ...formData,
      itinerary_data: [...formData.itinerary_data, { time: "", detail: "" }],
    });

  const removeItineraryRow = (index: number) =>
    setFormData({
      ...formData,
      itinerary_data: formData.itinerary_data.filter((_, i) => i !== index),
    });

  /* ── Filtering & Pagination ────────────────────── */
  const filteredTours = tours.filter((tour) => {
    const matchesSearch = tour.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? tour.is_active : !tour.is_active);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
  const paginatedTours = filteredTours.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  /* ── Render ────────────────────────────────────── */
  return (
    <div className="relative space-y-6 p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Tour Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your tours, track availability, and update details.
          </p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-all"
          onClick={handleAddNew}
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Tour
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Tours</p>
            <p className="text-2xl font-bold text-gray-900">{tours.length}</p>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Tours</p>
            <p className="text-2xl font-bold text-green-600">
              {tours.filter((t) => t.is_active).length}
            </p>
          </div>
          <div className="p-2 bg-green-50 rounded-lg text-green-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(tours.map((t) => t.category)).size}
            </p>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters */}
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Tour Name
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">Price</th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Region
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Duration
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading
                      tours...
                    </div>
                  </td>
                </tr>
              ) : paginatedTours.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No tours found.
                  </td>
                </tr>
              ) : (
                paginatedTours.map((tour) => (
                  <tr
                    key={tour.id}
                    className="hover:bg-orange-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={
                              tour.image_cover ||
                              "https://placehold.co/80x80?text=Tour"
                            }
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/80x80?text=No+Img";
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {tour.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {tour.province}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ฿{Number(tour.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{tour.region}</td>
                    <td className="px-6 py-4 text-gray-600">{tour.duration}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">
                      {tour.category}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={`border-0 shadow-none ${tour.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {tour.is_active ? "Active" : "Inactive"}
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

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium">
              {filteredTours.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredTours.length)}
            </span>{" "}
            of <span className="font-medium">{filteredTours.length}</span>{" "}
            results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Modal ───────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit Tour" : "Add New Tour"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Tour Title *
                </label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. Amazing Sea Trip"
                  className="focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Price & Child Price & Duration */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Price (฿) *
                  </label>
                  <Input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0"
                    className="focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Child Price (฿)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.child_price}
                    onChange={(e) =>
                      setFormData({ ...formData, child_price: e.target.value })
                    }
                    placeholder="Auto: 60%"
                    className="focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Duration *
                  </label>
                  <Input
                    required
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="e.g. 1 Day"
                    className="focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Region & Province */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Region *
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        region: e.target.value as string,
                      })
                    }
                  >
                    {Object.values(TourRegion).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Province *
                  </label>
                  <Input
                    required
                    value={formData.province}
                    onChange={(e) =>
                      setFormData({ ...formData, province: e.target.value })
                    }
                    placeholder="e.g. Krabi"
                    className="focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as string,
                      })
                    }
                  >
                    {Object.values(TourCategory).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    value={formData.is_active ? "active" : "inactive"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: e.target.value === "active",
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Max Group Size & Cover Image */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Max Group Size *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={formData.max_group_size}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_group_size: Number(e.target.value),
                      })
                    }
                    className="focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Cover Image URL
                  </label>
                  <Input
                    value={formData.image_cover}
                    onChange={(e) =>
                      setFormData({ ...formData, image_cover: e.target.value })
                    }
                    placeholder="https://..."
                    className="focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Additional Images */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Additional Images{" "}
                  <span className="text-gray-400 font-normal text-xs">
                    (URLs คั่นด้วยคอมม่า)
                  </span>
                </label>
                <textarea
                  className="w-full p-3 border border-input rounded-md text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="https://image1.jpg, https://image2.jpg"
                  value={formData.images_str}
                  onChange={(e) =>
                    setFormData({ ...formData, images_str: e.target.value })
                  }
                />
              </div>

              {/* Image Preview */}
              {formData.image_cover && (
                <img
                  src={formData.image_cover}
                  alt="preview"
                  className="h-28 w-full object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}

              {/* Description */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  className="w-full p-3 border border-input rounded-md text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Describe the tour experience..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Highlights */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Highlights{" "}
                  <span className="text-gray-400 font-normal text-xs">
                    (คั่นด้วยคอมม่า)
                  </span>
                </label>
                <textarea
                  className="w-full p-3 border border-input rounded-md text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="e.g. ชมวิวพระอาทิตย์ตก, ดำน้ำดูปะการัง, อาหารกลางวันบนเรือ"
                  value={formData.highlights_str}
                  onChange={(e) =>
                    setFormData({ ...formData, highlights_str: e.target.value })
                  }
                />
              </div>

              {/* Preparation */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Preparation{" "}
                  <span className="text-gray-400 font-normal text-xs">
                    (คั่นด้วยคอมม่า)
                  </span>
                </label>
                <textarea
                  className="w-full p-3 border border-input rounded-md text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="e.g. ชุดว่ายน้ำ, ครีมกันแดด, กล้องถ่ายรูป"
                  value={formData.preparation_str}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preparation_str: e.target.value,
                    })
                  }
                />
              </div>

              {/* Itinerary (Text) */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Itinerary (Text)
                </label>
                <textarea
                  className="w-full p-3 border border-input rounded-md text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Simple text description of the itinerary..."
                  value={formData.itinerary}
                  onChange={(e) =>
                    setFormData({ ...formData, itinerary: e.target.value })
                  }
                />
              </div>

              {/* Itinerary (Structured) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">
                    Itinerary
                  </label>
                  <button
                    type="button"
                    onClick={addItineraryRow}
                    className="text-xs text-orange-500 hover:text-orange-600 font-semibold border border-orange-200 hover:border-orange-400 px-2.5 py-1 rounded-md transition-colors"
                  >
                    + Add Step
                  </button>
                </div>
                {formData.itinerary_data.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      className="w-28 focus:ring-orange-500"
                      placeholder="08:30 น."
                      value={item.time}
                      onChange={(e) =>
                        updateItinerary(index, "time", e.target.value)
                      }
                    />
                    <Input
                      className="flex-1 focus:ring-orange-500"
                      placeholder="Activity detail..."
                      value={item.detail}
                      onChange={(e) =>
                        updateItinerary(index, "detail", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeItineraryRow(index)}
                      disabled={formData.itinerary_data.length === 1}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Included */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Included
                </label>
                <textarea
                  className="w-full p-3 border border-input rounded-md text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="What's included in the tour price..."
                  value={formData.included}
                  onChange={(e) =>
                    setFormData({ ...formData, included: e.target.value })
                  }
                />
              </div>

              {/* Excluded */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Excluded
                </label>
                <textarea
                  className="w-full p-3 border border-input rounded-md text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="What's NOT included..."
                  value={formData.excluded}
                  onChange={(e) =>
                    setFormData({ ...formData, excluded: e.target.value })
                  }
                />
              </div>

              {/* Conditions */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Terms & Conditions
                </label>
                <textarea
                  className="w-full p-3 border border-input rounded-md text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Terms, conditions, and cancellation policy..."
                  value={formData.conditions}
                  onChange={(e) =>
                    setFormData({ ...formData, conditions: e.target.value })
                  }
                />
              </div>

              {/* Rating */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Rating
                </label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: Number(e.target.value) })
                  }
                  placeholder="e.g. 4.5"
                  className="focus:ring-orange-500"
                />
              </div>

              {/* Review Count */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Review Count
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.review_count}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      review_count: Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 100"
                  className="focus:ring-orange-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="hover:bg-orange-50 hover:text-orange-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white min-w-[110px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update Tour"
                  ) : (
                    "Create Tour"
                  )}
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
