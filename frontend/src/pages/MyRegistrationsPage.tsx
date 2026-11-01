import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCheck, Calendar, MapPin, Clock, AlertCircle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { EventRegistration } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';

export const MyRegistrationsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.getMyRegistrations();
      if (res.data) {
        setRegistrations(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleOpenCancel = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedEventId) return;
    setShowCancelModal(false);
    setError(null);
    setSuccessMsg(null);

    try {
      await api.cancelRegistration(selectedEventId);
      setSuccessMsg('Registration successfully cancelled.');
      await fetchRegistrations();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel registration');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
          <BookmarkCheck className="w-4 h-4" />
          <span>Student Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Event Registrations</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your upcoming confirmed reservations and past campus event history.
        </p>
      </div>

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

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : registrations.length > 0 ? (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const ev = reg.event;
            const isConfirmed = reg.status === 'confirmed';
            const isPast = ev?.computed_status === 'Completed';

            return (
              <div
                key={reg.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {isConfirmed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Registration Confirmed
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Cancelled
                        </>
                      )}
                    </span>

                    {ev && <StatusBadge status={ev.computed_status} />}
                    <span className="text-xs text-slate-400">
                      Registered on {new Date(reg.registered_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900">
                    <Link to={`/events/${reg.event_id}`} className="hover:text-teal-700 transition-colors">
                      {ev?.title || 'Event Details'}
                    </Link>
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 text-teal-600 mr-1" />
                      <span>{ev?.event_date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 text-teal-600 mr-1" />
                      <span>{ev?.start_time} - {ev?.end_time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 mr-1" />
                      <span className="truncate max-w-[200px]">{ev?.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Link
                    to={`/events/${reg.event_id}`}
                    className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>

                  {isConfirmed && !isPast && (
                    <button
                      onClick={() => handleOpenCancel(reg.event_id)}
                      className="px-4 py-2 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                    >
                      Cancel Reservation
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <BookmarkCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">No Registrations Yet</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            You haven't signed up for any events yet. Check out the directory to join upcoming workshops and fests!
          </p>
          <Link
            to="/events"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
          >
            Explore Events Now
          </Link>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Event Reservation"
        message="Are you sure you want to cancel your seat? This action will immediately release your slot to other students on the waitlist."
        confirmLabel="Confirm Cancellation"
        cancelLabel="Keep My Slot"
        isDestructive={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};
