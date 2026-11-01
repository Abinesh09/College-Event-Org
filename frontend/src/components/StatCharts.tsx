import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { EventStatistics } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface StatChartsProps {
  stats: EventStatistics;
}

export const StatCharts: React.FC<StatChartsProps> = ({ stats }) => {
  // 1. Department Breakdown
  const deptLabels = stats.by_department?.map((d) => d.label) || [];
  const deptCounts = stats.by_department?.map((d) => d.count) || [];

  const deptData = {
    labels: deptLabels.length > 0 ? deptLabels : ['No data yet'],
    datasets: [
      {
        label: 'Registrations',
        data: deptCounts.length > 0 ? deptCounts : [0],
        backgroundColor: 'rgba(13, 148, 136, 0.8)',
        borderColor: 'rgb(13, 148, 136)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // 2. Year Breakdown
  const yearLabels = stats.by_year?.map((y) => y.label) || [];
  const yearCounts = stats.by_year?.map((y) => y.count) || [];

  const yearData = {
    labels: yearLabels.length > 0 ? yearLabels : ['No data yet'],
    datasets: [
      {
        label: 'Registrations',
        data: yearCounts.length > 0 ? yearCounts : [0],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // 3. Gender Breakdown
  const genderLabels = stats.by_gender?.map((g) => g.label) || [];
  const genderCounts = stats.by_gender?.map((g) => g.count) || [];

  const genderData = {
    labels: genderLabels.length > 0 ? genderLabels : ['No data yet'],
    datasets: [
      {
        data: genderCounts.length > 0 ? genderCounts : [1],
        backgroundColor: [
          'rgba(14, 165, 233, 0.85)',
          'rgba(236, 72, 153, 0.85)',
          'rgba(168, 85, 247, 0.85)',
          'rgba(100, 116, 139, 0.85)',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // 4. Over Time
  const timeLabels = stats.over_time?.map((t) => t.date) || [];
  const timeCounts = stats.over_time?.map((t) => t.count) || [];

  const timelineData = {
    labels: timeLabels.length > 0 ? timeLabels : ['No data'],
    datasets: [
      {
        fill: true,
        label: 'Daily Registrations',
        data: timeCounts.length > 0 ? timeCounts : [0],
        borderColor: 'rgb(13, 148, 136)',
        backgroundColor: 'rgba(13, 148, 136, 0.15)',
        tension: 0.35,
        pointBackgroundColor: 'rgb(13, 148, 136)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 12, font: { size: 12 } },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Top metrics bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Confirmed Attendees
          </div>
          <div className="text-3xl font-extrabold text-teal-600">
            {stats.total_registrations}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Out of maximum {stats.max_participants} capacity
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Capacity Filled
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats.capacity_percentage.toFixed(1)}%
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full"
              style={{ width: `${Math.min(100, stats.capacity_percentage)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Available Seats Left
          </div>
          <div className="text-3xl font-extrabold text-slate-800">
            {Math.max(0, stats.max_participants - stats.total_registrations)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.max_participants - stats.total_registrations <= 0 ? 'Event is currently full' : 'Open for registration'}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 mr-2"></span>
            Registrations by Department
          </h4>
          <div className="h-64">
            <Bar data={deptData} options={chartOptions} />
          </div>
        </div>

        {/* Academic Year Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-2"></span>
            Registrations by Academic Year
          </h4>
          <div className="h-64">
            <Bar data={yearData} options={chartOptions} />
          </div>
        </div>

        {/* Gender Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 mr-2"></span>
            Gender Representation (Aggregated)
          </h4>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={genderData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' },
                },
              }}
            />
          </div>
        </div>

        {/* Registration Timeline */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 mr-2"></span>
            Registration Activity Over Time
          </h4>
          <div className="h-64">
            <Line data={timelineData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};
