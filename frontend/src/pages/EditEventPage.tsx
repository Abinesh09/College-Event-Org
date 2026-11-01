import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2, Upload, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { Event } from '../types';

export const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    category: 'Technology',
    event_type: 'technical',
    event_date: '',
    start_time: '',
    end_time: '',
    venue: '',
    organizing_department: '',
    registration_open_at: '',
    registration_deadline: '',
    max_participants: 50,
    eligibility_criteria: '',
    poster_url: '',
    contact_info: '',
    status: 'published',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      try {
        const res = await api.getEvent(id);
        if (res.data) {
          const e = res.data;
          setFormData({
            title: e.title,
            short_description: e.short_description,
            description: e.description,
            category: e.category,
            event_type: e.event_type,
            event_date: e.event_date,
            start_time: e.start_time,
            end_time: e.end_time,
            venue: e.venue,
            organizing_department: e.organizing_department,
            registration_open_at: e.registration_open_at.split('T')[0],
            registration_deadline: e.registration_deadline.split('T')[0],
            max_participants: e.max_participants,
            eligibility_criteria: e.eligibility_criteria || '',
            poster_url: e.poster_url || '',
            contact_info: e.contact_info || '',
            status: e.status,
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load event for editing');
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id]);

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
      const res = await api.uploadPoster(file);
      if (res && res.data && res.data.url) {
        setFormData((prev) => ({ ...prev, poster_url: res.data!.url }));
      }
    } catch (err: any) {
      setError(err.message || 'Poster upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      await api.updateEvent(id, formData);
      setSuccessMsg('Event updated successfully!');
      setTimeout(() => navigate('/teacher/dashboard'), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/teacher/dashboard"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Event</h1>
        <p className="text-sm text-slate-500 mt-1">
          Update event logistics, seating capacity, or publication status.
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

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Event Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description</label>
              <input
                type="text"
                name="short_description"
                required
                value={formData.short_description}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Description</label>
              <textarea
                name="description"
                rows={5}
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none bg-white font-semibold"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity</label>
                <input
                  type="number"
                  name="max_participants"
                  min="1"
                  required
                  value={formData.max_participants}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Date</label>
                <input
                  type="date"
                  name="event_date"
                  required
                  value={formData.event_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                <input
                  type="text"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                <input
                  type="text"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Venue</label>
                <input
                  type="text"
                  name="venue"
                  required
                  value={formData.venue}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Poster URL or Upload</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="poster_url"
                    value={formData.poster_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none"
                  />
                  <label className="cursor-pointer px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors flex items-center">
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    Upload
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex items-center justify-end space-x-3">
          <Link
            to="/teacher/dashboard"
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
