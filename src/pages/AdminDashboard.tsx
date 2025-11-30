import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2, Calendar, Users, Eye } from 'lucide-react';
import { eventsApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

function AdminDashboard() {
  const queryClient = useQueryClient();
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    date: '',
    location: '',
    targetAudience: '',
    tags: '',
  });

  const { data: eventsData, isLoading } = useQuery(
    'adminEvents',
    () => eventsApi.getAll(),
    {
      select: (response) => response.data
    }
  );

  const createMutation = useMutation(
    (data: any) => eventsApi.create(data),
    {
      onSuccess: () => {
        toast.success('Event created successfully!');
        setShowEventForm(false);
        resetForm();
        queryClient.invalidateQueries('adminEvents');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Creation failed');
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => eventsApi.update(id, data),
    {
      onSuccess: () => {
        toast.success('Event updated successfully!');
        setEditingEvent(null);
        resetForm();
        queryClient.invalidateQueries('adminEvents');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Update failed');
      }
    }
  );

  const deleteMutation = useMutation(
    (id: string) => eventsApi.delete(id),
    {
      onSuccess: () => {
        toast.success('Event deleted successfully!');
        queryClient.invalidateQueries('adminEvents');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Deletion failed');
      }
    }
  );

  const categories = [
    'Technology',
    'Business',
    'Arts',
    'Science',
    'Sports',
    'Workshop',
    'Seminar',
    'Conference',
    'Social'
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      date: '',
      location: '',
      targetAudience: '',
      tags: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      ...formData,
      tags: formData.tags.split(',').map(s => s.trim()).filter(s => s),
    };

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent._id, data: eventData });
    } else {
      createMutation.mutate(eventData);
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description,
      category: event.category,
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location,
      targetAudience: event.targetAudience || '',
      tags: event.tags.join(', '),
    });
    setShowEventForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Manage events and view analytics</p>
        </div>
        
        <button
          onClick={() => {
            setShowEventForm(true);
            setEditingEvent(null);
            resetForm();
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">{eventsData?.events?.length || 0}</p>
              <p className="text-blue-300">Total Events</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">
                {eventsData?.events?.reduce((acc: number, event: any) => acc + (event.registeredCount || 0), 0) || 0}
              </p>
              <p className="text-green-300">Total Registrations</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-purple-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">
                {eventsData?.events?.filter((e: any) => new Date(e.date) > new Date()).length || 0}
              </p>
              <p className="text-purple-300">Upcoming Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                onClick={() => setShowEventForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleChange}
                    placeholder="e.g., All Students, CS Students"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g., programming, web development"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium disabled:opacity-50"
                >
                  {(createMutation.isLoading || updateMutation.isLoading) 
                    ? 'Saving...' 
                    : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Registrations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {eventsData?.events?.map((event: any) => (
                <tr key={event._id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-white">{event.name}</div>
                      <div className="text-sm text-gray-400">{event.location}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md text-xs">
                      {event.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {formatDate(event.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {event.registeredCount || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        disabled={deleteMutation.isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;