import React from 'react';
import { Calendar, Clock, MapPin, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Event } from '../types';
import { StatusBadge } from './StatusBadge';

interface EventCardProps {
  event: Event;
  showManageButtons?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, showManageButtons = false }) => {
  const percentFilled = Math.min(
    100,
    Math.round(((event.current_registrations || 0) / (event.max_participants || 1)) * 100)
  );

  const fallbackPoster = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-md transition-all duration-200 group">
      {/* Poster Header */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={event.poster_url || fallbackPoster}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackPoster;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <StatusBadge status={event.computed_status} />
          {event.is_registered && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-sm">
              <Award className="w-3 h-3 mr-1" />
              Registered
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-white/90 text-slate-800 backdrop-blur-sm shadow-sm">
            {event.event_type}
          </span>
        </div>

        <div className="absolute bottom-2 left-3 right-3 text-white text-xs font-medium truncate drop-shadow-sm">
          {event.organizing_department}
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            {event.category}
          </div>

          <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1 mb-2">
            <Link to={`/events/${event.id}`}>{event.title}</Link>
          </h3>

          <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
            {event.short_description}
          </p>

          <div className="space-y-2 text-xs text-slate-600 mb-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
              <span>{event.event_date}</span>
              <span className="mx-1.5 text-slate-300">•</span>
              <Clock className="w-4 h-4 text-teal-600 mr-1 flex-shrink-0" />
              <span>{event.start_time} - {event.end_time}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Capacity & Actions */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
            <span className="flex items-center">
              <Users className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Seats: {event.current_registrations || 0} / {event.max_participants}
            </span>
            <span className="font-medium text-slate-700">
              {event.available_seats <= 0 ? 'Full' : `${event.available_seats} left`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                percentFilled >= 100
                  ? 'bg-rose-500'
                  : percentFilled >= 80
                  ? 'bg-amber-500'
                  : 'bg-teal-600'
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>

          {showManageButtons ? (
            <div className="flex items-center space-x-2">
              <Link
                to={`/teacher/events/${event.id}/participants`}
                className="flex-1 text-center py-2 px-3 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
              >
                Participants
              </Link>
              <Link
                to={`/teacher/events/${event.id}/edit`}
                className="py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Edit
              </Link>
            </div>
          ) : (
            <Link
              to={`/events/${event.id}`}
              className="w-full block text-center py-2 px-4 text-sm font-semibold text-white bg-slate-900 hover:bg-teal-700 rounded-lg transition-colors shadow-sm"
            >
              View Details & Register
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

