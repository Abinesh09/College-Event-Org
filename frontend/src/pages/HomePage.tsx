import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Award, ShieldCheck, ArrowRight, Sparkles, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import { Event } from '../types';
import { EventCard } from '../components/EventCard';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { isAuthenticated, isTeacher, isStudent } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.listEvents({ limit: 3 });
        if (res.data) {
          setFeaturedEvents(res.data);
        }
      } catch (err) {
        console.error('Failed to load featured events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-20 lg:py-28 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CampusConnect 2026 Portal</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Empowering College Events, <br />
              <span className="text-teal-400">Streamlining Registrations.</span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              Discover university hackathons, research symposiums, cultural nights, and athletic championships. Teachers organize seamlessly, students register in seconds, and event analytics update live with demographic insights.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/events"
                className="inline-flex items-center px-6 py-3.5 text-base font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-xl transition-colors shadow-lg shadow-teal-500/20"
              >
                Browse Upcoming Events
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              {!isAuthenticated ? (
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3.5 text-base font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                >
                  Student Register
                </Link>
              ) : isTeacher ? (
                <Link
                  to="/teacher/dashboard"
                  className="inline-flex items-center px-6 py-3.5 text-base font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                >
                  Teacher Dashboard
                </Link>
              ) : (
                <Link
                  to="/student/dashboard"
                  className="inline-flex items-center px-6 py-3.5 text-base font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                >
                  My Student Portal
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics Strip */}
      <section className="bg-teal-600 text-white py-6 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-extrabold">100%</div>
              <div className="text-xs uppercase tracking-wider text-teal-100 font-medium mt-1">Concurrency-Safe Seats</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold">5+</div>
              <div className="text-xs uppercase tracking-wider text-teal-100 font-medium mt-1">Event Categories</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold">Instant</div>
              <div className="text-xs uppercase tracking-wider text-teal-100 font-medium mt-1">CSV Participant Export</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold">Real-Time</div>
              <div className="text-xs uppercase tracking-wider text-teal-100 font-medium mt-1">Demographic Analytics</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Currently Open</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Featured Campus Events</h2>
            </div>
            <Link
              to="/events"
              className="mt-4 sm:mt-0 inline-flex items-center text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              View all open events
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-xl h-80 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No open events scheduled at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Role Benefits Grid */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Designed for Both Students & Organizers</h2>
            <p className="text-slate-600 text-sm mt-3">
              Role-specific workflows built to eliminate paper registrations, double bookings, and manual roster management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50/50 border border-teal-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold mb-6 shadow-md shadow-teal-600/20">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">For Students</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Browse events across all academic departments. Submit your student details once and register with a single click.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700 mb-8 font-medium">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                    Instant registration confirmation & seat reservation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                    Filter events by department, category, and date
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                    Track all upcoming and past registered events
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                    Cancel registrations prior to event date if plans change
                  </li>
                </ul>
              </div>

              <Link
                to="/register"
                className="w-full text-center py-2.5 px-4 text-sm font-semibold text-teal-800 bg-teal-200/60 hover:bg-teal-200 rounded-lg transition-colors"
              >
                Create Student Account
              </Link>
            </div>

            {/* Teacher Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold mb-6 shadow-md shadow-purple-600/20">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">For Teachers & Organizers</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Publish events with custom capacity limits, eligibility rules, and registration deadlines. Supervise attendees in real time.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700 mb-8 font-medium">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                    Full event management (Draft, Publish, Update, Cancel)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                    Searchable participant table with department and age demographics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                    One-click CSV export of all verified attendee records
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                    Interactive department, gender, and capacity charts
                  </li>
                </ul>
              </div>

              <Link
                to="/login"
                className="w-full text-center py-2.5 px-4 text-sm font-semibold text-purple-800 bg-purple-200/60 hover:bg-purple-200 rounded-lg transition-colors"
              >
                Organizer Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
