import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Award, CheckCircle, Clock, ArrowRight, BookmarkCheck, Sparkles, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Event, EventRegistration } from '../types';
import { EventCard } from '../components/EventCard';
import { StatusBadge } from '../components/StatusBadge';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [openEvents, setOpenEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [eventsRes, regsRes] = await Promise.all([
          api.listEvents({ limit: 6 }),
          api.getMyRegistrations(),
        ]);

        if (eventsRes.data) {
          setOpenEvents(eventsRes.data);
        }
        if (regsRes.data) {
          setMyRegistrations(regsRes.data);
        }
      } catch (err) {
        console.error('Failed to load student dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const activeRegistrations = myRegistrations.filter((r) => r.status === 'confirmed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Student Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name}!
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-teal-200 mt-2">
            <span>Roll No: <strong>{user?.profile?.student_id || 'N/A'}</strong></span>
            <span>•</span>
            <span>Department: <strong>{user?.profile?.department || 'N/A'}</strong></span>
            <span>•</span>
            <span>Year: <strong>{user?.profile?.year_of_study || 'N/A'}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/events"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-xl transition-colors shadow-sm"
          >
            Explore Events
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
          <Link
            to="/student/registrations"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
          >
            <BookmarkCheck className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
            My Booked Events
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{activeRegistrations.length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Registrations
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{openEvents.length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Campus Events Listed
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {myRegistrations.filter((r) => r.event?.computed_status === 'Completed').length}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Events
            </div>
          </div>
        </div>
      </div>

      {/* Section: My Active Registrations Preview */}
      {activeRegistrations.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <BookmarkCheck className="w-4 h-4 mr-2 text-teal-600" />
                My Confirmed Event Passes
              </h2>
              <p className="text-xs text-slate-500">Upcoming events you are registered to attend</p>
            </div>
            <Link
              to="/student/registrations"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              Manage all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRegistrations.slice(0, 4).map((reg) => (
              <div
                key={reg.id}
                className="p-4 rounded-xl border border-slate-200/80 hover:border-teal-300 bg-slate-50/50 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={reg.event?.computed_status || 'Registration Open'} />
                    <span className="text-[11px] text-slate-500">
                      Reg: {new Date(reg.registered_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{reg.event?.title}</h3>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div>📅 Date: {reg.event?.event_date} ({reg.event?.start_time})</div>
                    <div>📍 Venue: {reg.event?.venue}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Confirmed Seat
                  </span>
                  <Link
                    to={`/events/${reg.event_id}`}
                    className="text-xs font-semibold text-slate-700 hover:text-teal-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section: Currently Open Events */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Campus Events Open for Registration</h2>
            <p className="text-xs text-slate-500">Browse current opportunities and reserve your slot</p>
          </div>
          <Link
            to="/events"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800"
          >
            Browse all events →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl h-72 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : openEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {openEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600 text-sm">No open events found right now.</p>
          </div>
        )}
      </section>
    </div>
  );
};
