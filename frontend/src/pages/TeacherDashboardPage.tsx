import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Calendar, Users, Award, Download, Edit3, Eye, Ban, CheckCircle, BarChart2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import { Event, TeacherDashboardStats } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';

export const TeacherDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cancellation modal state
  const [cancellingEvent, setCancellingEvent] = useState<Event | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      const [statsRes, eventsRes] = await Promise.all([
        api.getTeacherDashboard(),
        api.getTeacherEvents(),
      ]);

      if (statsRes.data) {
        setStats(statsRes.data);
      }
      if (eventsRes.data) {
        setEvents(eventsRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load teacher dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeacherData();
  }, []);

  const handleOpenCancel = (event: Event) => {
    setCancellingEvent(event);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingEvent) return;
    setShowCancelModal(false);
    setError(null);
    setSuccessMsg(null);

    try {
      await api.updateEventStatus(cancellingEvent.id, 'cancelled');
      setSuccessMsg(`Event "${cancellingEvent.title}" has been marked as cancelled.`);
      await loadTeacherData();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel event');
    }
  };

  const handleExportCSV = async (event: Event) => {
    try {
      await api.exportEventParticipantsCSV(event.id, event.title);
    } catch (err: any) {
      setError(err.message || 'Failed to export CSV');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Faculty Organizer Suite</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Teacher Event Dashboard</h1>
          <p className="text-sm text-slate-500">
            Create, monitor, and export registrant rosters for all your college events.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadTeacherData}
            disabled={loading}
            className="p-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
          <Link
            to="/teacher/events/create"
            className="inline-flex items-center px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Create New Event
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Events
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats?.total_events_created || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Authored by you</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Active Events
          </div>
          <div className="text-3xl font-extrabold text-teal-600">
            {stats?.active_events || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Published & Ongoing</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Registrations
          </div>
          <div className="text-3xl font-extrabold text-purple-600">
            {stats?.total_registrations || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Confirmed student seats</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Upcoming Events
          </div>
          <div className="text-3xl font-extrabold text-blue-600">
            {stats?.upcoming_events || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">In coming days</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Completed
          </div>
          <div className="text-3xl font-extrabold text-slate-500">
            {stats?.completed_events || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Past events</div>
        </div>
      </div>

      {/* Events Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Events Managed by You</h2>
            <p className="text-xs text-slate-500">Full roster of your organized academic and campus events</p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Event Title</th>
                  <th className="py-3.5 px-4">Event Date</th>
                  <th className="py-3.5 px-4">Registration Deadline</th>
                  <th className="py-3.5 px-4">Registrations / Seats</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((event) => {
                  const percent = Math.min(
                    100,
                    Math.round(((event.current_registrations || 0) / (event.max_participants || 1)) * 100)
                  );

                  return (
                    <tr key={event.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-900 max-w-xs">
                        <Link to={`/events/${event.id}`} className="hover:text-teal-700 transition-colors line-clamp-1">
                          {event.title}
                        </Link>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                          {event.organizing_department} • {event.category}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-slate-700">
                        {event.event_date}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-slate-600">
                        {new Date(event.registration_deadline).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">
                            {event.current_registrations || 0} / {event.max_participants}
                          </span>
                          <span className="text-[11px] text-slate-400">({percent}%)</span>
                        </div>
                        <div className="w-24 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${percent >= 100 ? 'bg-rose-500' : 'bg-teal-600'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={event.computed_status} />
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/teacher/events/${event.id}/participants`}
                            className="p-1.5 text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                            title="View Participants Table"
                          >
                            <Users className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/teacher/events/${event.id}/stats`}
                            className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Statistics & Charts"
                          >
                            <BarChart2 className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleExportCSV(event)}
                            className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Export Participants CSV"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          <Link
                            to={`/teacher/events/${event.id}/edit`}
                            className="p-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Edit Event"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          {event.status !== 'cancelled' && (
                            <button
                              onClick={() => handleOpenCancel(event)}
                              className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              title="Cancel Event"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 p-6">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Events Created Yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              You haven't authored any college events yet. Publish your first workshop or symposium today!
            </p>
            <Link
              to="/teacher/events/create"
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Publish First Event
            </Link>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Campus Event"
        message={`Are you sure you want to mark the event "${cancellingEvent?.title}" as cancelled? This status will be displayed across the student directory.`}
        confirmLabel="Yes, Mark as Cancelled"
        cancelLabel="Keep Event Active"
        isDestructive={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};

