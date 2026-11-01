import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Award, Shield, Mail, CheckCircle2, AlertCircle, ArrowLeft, Edit3, BarChart2, Download } from 'lucide-react';
import { api } from '../api/client';
import { Event } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isTeacher, isStudent } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchEvent = async () => {
    if (!id) return;
    try {
      const res = await api.getEvent(id);
      if (res.data) {
        setEvent(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }
    if (!event) return;

    setError(null);
    setSuccessMsg(null);
    setActionLoading(true);

    try {
      await api.registerForEvent(event.id);
      setSuccessMsg('Congratulations! Your registration has been confirmed.');
      await fetchEvent();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!event) return;
    setShowCancelModal(false);
    setActionLoading(true);
    setError(null);

    try {
      await api.cancelRegistration(event.id);
      setSuccessMsg('Your registration has been cancelled.');
      await fetchEvent();
    } catch (err: any) {
      setError(err.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Event Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">The event you are looking for does not exist or has been removed.</p>
        <Link to="/events" className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg">
          Back to Events
        </Link>
      </div>
    );
  }

  const isOwner = isTeacher && user?.id === event.organizer_id;
  const isRegistrationOpen = event.computed_status === 'Registration Open';
  const isEventFull = event.computed_status === 'Full';
  const fallbackPoster = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/events"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to all events
        </Link>
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
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Poster & Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="relative h-64 sm:h-96 w-full bg-slate-900">
          <img
            src={event.poster_url || fallbackPoster}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackPoster;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <StatusBadge status={event.computed_status} />
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-white/90 text-slate-800 backdrop-blur-sm">
              {event.event_type}
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-2">
              {event.organizing_department} • {event.category}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug drop-shadow-sm">
              {event.title}
            </h1>
            <p className="text-xs text-slate-300 mt-2">
              Organized by: <span className="font-semibold text-white">{event.organizer_name || 'Faculty Committee'}</span>
            </p>
          </div>
        </div>

        {/* Action Toolbar for Organizer */}
        {isOwner && (
          <div className="px-6 py-3 bg-purple-50/80 border-b border-purple-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-purple-900 flex items-center">
              <Shield className="w-4 h-4 mr-1.5 text-purple-600" />
              You are the authorized organizer of this event
            </span>
            <div className="flex items-center space-x-2">
              <Link
                to={`/teacher/events/${event.id}/participants`}
                className="px-3 py-1.5 font-semibold text-teal-800 bg-teal-100 hover:bg-teal-200 rounded-lg transition-colors flex items-center"
              >
                <Users className="w-3.5 h-3.5 mr-1" />
                View Attendees ({event.current_registrations})
              </Link>
              <Link
                to={`/teacher/events/${event.id}/stats`}
                className="px-3 py-1.5 font-semibold text-blue-800 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors flex items-center"
              >
                <BarChart2 className="w-3.5 h-3.5 mr-1" />
                Demographic Stats
              </Link>
              <Link
                to={`/teacher/events/${event.id}/edit`}
                className="px-3 py-1.5 font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Edit Event
              </Link>
            </div>
          </div>
        )}

        {/* Content & Side Card */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-2">Overview</h2>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {event.eligibility_criteria && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Eligibility Criteria
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {event.eligibility_criteria}
                </p>
              </div>
            )}

            {event.contact_info && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Organizer Contact Information
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {event.contact_info}
                </p>
              </div>
            )}
          </div>

          {/* Side Registration Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/90 space-y-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                Event Logistics
              </h3>

              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="flex items-start space-x-2.5">
                  <Calendar className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">Event Date</div>
                    <div>{event.event_date}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <Clock className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">Timing</div>
                    <div>{event.start_time} - {event.end_time}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">Venue Location</div>
                    <div>{event.venue}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <Users className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                      <span>Seat Capacity</span>
                      <span>{event.current_registrations} / {event.max_participants}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-600 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((event.current_registrations / event.max_participants) * 100))}%`,
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {event.available_seats <= 0 ? 'No seats remaining' : `${event.available_seats} seats remaining`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Deadline notice */}
              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                Registration Deadline:{' '}
                <strong className="text-slate-800">
                  {new Date(event.registration_deadline).toLocaleDateString()}
                </strong>
              </div>

              {/* Registration Action Button */}
              <div className="pt-2">
                {event.is_registered ? (
                  <div className="space-y-2">
                    <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                      You Are Registered
                    </div>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      disabled={actionLoading}
                      className="w-full py-2 px-3 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                    >
                      Cancel My Registration
                    </button>
                  </div>
                ) : isTeacher ? (
                  <div className="text-xs text-center text-slate-500 py-2 bg-slate-100 rounded-lg">
                    Teacher account logged in
                  </div>
                ) : !isAuthenticated ? (
                  <button
                    onClick={() => navigate('/login', { state: { from: { pathname: `/events/${id}` } } })}
                    className="w-full py-3 px-4 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-colors"
                  >
                    Log In to Register
                  </button>
                ) : isEventFull ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 text-sm font-semibold text-slate-500 bg-slate-200 rounded-xl cursor-not-allowed"
                  >
                    Event is Full
                  </button>
                ) : !isRegistrationOpen ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 text-sm font-semibold text-slate-500 bg-slate-200 rounded-xl cursor-not-allowed"
                  >
                    {event.computed_status}
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={actionLoading}
                    className="w-full py-3 px-4 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Confirming Seat...' : 'Register for Event'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Cancel */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Event Registration"
        message="Are you sure you want to cancel your confirmed registration for this event? Your reserved seat will be immediately released for other students."
        confirmLabel="Yes, Cancel Registration"
        cancelLabel="Keep Reservation"
        isDestructive={true}
        onConfirm={handleCancelRegistration}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};

