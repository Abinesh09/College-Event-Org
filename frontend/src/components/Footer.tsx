import React, { useState } from 'react';
import { Calendar, ShieldCheck, Mail, MapPin, KeyRound, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <footer className="mt-auto bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-slate-900">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold">CampusConnect</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The official centralized platform for university workshops, hackathons, seminars, cultural festivals, and athletic tournaments.
            </p>
            <button
              onClick={() => setShowDemoModal(true)}
              className="inline-flex items-center text-xs font-semibold text-teal-400 hover:text-teal-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 mr-1.5" />
              View Demo Credentials
            </button>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Portal Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-teal-400 transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-teal-400 transition-colors">Browse All Events</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-teal-400 transition-colors">Student Registration</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-400 transition-colors">Portal Login</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Role Portals */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Role Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/student/dashboard" className="hover:text-teal-400 transition-colors">Student Dashboard</Link>
              </li>
              <li>
                <Link to="/student/registrations" className="hover:text-teal-400 transition-colors">My Registrations</Link>
              </li>
              <li>
                <Link to="/teacher/dashboard" className="hover:text-teal-400 transition-colors">Teacher Management Suite</Link>
              </li>
              <li>
                <Link to="/teacher/events/create" className="hover:text-teal-400 transition-colors">Publish New Event</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Security */}
          <div className="space-y-2 text-xs">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">College Support</h4>
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
              <span>Campus Innovation Center, Wing B, University Drive</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-teal-500 flex-shrink-0" />
              <span>events@apex.edu</span>
            </div>
            <div className="flex items-center space-x-2 pt-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Bcrypt Passwords & Concurrency-Safe Reservations</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CampusConnect — Full-Stack College Event Management System.</p>
          <p className="text-[11px]">Built with React, Vite, Tailwind CSS, Go (Fiber), PostgreSQL & Docker.</p>
        </div>
      </div>

      {/* Demo Credentials Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-4">
              <KeyRound className="w-5 h-5 text-teal-400" />
              <h3 className="text-lg font-bold text-white">Pre-Seeded Demo Accounts</h3>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Use these seeded accounts for instant evaluation and testing of both Teacher and Student capabilities.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-teal-400">Teacher / Organizer</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 font-semibold">Teacher Role</span>
                </div>
                <div><span className="text-slate-400">Email:</span> <code className="text-teal-200">teacher@college.edu</code></div>
                <div><span className="text-slate-400">Password:</span> <code className="text-teal-200">Password123!</code></div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-teal-400">Student Account 1</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-semibold">Student Role</span>
                </div>
                <div><span className="text-slate-400">Email:</span> <code className="text-teal-200">alex.student@college.edu</code></div>
                <div><span className="text-slate-400">Password:</span> <code className="text-teal-200">Password123!</code></div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-teal-400">Student Account 2</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-semibold">Student Role</span>
                </div>
                <div><span className="text-slate-400">Email:</span> <code className="text-teal-200">priya.student@college.edu</code></div>
                <div><span className="text-slate-400">Password:</span> <code className="text-teal-200">Password123!</code></div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDemoModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

