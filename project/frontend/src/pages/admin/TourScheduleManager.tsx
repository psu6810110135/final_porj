import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("jwt_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

interface Tour {
  id: string;
  title: string;
  max_group_size: number;
}

interface Schedule {
  id: string;
  tour_id: string;
  available_date: string;
  max_capacity_override: number | null;
  is_available: boolean;
  created_at: string;
  available_seats?: number;
  booked_seats?: number;
}

const API_BASE = "http://localhost:3000/api/v1";

const TourScheduleManager = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string>("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTours, setLoadingTours] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    available_date: "",
    max_capacity_override: "",
    is_available: true,
  });

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    if (selectedTourId) {
      fetchSchedules(selectedTourId);
    } else {
      setSchedules([]);
    }
  }, [selectedTourId]);

  const fetchTours = async () => {
    setLoadingTours(true);
    try {
      const response = await fetch(`${API_BASE}/tours?show_all=true`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error("Failed to fetch tours");
      const data = await response.json();
      setTours(data);
    } catch (err) {
      console.error("Failed to fetch tours:", err);
      alert("Could not load tours");
    } finally {
      setLoadingTours(false);
    }
  };

  const fetchSchedules = async (tourId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/tours/${tourId}/schedules`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error("Failed to fetch schedules");
      const data = await response.json();
      setSchedules(data);
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    if (!selectedTourId) {
      alert("Please select a tour first");
      return;
    }
    setEditingId(null);
    setFormData({
      available_date: "",
      max_capacity_override: "",
      is_available: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setFormData({
      available_date: schedule.available_date.split("T")[0],
      max_capacity_override: schedule.max_capacity_override?.toString() || "",
      is_available: schedule.is_available,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      tour_id: selectedTourId,
      available_date: formData.available_date,
      max_capacity_override: formData.max_capacity_override
        ? Number(formData.max_capacity_override)
        : null,
      is_available: formData.is_available,
    };

    try {
      const url = editingId
        ? `${API_BASE}/tours/${selectedTourId}/schedules/${editingId}`
        : `${API_BASE}/tours/${selectedTourId}/schedules`;

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to save schedule");
      }

      await fetchSchedules(selectedTourId);
      setIsModalOpen(false);
      setFormData({
        available_date: "",
        max_capacity_override: "",
        is_available: true,
      });
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    try {
      const res = await fetch(
        `${API_BASE}/tours/${selectedTourId}/schedules/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeader(),
        },
      );
      if (!res.ok) throw new Error();
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Failed to delete schedule");
    }
  };

  const selectedTour = tours.find((t) => t.id === selectedTourId);
  const sortedSchedules = [...schedules].sort(
    (a, b) =>
      new Date(a.available_date).getTime() -
      new Date(b.available_date).getTime(),
  );

  return (
    <div className="relative space-y-6 p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Tour Schedule Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage tour dates, capacity, and availability
          </p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-all"
          onClick={handleAddNew}
          disabled={!selectedTourId}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Schedule
        </Button>
      </div>

      {/* Tour Selection */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <label className="text-sm font-semibold text-gray-700 mb-3 block">
          Select Tour to Manage Schedules
        </label>
        {loadingTours ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading tours...
          </div>
        ) : (
          <select
            className="w-full max-w-2xl h-11 px-4 rounded-lg border-2 border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            value={selectedTourId}
            onChange={(e) => setSelectedTourId(e.target.value)}
          >
            <option value="">-- Choose a tour --</option>
            {tours.map((tour) => (
              <option key={tour.id} value={tour.id}>
                {tour.title} (Max: {tour.max_group_size} people)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Stats */}
      {selectedTourId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Schedules
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {schedules.length}
              </p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Available</p>
              <p className="text-2xl font-bold text-green-600">
                {schedules.filter((s) => s.is_available).length}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Unavailable</p>
              <p className="text-2xl font-bold text-red-600">
                {schedules.filter((s) => !s.is_available).length}
              </p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Schedules Table */}
      {selectedTourId && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Max Capacity
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Booked
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Available
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
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading
                        schedules...
                      </div>
                    </td>
                  </tr>
                ) : sortedSchedules.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      No schedules found. Add a new schedule to get started.
                    </td>
                  </tr>
                ) : (
                  sortedSchedules.map((schedule) => {
                    const date = new Date(schedule.available_date);
                    const dateStr = date.toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                    });
                    const maxCapacity =
                      schedule.max_capacity_override ??
                      selectedTour?.max_group_size ??
                      0;
                    const booked = schedule.booked_seats ?? 0;
                    const available =
                      schedule.available_seats ?? maxCapacity - booked;

                    return (
                      <tr
                        key={schedule.id}
                        className="hover:bg-orange-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {dateStr}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  schedule.available_date,
                                ).toLocaleDateString("en-US")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {maxCapacity}
                            </span>
                            {schedule.max_capacity_override && (
                              <Badge className="bg-blue-100 text-blue-800 border-0 text-xs">
                                Override
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {booked}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-semibold ${available > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {available}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={`border-0 shadow-none ${
                              schedule.is_available
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {schedule.is_available ? "Open" : "Closed"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-orange-600 hover:bg-orange-100"
                              onClick={() => handleEdit(schedule)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-red-600 hover:bg-red-100"
                              onClick={() => handleDelete(schedule.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit Schedule" : "Add New Schedule"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Tour Info */}
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide">
                  Selected Tour
                </p>
                <p className="text-sm font-medium text-orange-900 mt-1">
                  {selectedTour?.title}
                </p>
                <p className="text-xs text-orange-700 mt-0.5">
                  Default Max Capacity: {selectedTour?.max_group_size} people
                </p>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Available Date *
                </label>
                <Input
                  type="date"
                  required
                  value={formData.available_date}
                  onChange={(e) =>
                    setFormData({ ...formData, available_date: e.target.value })
                  }
                  className="focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Max Capacity Override */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Max Capacity Override{" "}
                  <span className="text-gray-400 font-normal text-xs">
                    (leave empty to use tour default)
                  </span>
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.max_capacity_override}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_capacity_override: e.target.value,
                    })
                  }
                  placeholder={`Default: ${selectedTour?.max_group_size || 0}`}
                  className="focus:ring-orange-500"
                />
              </div>

              {/* Availability Status */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  value={formData.is_available ? "open" : "closed"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_available: e.target.value === "open",
                    })
                  }
                >
                  <option value="open">Open for Booking</option>
                  <option value="closed">Closed</option>
                </select>
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
                    "Update Schedule"
                  ) : (
                    "Create Schedule"
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

export default TourScheduleManager;
