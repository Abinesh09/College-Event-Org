import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserCheck, AlertCircle, BookOpen, Lock, Mail, Building2, Hash, Calendar, Phone, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Event } from '../types';

export const StudentRegisterPage: React.FC = () => {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const eventId = searchParams.get('eventId');
  const redirectParam = searchParams.get('redirect');

  const [targetEvent, setTargetEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    college_name: 'Apex Institute of Technology',
    student_id: '',
    department: 'Computer Science',
    year_of_study: '1st Year',
    age: '',
    gender: 'Prefer not to say',
    phone_number: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (eventId) {
      api.getEvent(eventId)
        .then((res) => {
          if (res.data) {
            setTargetEvent(res.data);
          }
        })
        .catch((err) => {
          console.warn('Could not prefetch target event', err);
        });
    }
  }, [eventId]);

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
    'Biotechnology',
    'Business Administration',
    'Physical Education',
    'Other',
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate (PG)'];

  const genders = ['Male', 'Female', 'Non-Binary', 'Prefer not to say'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.full_name.trim() || !formData.email.trim() || !formData.password) {
      setError('Full name, email, and password are required.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.college_name.trim() || !formData.student_id.trim()) {
      setError('College name and Student ID/Roll number are required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        ...formData,
        age: formData.age ? parseInt(formData.age, 10) : undefined,
      };

      await registerStudent(payload);

      // If registered from an event link, automatically register for that event!
      if (eventId) {
        try {
          await api.registerForEvent(eventId);
          navigate(`/events/${eventId}`, {
            state: {
              successMsg: `🎉 Welcome ${formData.full_name}! Your student account was created and your seat for "${targetEvent?.title || 'the event'}" is confirmed!`,
            },
          });
          return;
        } catch (regErr: any) {
          navigate(`/events/${eventId}`, {
            state: {
              errorMsg: regErr.message || 'Account created, but seat reservation could not be completed.',
            },
          });
          return;
        }
      }

      if (redirectParam) {
        navigate(redirectParam);
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-700 px-6 sm:px-8 py-8 text-white">
          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-teal-800/80 text-teal-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Student Portal Onboarding
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Create Student Account</h1>
          <p className="text-sm text-teal-100 mt-2">
            Fill in your academic profile once to register seamlessly for all upcoming college events and workshops.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {targetEvent && (
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5 text-teal-200" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                    One-Step Sign Up & Event Registration
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">{targetEvent.title}</div>
                  <div className="text-xs text-slate-600">
                    {targetEvent.event_date} • {targetEvent.venue} • {targetEvent.available_seats} seats left
                  </div>
                </div>
              </div>
              <div className="self-start sm:self-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Auto-Reserves Seat
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              1. Account Credentials
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Rivera"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@college.edu"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="confirm_password"
                    required
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: College & Academic Details */}
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              2. Academic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College / Institution Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="college_name"
                    required
                    value={formData.college_name}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student ID / Roll Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="student_id"
                    required
                    value={formData.student_id}
                    onChange={handleChange}
                    placeholder="e.g. CS2024-054"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Year of Study <span className="text-red-500">*</span>
                </label>
                <select
                  name="year_of_study"
                  value={formData.year_of_study}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Demographic Information */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                3. Demographic & Contact Details
              </h2>
              <span className="text-[11px] text-slate-500">Used strictly for authorized organizer statistics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  name="age"
                  min="15"
                  max="60"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 21"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                >
                  {genders.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="+1 555-0199"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 transition-all flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {targetEvent ? 'Creating Account & Confirming Seat...' : 'Creating Student Account...'}
                </>
              ) : targetEvent ? (
                `Sign Up & Register for "${targetEvent.title}"`
              ) : (
                'Complete Student Registration'
              )}
            </button>
          </div>

          <p className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
              Sign In here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

