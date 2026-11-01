import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { isTeacher } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Access Restricted</h1>
        <h2 className="text-lg font-bold text-slate-800">Insufficient Role Permissions</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          You do not have the necessary authorization to view this faculty or administrative page. Student accounts cannot access organizer endpoints.
        </p>
        <div className="pt-4 flex items-center justify-center space-x-3">
          <Link
            to={isTeacher ? '/teacher/dashboard' : '/student/dashboard'}
            className="inline-flex items-center px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Go to Your Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

