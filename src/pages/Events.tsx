import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { Search, Filter, Calendar } from 'lucide-react';
import { eventsApi } from '../services/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

function Events() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // --- Debounce user input (500ms) ---
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 500);
    return () => clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedFilters(filters), 500);
    return () => clearTimeout(id);
  }, [filters]);

  // Build params with only non-empty values + defaults
  const requestParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (debouncedSearch) p.search = debouncedSearch;
    if (debouncedFilters.category) p.category = debouncedFilters.category;
    if (debouncedFilters.location) p.location = debouncedFilters.location;
    if (debouncedFilters.dateFrom) p.dateFrom = debouncedFilters.dateFrom;
    if (debouncedFilters.dateTo) p.dateTo = debouncedFilters.dateTo;
    // defaults similar to Dashboard
    p.limit = '12';
    p.sort = '-date';
    return p;
  }, [debouncedSearch, debouncedFilters]);

  const { data: eventsData, isLoading, isError } = useQuery(
    // Use primitive values so the key is stable
    ['events',
      debouncedSearch,
      debouncedFilters.category,
      debouncedFilters.location,
      debouncedFilters.dateFrom,
      debouncedFilters.dateTo
    ],
    () => eventsApi.getAll(requestParams),
    { select: (response) => response.data } // expects { events: [...] }
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

  if (isLoading) return <LoadingSpinner size="large" />;
  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-2">Failed to load events</h3>
          <p className="text-gray-400">Please try again.</p>
        </div>
      </div>
    );
  }

  const events = eventsData?.events || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Discover Events</h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
    
  

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white hover:bg-white/15 transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="Enter location"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => setFilters({ category: '', location: '', dateFrom: '', dateTo: '' })}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: any) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
          <p className="text-gray-400">Try adjusting your search criteria or filters.</p>
        </div>
      )}
    </div>
  );
}

export default Events;
