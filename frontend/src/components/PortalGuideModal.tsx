import React, { useState, useEffect } from 'react';
import { 
  X, Play, Pause, RotateCcw, FastForward, Sparkles, CheckCircle2, Users, Calendar, 
  PlusCircle, BarChart2, Download, ArrowRight, ShieldCheck, ChevronRight, ChevronLeft, 
  Award, BookOpen, Hash, Building2, Phone, Tv
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PortalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortalGuideModal: React.FC<PortalGuideModalProps> = ({ isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState<'video' | 'steps'>('video');
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [videoScene, setVideoScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentStep, setCurrentStep] = useState(0);
  const [autoLogging, setAutoLogging] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Video auto-advance timer
  useEffect(() => {
    let interval: any = null;
    if (isOpen && viewMode === 'video' && isPlaying) {
      interval = setInterval(() => {
        setVideoScene((prev) => (prev < 3 ? prev + 1 : 0));
      }, 7000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isOpen, viewMode, isPlaying, playbackSpeed, activeTab]);

  if (!isOpen) return null;

  // Video Track Scenes Data
  const studentScenes = [
    {
      title: "Scene 1: Browsing Tamil Nadu Campus Events Directory",
      caption: "Students explore state hackathons, workshops, and athletic symposiums hosted by Anna University, PSG Tech, and MIT Chromepet.",
      url: "localhost/events",
      badge: "Discovery",
      preview: (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-white">Campus Events Directory</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-400 rounded-full border border-emerald-800">5 Events Live</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-teal-500/50 shadow-md">
              <span className="text-[10px] font-bold text-teal-400">AI & Data Science</span>
              <div className="font-extrabold text-white text-[11px] mt-0.5">Generative AI Masterclass</div>
              <div className="text-[10px] text-slate-400">Dr. A.P.J. Abdul Kalam Hall, MIT Campus</div>
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-bold">57 seats remaining</span>
                <span className="px-2 py-0.5 bg-teal-600 text-white rounded font-bold">Register</span>
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 opacity-80">
              <span className="text-[10px] font-bold text-purple-400">State Hackathon</span>
              <div className="font-extrabold text-white text-[11px] mt-0.5">InnovateX 2026 Hackathon</div>
              <div className="text-[10px] text-slate-400">Ramanujan Centre, Anna University</div>
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-bold">45 seats remaining</span>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded">View</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Scene 2: Event Details & One-Step Sign-Up Trigger",
      caption: "Guest students view agenda and eligibility. Clicking 'Register for Event (Sign Up)' initiates one-step onboarding.",
      url: "localhost/events/generative-ai",
      badge: "Event Selection",
      preview: (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-base">🤖</div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Generative AI & Agentic Systems Masterclass</h4>
              <p className="text-[10px] text-slate-400">Anna University & MIT Campus, Chromepet, Chennai</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2 rounded-lg text-center text-[11px]">
            <div><span className="text-slate-500 text-[10px] block">Date</span><strong className="text-white">Nov 05</strong></div>
            <div><span className="text-slate-500 text-[10px] block">Capacity</span><strong className="text-teal-400">60 Seats</strong></div>
            <div><span className="text-slate-500 text-[10px] block">Booked</span><strong className="text-emerald-400">3 Seats</strong></div>
          </div>
          <div className="p-2.5 bg-teal-600 text-slate-950 font-extrabold text-xs rounded-lg text-center shadow-md animate-pulse">
            Register for Event (Sign Up) ➔
          </div>
        </div>
      )
    },
    {
      title: "Scene 3: Pre-Linked Onboarding Form (+91 Mobile & TN College)",
      caption: "Student selects Anna University, enters Roll No (21CS042), and valid 10-digit mobile number with +91 format.",
      url: "localhost/register?eventId=738c9aa1",
      badge: "Account & Seat Booking",
      preview: (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-2.5 text-xs">
          <div className="p-2 bg-teal-950/80 border border-teal-800 rounded text-[11px] text-teal-300 font-bold flex items-center justify-between">
            <span>✨ One-Step Auto-Seat Reservation</span>
            <span className="text-emerald-400 font-mono">MIT Masterclass</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-left">
            <div>
              <span className="text-[10px] text-slate-400">Full Name</span>
              <div className="p-1 bg-slate-950 border border-slate-800 rounded text-teal-300 font-mono text-[11px]">Karthik Raja</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">College (Tamil Nadu)</span>
              <div className="p-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-[11px] truncate">Anna University (CEG)</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Student Roll No</span>
              <div className="p-1 bg-slate-950 border border-slate-800 rounded text-teal-300 font-mono text-[11px] font-bold">21CS042</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Mobile Number (+91)</span>
              <div className="p-1 bg-slate-950 border border-slate-800 rounded text-emerald-400 font-mono text-[11px] font-bold">🇮🇳 +91 98401 23456</div>
            </div>
          </div>
          <div className="p-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-extrabold text-xs rounded text-center shadow-md">
            Sign Up & Confirm Seat in One Step
          </div>
        </div>
      )
    },
    {
      title: "Scene 4: Concurrency Seat Confirmation & Digital Pass",
      caption: "PostgreSQL row-level locking reserves seat safely. Student receives digital ticket badge with flexible cancellation option.",
      url: "localhost/student/registrations",
      badge: "Confirmation & Ticket",
      preview: (
        <div className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl p-4 shadow-xl space-y-2.5 text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>🎉 Registration Confirmed! Seat Reserved (Pass #TN-2026-042)</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-extrabold text-white">Generative AI Masterclass</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Attendee: Karthik Raja (21CS042) • +91 98401 23456</div>
              <div className="text-[10px] text-teal-400 mt-1">MIT Campus, Chromepet, Chennai</div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30">Confirmed</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>Change of schedule?</span>
            <span className="text-rose-400 font-semibold cursor-pointer underline">Cancel Registration</span>
          </div>
        </div>
      )
    }
  ];

  const teacherScenes = [
    {
      title: "Scene 1: Faculty Authentication (Anna University)",
      caption: "Prof. K. Anbarasan signs into the Faculty Management Suite with role-based access control.",
      url: "localhost/login",
      badge: "Faculty Authentication",
      preview: (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 text-center">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold mx-auto">🎓</div>
          <div>
            <h4 className="text-xs font-extrabold text-white">Faculty Organizer Authentication</h4>
            <p className="text-[10px] text-slate-400">Anna University Organizer Portal</p>
          </div>
          <div className="p-2 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs flex items-center justify-between">
            <span>teacher@college.edu</span>
            <span className="text-purple-400 font-bold">Prof. K. Anbarasan</span>
          </div>
          <div className="p-2 bg-purple-600 text-white font-extrabold text-xs rounded shadow-md">
            Enter Faculty Suite
          </div>
        </div>
      )
    },
    {
      title: "Scene 2: Event Creator & Capacity Management",
      caption: "Faculty creates Tamil Nadu State Hackathon with Ramanujan Centre venue, 50-student cap, and poster upload.",
      url: "localhost/teacher/events/create",
      badge: "Event Publishing",
      preview: (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-bold text-white">Publish New College Event</span>
            <span className="text-teal-400 font-mono text-[10px]">Draft ➔ Published</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-left">
            <div>
              <span className="text-[10px] text-slate-400">Event Title</span>
              <div className="p-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-[11px] truncate font-semibold">InnovateX 2026 Hackathon</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Venue (Tamil Nadu)</span>
              <div className="p-1 bg-slate-950 border border-slate-800 rounded text-teal-300 text-[10px] truncate">Ramanujan Computing Centre, Anna Univ</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Seat Limit</span>
              <div className="p-1 bg-slate-950 border border-slate-800 rounded text-purple-400 font-bold text-[11px]">50 Students Max</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Faculty Contact</span>
              <div className="p-1 bg-slate-950 border border-slate-800 rounded text-emerald-400 text-[10px] font-mono">+91 98401 11223</div>
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1 p-1.5 bg-slate-800 text-slate-300 font-bold text-[11px] rounded text-center">Save Draft</div>
            <div className="flex-1 p-1.5 bg-teal-600 text-slate-950 font-bold text-[11px] rounded text-center shadow-md">Publish Event</div>
          </div>
        </div>
      )
    },
    {
      title: "Scene 3: Real-Time Roster with Roll No & +91 Mobile",
      caption: "Faculty monitors confirmed student attendees with college names, roll numbers (21CS042), and +91 contact details.",
      url: "localhost/teacher/events/participants",
      badge: "Attendee Rosters",
      preview: (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-2 text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-bold text-white">Participants (InnovateX Hackathon)</span>
            <span className="font-mono text-purple-400 font-bold text-[11px]">5 / 50 Confirmed Seats</span>
          </div>
          <div className="space-y-1.5 text-left">
            <div className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center justify-between text-[11px]">
              <div>
                <strong className="text-white">Karthik Raja</strong>
                <span className="text-slate-400 text-[10px] ml-1.5">Anna Univ (CEG) • Roll: 21CS042</span>
              </div>
              <span className="text-emerald-400 font-mono text-[10px]">+91 98401 23456</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center justify-between text-[11px]">
              <div>
                <strong className="text-white">Priya Natarajan</strong>
                <span className="text-slate-400 text-[10px] ml-1.5">PSG Tech • Roll: 717822P118</span>
              </div>
              <span className="text-emerald-400 font-mono text-[10px]">+91 97890 12345</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Scene 4: Demographic Analytics & 1-Click CSV Export",
      caption: "View department distribution, academic year representation, and export complete student roster as an Excel-ready CSV.",
      url: "localhost/teacher/events/stats",
      badge: "Analytics & Export",
      preview: (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-bold text-white">Registration Analytics & Reporting</span>
            <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 font-bold rounded border border-teal-500/30 text-[10px]">
              ⬇ Download CSV
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <span className="text-slate-500 block">Top Department</span>
              <strong className="text-teal-400 text-[11px]">Comp. Science (60%)</strong>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <span className="text-slate-500 block">Leading Batch</span>
              <strong className="text-purple-400 text-[11px]">3rd Year (50%)</strong>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <span className="text-slate-500 block">Gender Ratio</span>
              <strong className="text-emerald-400 text-[11px]">F 40% / M 60%</strong>
            </div>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div className="bg-teal-500 h-full w-[60%]"></div>
            <div className="bg-purple-500 h-full w-[25%]"></div>
            <div className="bg-amber-500 h-full w-[15%]"></div>
          </div>
        </div>
      )
    }
  ];

  const scenes = activeTab === 'student' ? studentScenes : teacherScenes;
  const activeScene = scenes[videoScene] || scenes[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-950 text-slate-100 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-800 overflow-hidden my-6 flex flex-col">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-teal-500/20">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white">CampusConnect Interactive Video Guide</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                  Tamil Nadu Edition
                </span>
              </div>
              <p className="text-xs text-slate-400">Complete walkthrough for Student & Teacher portal workflows</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="/CampusConnect_Walkthrough_Video.html"
              download="CampusConnect_Walkthrough_Video.html"
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 rounded-lg text-xs font-bold transition-all shadow-sm"
              title="Download Offline Video Walkthrough File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download Video</span>
            </a>

            {/* Mode Switcher */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1">
              <button
                onClick={() => { setActiveTab('student'); setVideoScene(0); }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'student' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                🎓 Student Side
              </button>
              <button
                onClick={() => { setActiveTab('teacher'); setVideoScene(0); }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'teacher' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                👨‍🏫 Teacher Side
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Display Screen */}
        <div className="relative bg-slate-950 aspect-video w-full flex flex-col justify-between overflow-hidden border-b border-slate-800">
          
          {/* Browser Address Bar Inside Video */}
          <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-500">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-md px-3 py-0.5 text-[11px] text-teal-300 font-mono max-w-sm w-full mx-2 truncate flex items-center space-x-1">
              <span className="text-slate-500">https://</span>
              <span>{activeScene.url}</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">{activeScene.badge}</span>
          </div>

          {/* Video Content Stage */}
          <div className="flex-1 p-6 flex flex-col justify-center items-center">
            {activeScene.preview}
          </div>

          {/* Caption & Subtitle Bar */}
          <div className="px-6 py-3 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-[10px] border border-teal-500/30 mt-0.5">
                CC
              </div>
              <div>
                <p className="text-xs font-bold text-teal-400 uppercase tracking-wide">{activeScene.title}</p>
                <p className="text-xs text-slate-200 mt-0.5">{activeScene.caption}</p>
              </div>
            </div>

            <div className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              Scene {videoScene + 1} / {scenes.length}
            </div>
          </div>
        </div>

        {/* Video Player Control Bar */}
        <div className="px-6 py-4 bg-slate-900 flex flex-col space-y-3">
          {/* Timeline Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer" onClick={() => setVideoScene((prev) => (prev + 1) % scenes.length)}>
            <div 
              className={`h-full rounded-full transition-all duration-300 ${activeTab === 'teacher' ? 'bg-purple-500' : 'bg-teal-500'}`}
              style={{ width: `${((videoScene + 1) / scenes.length) * 100}%` }}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-950 font-bold shadow-md transition-all ${
                  activeTab === 'teacher' ? 'bg-purple-400 hover:bg-purple-300' : 'bg-teal-400 hover:bg-teal-300'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={() => setVideoScene((prev) => (prev > 0 ? prev - 1 : scenes.length - 1))}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                title="Previous Scene"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setVideoScene((prev) => (prev < scenes.length - 1 ? prev + 1 : 0))}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                title="Next Scene"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setVideoScene(0)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                title="Restart Walkthrough"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scene Selection Pills */}
            <div className="flex items-center space-x-1.5">
              {scenes.map((sc, i) => (
                <button
                  key={i}
                  onClick={() => setVideoScene(i)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    i === videoScene
                      ? activeTab === 'teacher' ? 'bg-purple-600 text-white font-bold' : 'bg-teal-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-950/60'
                  }`}
                >
                  Step {i + 1}
                </button>
              ))}
            </div>

            {/* Speed control */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-slate-400">Speed:</span>
              <button
                onClick={() => setPlaybackSpeed((s) => (s === 1.0 ? 1.5 : s === 1.5 ? 2.0 : 1.0))}
                className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-mono text-[11px] border border-slate-700"
              >
                {playbackSpeed.toFixed(1)}x
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
