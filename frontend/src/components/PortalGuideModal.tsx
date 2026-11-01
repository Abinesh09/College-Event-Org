import React, { useState } from 'react';
import { 
  X, Play, Sparkles, CheckCircle2, Users, Calendar, PlusCircle, 
  BarChart2, Download, ArrowRight, ShieldCheck, ChevronRight, Award, 
  BookOpen, Hash, Building2, Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PortalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortalGuideModal: React.FC<PortalGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>('teacher');
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [autoLogging, setAutoLogging] = useState(false);

  if (!isOpen) return null;

  const teacherSteps = [
    {
      title: '1. Secure Faculty Sign-In',
      badge: 'Teacher Portal Authentication',
      desc: 'Teachers log in securely to access organizer privileges. Teacher accounts are restricted and protected from public registration.',
      points: [
        'Demo Login: teacher@college.edu / Password123!',
        'Faculty identity: Prof. K. Anbarasan (Anna University)',
        'Access to full event creation, editing, and analytics privileges',
      ],
      actionLabel: 'Sign In as Demo Teacher',
      actionEmail: 'teacher@college.edu',
    },
    {
      title: '2. Create & Publish College Events',
      badge: 'Event Authoring Suite',
      desc: 'Author comprehensive college events with custom deadlines, participant capacities, eligibility criteria, and poster uploads.',
      points: [
        'Set title, short description, and full agenda overview',
        'Configure Tamil Nadu college venues (e.g. Ramanujan Centre, TAG Auditorium)',
        'Set strict participant limit to prevent overbooking',
        'Save as Draft for future review or Publish directly to make live',
      ],
      actionLabel: 'Go to Event Creation',
      actionPath: '/teacher/events/create',
    },
    {
      title: '3. Track Registrations & View Participant Rosters',
      badge: 'Live Capacity & Roster Management',
      desc: 'Monitor real-time student sign-ups with concurrency safety. View searchable rosters with Tamil Nadu college names, roll numbers, and +91 contact details.',
      points: [
        'Instant live participant count vs available seat capacity',
        'Filter participant roster by department, year of study, and gender',
        'Full student details: College name, Roll No (e.g. 21CS042), and +91 mobile numbers',
      ],
      actionLabel: 'Open Teacher Dashboard',
      actionPath: '/teacher/dashboard',
    },
    {
      title: '4. Demographic Statistics & CSV Export',
      badge: 'Analytics & Reporting',
      desc: 'Gain instant institutional insights with demographic breakdown charts and 1-click Excel CSV export for attendance reporting.',
      points: [
        'Department-wise student distribution pie chart',
        'Academic Year representation (1st Year to PG)',
        'Gender diversity breakdown with optional demographic privacy',
        'One-click Export: Download confirmed participant roster as a CSV file',
      ],
      actionLabel: 'View Dashboard & Analytics',
      actionPath: '/teacher/dashboard',
    },
  ];

  const studentSteps = [
    {
      title: '1. Browse Active Tamil Nadu Campus Events',
      badge: 'Events Directory',
      desc: 'Explore upcoming state hackathons, robotics wars, cultural symposiums, and athletic championships hosted by top Tamil Nadu institutions.',
      points: [
        'Filter by Category (Technology, AI, Robotics, Cultural, Sports)',
        'Filter by Department & Event Type (Workshop, Seminar, Technical)',
        'View live seat availability (e.g. 45 seats remaining)',
        'Check deadlines and eligibility criteria before registering',
      ],
      actionLabel: 'Explore Events Directory',
      actionPath: '/events',
    },
    {
      title: '2. One-Step Sign-Up & Event Registration',
      badge: 'Quick Registration',
      desc: 'Register seamlessly using your academic credentials. Fill in your Tamil Nadu college, Roll No, and 10-digit mobile number (+91).',
      points: [
        'Choose your institution (Anna University, PSG Tech, MIT, TCE, SSN, etc.)',
        'Enter 10-digit mobile number with standard +91 Indian format',
        'One-step convenience: Sign up and confirm your seat in one single click',
        'Already have an account? Sign in and register with 1 click',
      ],
      actionLabel: 'Register Student Account',
      actionPath: '/register',
    },
    {
      title: '3. Real-Time Concurrency Seat Reservation',
      badge: 'Safe Booking Guarantee',
      desc: 'The backend uses PostgreSQL row-level locking (SELECT ... FOR UPDATE) to ensure seats are strictly reserved without overbooking or duplicate registrations.',
      points: [
        'Duplicate registration protection: Each student can register once per event',
        'Strict seat limit enforcement: When capacity reaches max, status shifts to "Full"',
        'Instant registration confirmation with digital ticket badge',
      ],
      actionLabel: 'Try Quick Student Demo',
      actionEmail: 'alex.student@college.edu',
    },
    {
      title: '4. My Registrations & Seat Cancellation',
      badge: 'Student Portal & Pass',
      desc: 'Review all your registered workshops and symposiums in one centralized portal. Cancel your registration anytime before deadline to release your seat for peers.',
      points: [
        'View upcoming event schedule, venue location, and contact numbers',
        'Track active vs completed events',
        'Flexible cancellation: release your reserved seat if your plans change',
      ],
      actionLabel: 'View My Registrations',
      actionPath: '/student/registrations',
    },
  ];

  const currentSteps = activeTab === 'teacher' ? teacherSteps : studentSteps;
  const step = currentSteps[currentStep] || currentSteps[0];

  const handleActionClick = async () => {
    if (step.actionEmail) {
      try {
        setAutoLogging(true);
        await login(step.actionEmail, 'Password123!');
        onClose();
        if (activeTab === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } catch (err) {
        console.error('Demo auto-login error', err);
      } finally {
        setAutoLogging(false);
      }
    } else if (step.actionPath) {
      onClose();
      navigate(step.actionPath);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header Bar */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-teal-500/20">
              <Play className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold tracking-tight">CampusConnect Interactive Walkthrough Guide</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                  Tamil Nadu Edition
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Step-by-step role guide for Teachers (Event Organizers) & Students (Registrants)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => { setActiveTab('teacher'); setCurrentStep(0); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'teacher'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Teacher / Organizer Guide</span>
            </button>
            <button
              onClick={() => { setActiveTab('student'); setCurrentStep(0); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'student'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Student / Participant Guide</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
            Step {currentStep + 1} of {currentSteps.length}
          </span>
        </div>

        {/* Guide Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Step Pill Header */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-600" />
              {step.badge}
            </span>

            {/* Step navigation dots */}
            <div className="flex items-center space-x-1.5">
              {currentSteps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentStep
                      ? activeTab === 'teacher' ? 'bg-purple-600 w-6' : 'bg-teal-600 w-6'
                      : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                  title={`Go to step ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">
              {step.title}
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {step.desc}
            </p>
          </div>

          {/* Key Checklist / Points */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Key Workflow Checklist:
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              {step.points.map((pt, i) => (
                <li key={i} className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-normal">{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Context Card */}
          <div className="p-4 rounded-xl border border-teal-100 bg-teal-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3 text-slate-700">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                🇮🇳
              </div>
              <div>
                <span className="font-bold text-slate-900">Tamil Nadu College Integration:</span>
                <p className="text-slate-600 text-[11px]">
                  Anna University, PSG Tech, MIT Chromepet, TCE Madurai, SSN & 10-digit mobile numbers with +91.
                </p>
              </div>
            </div>

            <button
              onClick={handleActionClick}
              disabled={autoLogging}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center space-x-1.5 flex-shrink-0 ${
                activeTab === 'teacher' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              <span>{autoLogging ? 'Signing In...' : step.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous Step
          </button>

          <span className="text-xs text-slate-500 font-medium">
            {activeTab === 'teacher' ? 'Faculty Mode' : 'Student Mode'}
          </span>

          {currentStep < currentSteps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(currentSteps.length - 1, prev + 1))}
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition-all flex items-center space-x-1 ${
                activeTab === 'teacher' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              <span>Next Step</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all"
            >
              Got it, Enter Portal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
