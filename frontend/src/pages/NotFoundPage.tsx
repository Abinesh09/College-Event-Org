import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          The campus page or resource you requested could not be located.
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

