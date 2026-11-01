import React, { useEffect, useState } from 'react';
import { Search, Filter, Calendar, RefreshCw, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { Event, PaginationMeta } from '../types';
import { EventCard } from '../components/EventCard';

export const BrowseEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 12,
    total_items: 0,
    total_pages: 1,
    has_next_page: false,
    has_prev_page: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [eventType, setEventType] = useState('All');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');

  const categories = [
    'All',
    'Technology',
    'Robotics',
    'Cultural',
    'AI & Data Science',
    'Sports',
    'Cloud Computing',
    'Business',
  ];

  const eventTypes = [
    'All',
    'technical',
    'cultural',
    'sports',
    'workshop',
    'seminar',
    'other',
  ];

  const departments = [
    'All',
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Student Cultural Affairs',
    'Physical Education',
  ];

  const statuses = [
    'All',
    'Registration Open',
    'Upcoming',
    'Full',
    'Completed',
  ];

  const fetchEvents = async (
    page = 1,
    overrideSearch?: string,
    overrideCat?: string,
    overrideType?: string,
    overrideDept?: string,
    overrideStat?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const qSearch = overrideSearch !== undefined ? overrideSearch : search;
      const qCat = overrideCat !== undefined ? overrideCat : (category !== 'All' ? category : '');
      const qType = overrideType !== undefined ? overrideType : (eventType !== 'All' ? eventType : '');
      const qDept = overrideDept !== undefined ? overrideDept : (department !== 'All' ? department : '');
      const qStat = overrideStat !== undefined ? overrideStat : (status !== 'All' ? status : '');

      const res = await api.listEvents({
        page,
        limit: 12,
        search: qSearch,
        category: qCat,
        event_type: qType,
        department: qDept,
        status: qStat,
      });

      if (res.data) {
        setEvents(res.data);
      }
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      console.error('Failed to query events', err);
      setError(err.message || 'Unable to connect to events service. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(1);
  }, [category, eventType, department, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents(1);
  };

  const handleReset = () => {
    setSearch('');
    setCategory('All');
    setEventType('All');
    setDepartment('All');
    setStatus('All');
    fetchEvents(1, '', '', '', '', '');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Campus Events Directory</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore technical symposiums, athletic tournaments, and cultural gatherings across all faculties.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, department, or venue..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm"
          >
            Search
          </button>
          {(search || category !== 'All' || eventType !== 'All' || department !== 'All' || status !== 'All') && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center"
              title="Reset Filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-white text-slate-700"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-white text-slate-700 capitalize"
            >
              {eventTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-white text-slate-700"
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-white text-slate-700"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchEvents(1)}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-xl h-80 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No matching events found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or clearing your category filters.
          </p>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 text-sm">
          <span className="text-xs text-slate-500">
            Showing Page <strong>{pagination.current_page}</strong> of <strong>{pagination.total_pages}</strong> ({pagination.total_items} total events)
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchEvents(pagination.current_page - 1)}
              disabled={!pagination.has_prev_page || loading}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-xs text-slate-700">
              {pagination.current_page}
            </span>
            <button
              onClick={() => fetchEvents(pagination.current_page + 1)}
              disabled={!pagination.has_next_page || loading}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

