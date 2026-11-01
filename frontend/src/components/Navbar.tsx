import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User as UserIcon, LogOut, PlusCircle, BookmarkCheck, LayoutDashboard, Sparkles, Menu, X, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PortalGuideModal } from './PortalGuideModal';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isTeacher, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:bg-teal-700 transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                  Campus<span className="text-teal-600">Connect</span>
                </span>
                <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Event Management Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            <Link
              to="/events"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Browse Events
            </Link>

            {isAuthenticated && isStudent && (
              <>
                <Link
                  to="/student/dashboard"
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center"
                >
                  <LayoutDashboard className="w-4 h-4 mr-1.5 text-teal-600" />
                  Student Portal
                </Link>
                <Link
                  to="/student/registrations"
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center"
                >
                  <BookmarkCheck className="w-4 h-4 mr-1.5 text-teal-600" />
                  My Registrations
                </Link>
              </>
            )}

            {isAuthenticated && isTeacher && (
              <>
                <Link
                  to="/teacher/dashboard"
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center"
                >
                  <LayoutDashboard className="w-4 h-4 mr-1.5 text-teal-600" />
                  Teacher Dashboard
                </Link>
                <Link
                  to="/teacher/events/create"
                  className="px-3 py-2 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex items-center border border-teal-200"
                >
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Create Event
                </Link>
              </>
            )}
          </nav>

          {/* Right Section / Auth Controls */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => setGuideOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors shadow-sm"
              title="Open Role Guide Walkthrough"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Portal Guide</span>
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-teal-700 flex items-center justify-center font-bold text-xs uppercase">
                    {user.full_name.charAt(0)}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user.full_name}
                    </p>
                    <span
                      className={`inline-block font-semibold uppercase text-[10px] px-1.5 rounded ${
                        user.role === 'teacher'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm"
                >
                  Student Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => { setMobileMenuOpen(false); setGuideOpen(true); }}
            className="w-full text-center py-2 px-3 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Portal Guide</span>
          </button>

          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-teal-700"
          >
            Browse Events
          </Link>

          {isAuthenticated && isStudent && (
            <>
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-700 hover:text-teal-700"
              >
                Student Portal
              </Link>
              <Link
                to="/student/registrations"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-700 hover:text-teal-700"
              >
                My Registrations
              </Link>
            </>
          )}

          {isAuthenticated && isTeacher && (
            <>
              <Link
                to="/teacher/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-700 hover:text-teal-700"
              >
                Teacher Dashboard
              </Link>
              <Link
                to="/teacher/events/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-teal-700"
              >
                + Create Event
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2"
              >
                <UserIcon className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-semibold text-slate-800">{user?.full_name}</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center text-sm font-medium text-red-600"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-white bg-teal-600 rounded-lg"
              >
                Student Register
              </Link>
            </div>
          )}
        </div>
      )}
      {/* Role Walkthrough Guide Modal */}
      <PortalGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </header>
  );
};

