import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, Upload, ArrowLeft, AlertCircle, Sparkles, Image, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    category: 'Technology',
    event_type: 'technical',
    event_date: '',
    start_time: '10:00 AM',
    end_time: '04:00 PM',
    venue: '',
    organizing_department: 'Computer Science',
    registration_open_at: new Date().toISOString().split('T')[0],
    registration_deadline: '',
    max_participants: 50,
    eligibility_criteria: 'Open to all undergraduate and graduate students with valid college ID.',
    poster_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    contact_info: 'Faculty Coordinator (events@apex.edu | Tech Wing Rm 204)',
    status: 'published',
  });

  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'Technology',
    'Robotics',
    'Cultural',
    'AI & Data Science',
    'Sports',
    'Cloud Computing',
    'Business & Entrepreneurship',
    'Design & Media',
    'Other',
  ];

  const eventTypes = [
    'technical',
    'cultural',
    'sports',
    'workshop',
    'seminar',
    'other',
  ];

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Student Cultural Affairs',
    'Physical Education',
    'Management Studies',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'max_participants' ? parseInt(value, 10) || 0 : value,
    }));
    if (error) setError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPoster(true);
      setError(null);
      const res = await api.uploadPoster(file);
      if (res && res.data && res.data.url) {
        setFormData((prev) => ({ ...prev, poster_url: res.data!.url }));
      }
    } catch (err: any) {
      setError(err.message || 'Poster upload failed');
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleSubmit = async (submitStatus: 'draft' | 'published') => {
    setError(null);

    // Form validation
    if (!formData.title.trim() || !formData.short_description.trim() || !formData.description.trim() || !formData.venue.trim()) {
      setError('Title, short description, overview description, and venue are required.');
      return;
    }
    if (!formData.event_date || !formData.registration_deadline) {
      setError('Event date and registration deadline date are required.');
      return;
    }
    if (formData.max_participants <= 0) {
      setError('Maximum participants must be at least 1.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        status: submitStatus,
      };

      const res = await api.createEvent(payload);
      if (res.data?.id) {
        navigate('/teacher/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/teacher/dashboard"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Teacher Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create & Publish College Event</h1>
        <p className="text-sm text-slate-500 mt-1">
          Specify schedule, venue, seat capacity, and registration deadlines for your campus event.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
        {/* Section 1: Basic Information */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            1. Event Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. National Hackathon 2026 or AI Symposium"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Description (Card Teaser) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="short_description"
                required
                value={formData.short_description}
                onChange={handleChange}
                placeholder="Brief 1-2 sentence summary visible in event cards"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Description & Agenda <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                rows={5}
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed outline of activities, rules, guest speakers, and schedule..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type</label>
                <select
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none bg-white capitalize"
                >
                  {eventTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organizing Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="organizing_department"
                  value={formData.organizing_department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none bg-white"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Date, Time & Venue */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            2. Schedule & Location
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="event_date"
                required
                value={formData.event_date}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                placeholder="09:00 AM"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                placeholder="05:00 PM"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Venue Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="venue"
                required
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. Ramanujan Computing Centre & TAG Auditorium, Anna University, Chennai"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Capacity & Registration Deadlines */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            3. Registration Deadlines & Seat Limits
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration Opens
              </label>
              <input
                type="date"
                name="registration_open_at"
                value={formData.registration_open_at}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="registration_deadline"
                required
                value={formData.registration_deadline}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maximum Seats / Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="max_participants"
                min="1"
                max="5000"
                required
                value={formData.max_participants}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Poster & Additional Details */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            4. Poster & Contact Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Poster URL or Upload
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  name="poster_url"
                  value={formData.poster_url}
                  onChange={handleChange}
                  placeholder="https://example.com/poster.jpg"
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
                <label className="cursor-pointer px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center justify-center">
                  <Upload className="w-4 h-4 mr-1.5" />
                  {uploadingPoster ? 'Uploading...' : 'Upload File'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Eligibility Criteria
              </label>
              <input
                type="text"
                name="eligibility_criteria"
                value={formData.eligibility_criteria}
                onChange={handleChange}
                placeholder="e.g. Open to 2nd & 3rd Year CS students"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organizer Contact Info
              </label>
              <input
                type="text"
                name="contact_info"
                value={formData.contact_info}
                onChange={handleChange}
                placeholder="e.g. Prof. K. Anbarasan (+91 98401 11223 | anbarasan@annauniv.edu)"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <Link
            to="/teacher/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('draft')}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('published')}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {submitting ? 'Publishing...' : 'Publish Event'}
          </button>
        </div>
      </div>
    </div>
  );
};
