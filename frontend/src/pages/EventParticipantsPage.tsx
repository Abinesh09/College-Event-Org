import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Download, Search, Filter, ArrowLeft, BarChart2, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import { Event, ParticipantDetail, PaginationMeta } from '../types';

export const EventParticipantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<ParticipantDetail[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 15,
    total_items: 0,
    total_pages: 1,
    has_next_page: false,
    has_prev_page: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [gender, setGender] = useState('All');
  const [year, setYear] = useState('All');
  const [status, setStatus] = useState('All');

  const departments = [
    'All',
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Biotechnology',
  ];

  const genders = ['All', 'Male', 'Female', 'Non-Binary', 'Prefer not to say'];
  const years = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate (PG)'];

  const loadData = async (page = 1) => {
    if (!id) return;
    setLoading(true);
    try {
      const [evRes, partRes] = await Promise.all([
        api.getEvent(id),
        api.getEventParticipants(id, {
          page,
          limit: 15,
          search,
          department: department !== 'All' ? department : '',
          gender: gender !== 'All' ? gender : '',
          year: year !== 'All' ? year : '',
          status: status !== 'All' ? status : '',
        }),
      ]);

      if (evRes.data) {
        setEvent(evRes.data);
      }
      if (partRes.data) {
        setParticipants(partRes.data);
      }
      if (partRes.pagination) {
        setPagination(partRes.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [id, department, gender, year, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(1);
  };

  const handleExportCSV = async () => {
    if (!event) return;
    try {
      await api.exportEventParticipantsCSV(event.id, event.title);
    } catch (err: any) {
      setError(err.message || 'CSV export failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/teacher/dashboard"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Teacher Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Attendee Management: {event?.title || 'Event'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified roster of student registrations with demographic details.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/teacher/events/${id}/stats`}
            className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 flex items-center"
          >
            <BarChart2 className="w-4 h-4 mr-1.5" />
            Demographics & Charts
          </Link>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm flex items-center"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

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
              placeholder="Search by student name, roll number, or email..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Filter
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
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
            <label className="block font-semibold text-slate-600 mb-1">Year of Study</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-white text-slate-700"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-white text-slate-700"
            >
              {genders.map((g) => (
                <option key={g} value={g}>{g}</option>
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
              <option value="All">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Total Matches: <strong>{pagination.total_items}</strong> registered attendees</span>
          <span>Max Event Limit: <strong>{event?.max_participants}</strong></span>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : participants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Age</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Registered At</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map((p) => (
                  <tr key={p.registration_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{p.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{p.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {p.student_id || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {p.department || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {p.year_of_study || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {p.age ?? 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {p.gender || 'Prefer not to say'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {p.phone_number || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(p.registered_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          p.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 p-6">
            <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No Participants Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Either no students have registered yet or no records match your filter criteria.
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page {pagination.current_page} of {pagination.total_pages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadData(pagination.current_page - 1)}
                disabled={!pagination.has_prev_page || loading}
                className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => loadData(pagination.current_page + 1)}
                disabled={!pagination.has_next_page || loading}
                className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

