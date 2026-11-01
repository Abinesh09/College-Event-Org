import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Award, ShieldCheck, ArrowRight, Sparkles, BookOpen, ChevronRight, CheckCircle2, ChevronLeft, Camera } from 'lucide-react';
import { api } from '../api/client';
import { Event } from '../types';
import { EventCard } from '../components/EventCard';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { isAuthenticated, isTeacher, isStudent } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // High-Resolution Live Event Slides for Campus Sangamam 2026 at Vivekananda Auditorium, CEG Guindy
  const sangamamSlides = [
    {
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=85',
      title: 'Vivekananda Auditorium Grand Stage & Concert Lights',
      tag: 'Grand Inaugural'
    },
    {
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=85',
      title: 'Battle of the Bands & Inter-College Musical Night',
      tag: 'Music Extravaganza'
    },
    {
      image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1920&q=85',
      title: 'Classical Bharatanatyam & Fusion Dance Ensembles',
      tag: 'Theatrical Arts'
    },
    {
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1920&q=85',
      title: '40 Tamil Nadu Colleges Student Gathering & Celebrations',
      tag: 'Youth Carnival'
    },
    {
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1920&q=85',
      title: 'Annual State Trophies & Valedictory Awards Ceremony',
      tag: 'State Honors'
    }
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.listEvents({ limit: 6 });
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

  // Auto-rotate slides smoothly one by one every 4 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sangamamSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, sangamamSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % sangamamSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + sangamamSlides.length) % sangamamSlides.length);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Live Moving Event Slides */}
      <section
        className="relative overflow-hidden bg-slate-950 py-20 lg:py-28 text-white min-h-[600px] flex items-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Live Moving Event Slides - Clear & Bright */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
          {sangamamSlides.map((slide, idx) => (
            <div
              key={slide.image + idx}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                idx === currentSlide
                  ? 'opacity-100 scale-100 z-10'
                  : 'opacity-0 scale-105 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center filter brightness-[0.85] contrast-[1.05]"
              />
            </div>
          ))}

          {/* Smooth Soft Left-Side Gradient for Pure Text Contrast (Right side stays clear and bright) */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-transparent pointer-events-none" />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 pointer-events-none" />
        </div>

        {/* Content Layer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span>CampusConnect 2026 Portal</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6 drop-shadow-lg">
              Empowering College Events, <br />
              <span className="text-teal-400">Streamlining Registrations.</span>
            </h1>

            <p className="text-lg text-slate-200 leading-relaxed mb-8 drop-shadow-md">
              Discover university hackathons, research symposiums, cultural nights, and athletic championships. Teachers organize seamlessly, students register in seconds, and event analytics update live with demographic insights.
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <Link
                to="/events"
                className="inline-flex items-center px-6 py-3.5 text-base font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transform hover:-translate-y-0.5"
              >
                Browse Upcoming Events
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              {!isAuthenticated ? (
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3.5 text-base font-semibold text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all backdrop-blur-sm"
                >
                  Student Register
                </Link>
              ) : isTeacher ? (
                <Link
                  to="/teacher/dashboard"
                  className="inline-flex items-center px-6 py-3.5 text-base font-semibold text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all backdrop-blur-sm"
                >
                  Teacher Dashboard
                </Link>
              ) : (
                <Link
                  to="/student/dashboard"
                  className="inline-flex items-center px-6 py-3.5 text-base font-semibold text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all backdrop-blur-sm"
                >
                  My Student Portal
                </Link>
              )}
            </div>
          </div>

          {/* Bottom Live Event Slide Controls & Status Bar */}
          <div className="mt-12 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
            {/* Current Event Badge - Live Featured Event Campus Sangamam */}
            <div className="flex items-center space-x-3 bg-slate-950/85 backdrop-blur-md border border-teal-500/40 px-4 py-2.5 rounded-xl shadow-2xl">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <Camera className="w-4 h-4 animate-pulse" />
              </div>
              <div className="text-xs sm:text-sm">
                <span className="text-teal-400 font-extrabold uppercase tracking-wider text-[11px] block sm:inline sm:mr-2">
                  Live Featured Event:
                </span>
                <span className="text-white font-extrabold">
                  Campus Sangamam: Inter-College Cultural Extravaganza 2026
                </span>
                <span className="text-teal-300 font-semibold ml-2">
                  📍 Vivekananda Auditorium, CEG Campus, Guindy, Chennai
                </span>
              </div>
            </div>

            {/* Slide Navigation Controls */}
            <div className="flex items-center space-x-3 bg-slate-950/85 backdrop-blur-md border border-white/20 px-3 py-2 rounded-xl shadow-2xl">
              <button
                onClick={prevSlide}
                className="p-1.5 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                title="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex space-x-2 items-center px-1">
                {sangamamSlides.map((slide, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`transition-all duration-300 rounded-full ${
                      idx === currentSlide
                        ? 'w-8 h-2.5 bg-teal-400 shadow-md shadow-teal-400/50'
                        : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/80'
                    }`}
                    title={slide.title}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="p-1.5 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                title="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <span className="text-xs text-slate-300 font-bold border-l border-white/20 pl-2">
                {currentSlide + 1} / {sangamamSlides.length}
              </span>
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

