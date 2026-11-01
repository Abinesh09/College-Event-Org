import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart2, ArrowLeft, Users, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import { EventStatistics } from '../types';
import { StatCharts } from '../components/StatCharts';

export const EventStatsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [stats, setStats] = useState<EventStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.getEventStatistics(id);
      if (res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load event statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [id]);

  const handleExportCSV = async () => {
    if (!id || !stats) return;
    try {
      await api.exportEventParticipantsCSV(id, stats.event_title);
    } catch (err: any) {
      setError(err.message || 'Export failed');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to={`/teacher/events/${id}/participants`}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Participants Roster
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Demographic Analytics: {stats?.event_title || 'Event'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated participant distribution by department, academic year, and gender representation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/teacher/events/${id}/participants`}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm flex items-center"
          >
            <Users className="w-4 h-4 mr-1.5 text-teal-600" />
            View Student Roster
          </Link>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm flex items-center"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {stats && <StatCharts stats={stats} />}
    </div>
  );
};

