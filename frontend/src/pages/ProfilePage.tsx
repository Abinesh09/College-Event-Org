import React, { useState } from 'react';
import { User, Mail, Building2, Hash, Phone, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export const ProfilePage: React.FC = () => {
  const { user, isStudent, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    college_name: user?.profile?.college_name || '',
    department: user?.profile?.department || '',
    year_of_study: user?.profile?.year_of_study || '',
    age: user?.profile?.age?.toString() || '',
    gender: user?.profile?.gender || 'Prefer not to say',
    phone_number: user?.profile?.phone_number || '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
    'Biotechnology',
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
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await api.updateProfile({
        ...formData,
        age: formData.age ? parseInt(formData.age, 10) : undefined,
      });
      await refreshUser();
      setSuccessMsg('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review and manage your institutional identity and contact preferences.
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 sm:px-8 py-8 text-white flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-500 text-slate-900 flex items-center justify-center font-extrabold text-2xl shadow-lg">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.full_name}</h2>
            <div className="flex items-center space-x-2 text-xs text-slate-300 mt-1">
              <Mail className="w-3.5 h-3.5 text-teal-400" />
              <span>{user?.email}</span>
              <span>•</span>
              <span className="font-semibold uppercase tracking-wider text-teal-400 px-2 py-0.5 rounded bg-teal-950/60 border border-teal-800">
                {user?.role} Role
              </span>
            </div>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed"
              />
            </div>

            {isStudent && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">College Name</label>
                  <input
                    type="text"
                    name="college_name"
                    value={formData.college_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID / Roll No</label>
                  <input
                    type="text"
                    disabled
                    value={user?.profile?.student_id || ''}
                    className="w-full px-3 py-2 text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year of Study</label>
                  <select
                    name="year_of_study"
                    value={formData.year_of_study}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    min="15"
                    max="65"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    {genders.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </>
            )}
          </div>

          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1.5" />
              <span>Password securely hashed with Bcrypt</span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

