import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertTriangle,
  ArrowRight,
  Lock,
  Mail,
  UserCheck,
  ChevronRight,
  Sun,
  Moon,
  Landmark,
  FileCheck2,
  HelpCircle,
  Shield
} from 'lucide-react';
import { 
  auth, 
  onAuthStateChanged, 
  FirebaseUser 
} from './firebase-config';
import { 
  fetchUserProfile, 
  registerStudent, 
  registerAdmin, 
  loginWithRole, 
  logoutUser, 
  requestPasswordReset 
} from './auth-service';
import { seedInitialCampusData } from './seed-data';
import { UserProfile, Role, AdminRole } from './types';
import StudentPortal from './components/StudentPortal';
import AdminPortal from './components/AdminPortal';
import { ThemeProvider, useTheme } from './ThemeContext';

function AppContent() {
  const { isDark, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Navigation state: 'landing' | 'student-login' | 'admin-login' | 'student-register' | 'admin-register' | 'forgot-password'
  const [view, setView] = useState<'landing' | 'student-login' | 'admin-login' | 'student-register' | 'admin-register' | 'forgot-password'>('landing');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('3rd Year');
  const [semester, setSemester] = useState('5th Semester');
  const [phone, setPhone] = useState('');
  const [adminHierarchy, setAdminHierarchy] = useState<AdminRole>('Faculty/Staff');

  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Listen to auth state and initialize admin campus data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const profile = await fetchUserProfile(user.uid);
          setCurrentUser(profile);
          if (profile && profile.role === 'admin') {
            seedInitialCampusData(profile);
          }
        } catch (e) {
          console.warn('Auth user profile resolution:', e);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Quick Demo Account Auto-Fill Helper
  const handleQuickDemo = (role: Role, hierarchy?: AdminRole) => {
    if (role === 'student') {
      setEmail('student.demo@campus.edu');
      setPassword('Campus@2026');
      setName('Alex Rivera');
      setStudentId('21CS042');
      setDepartment('Computer Science & Engineering');
    } else {
      setEmail('admin.principal@campus.edu');
      setPassword('Admin@2026');
      setName('Dr. Robert Sterling');
      setAdminHierarchy(hierarchy || 'Principal');
      setDepartment('Administration');
    }
    setAuthError(null);
  };

  const handleLogin = async (e: React.FormEvent, requiredRole: Role) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setSubmitting(true);

    try {
      const { profile } = await loginWithRole(email, password, requiredRole);
      setCurrentUser(profile);
      setAuthSuccess(`Authorized access granted: Welcome ${profile.name}`);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication rejected. Please check official credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setSubmitting(true);

    try {
      const profile = await registerStudent({
        email,
        password,
        name,
        studentId,
        department,
        year,
        semester,
        phone
      });
      setCurrentUser(profile);
      setAuthSuccess('Student profile registered in Firestore. Verification notice dispatched.');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setSubmitting(true);

    try {
      const profile = await registerAdmin({
        email,
        password,
        name,
        adminHierarchy,
        department,
        phone
      });
      setCurrentUser(profile);
      setAuthSuccess(`Admin registered under hierarchy authority: ${adminHierarchy}`);
    } catch (err: any) {
      setAuthError(err.message || 'Administrator registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthError('Please enter your registered institutional email.');
      return;
    }
    setSubmitting(true);
    setAuthError(null);
    try {
      await requestPasswordReset(email);
      setAuthSuccess(`Password recovery email dispatched to ${email}`);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to dispatch password recovery request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setView('landing');
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-[#0b0f19] text-slate-200' : 'bg-slate-100 text-slate-800'}`}>
        <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="font-serif-title tracking-wider text-sm font-semibold uppercase text-slate-400">Verifying Institutional Registry</div>
        <p className="text-xs text-slate-500 mt-1">Connecting to Campus Life Cloud Database...</p>
      </div>
    );
  }

  // If user is authenticated, route strictly by role
  if (currentUser) {
    if (currentUser.role === 'student') {
      return (
        <StudentPortal 
          user={currentUser} 
          onLogout={handleLogout} 
        />
      );
    } else if (currentUser.role === 'admin') {
      return (
        <AdminPortal 
          user={currentUser} 
          onLogout={handleLogout} 
        />
      );
    }
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isDark 
        ? 'bg-[#0b0f19] text-slate-100' 
        : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Top Institutional Header */}
      <header className={`border-b sticky top-0 z-50 transition-colors backdrop-blur-md ${
        isDark 
          ? 'bg-[#0f172a]/95 border-slate-800 text-white' 
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div 
            onClick={() => setView('landing')} 
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center border transition ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-indigo-400 group-hover:border-indigo-500' 
                : 'bg-slate-900 border-slate-800 text-white group-hover:bg-slate-800'
            }`}>
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-title font-bold text-base sm:text-lg tracking-wider">
                  CAMPUS LIFE
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-2">
                  EST. 2026
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Institutional Academic & Administrative Management Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Theme Switcher Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Daytime Professional Light Mode" : "Switch to Executive Dark Mode"}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-800' 
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
              <span className="hidden sm:inline text-[11px] font-semibold">{isDark ? 'Light' : 'Dark'}</span>
            </button>

            {/* Portal Selectors */}
            <button
              onClick={() => { setView('student-login'); setAuthError(null); setAuthSuccess(null); }}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition flex items-center gap-2 cursor-pointer ${
                view === 'student-login' || view === 'student-register'
                  ? isDark 
                    ? 'bg-indigo-600 border-indigo-500 text-white' 
                    : 'bg-indigo-700 border-indigo-700 text-white'
                  : isDark 
                    ? 'border-slate-800 text-slate-300 hover:bg-slate-800/80' 
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal</span>
            </button>

            <button
              onClick={() => { setView('admin-login'); setAuthError(null); setAuthSuccess(null); }}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition flex items-center gap-2 cursor-pointer ${
                view === 'admin-login' || view === 'admin-register'
                  ? isDark 
                    ? 'bg-slate-800 border-amber-500/80 text-amber-300' 
                    : 'bg-slate-900 border-slate-900 text-white'
                  : isDark 
                    ? 'border-slate-800 text-slate-300 hover:bg-slate-800/80' 
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Administration</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* VIEW 1: LANDING OVERVIEW */}
        {view === 'landing' && (
          <div className="py-4">
            {/* Institutional Hero Banner */}
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
                <span>Accredited Academic Information Architecture</span>
                <span aria-hidden="true">&bull;</span>
                <span>Role-Enforced Security Rules</span>
                <span aria-hidden="true">&bull;</span>
                <span>Active 2026 Session</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Academic Excellence & <br className="hidden sm:inline" />
                <span className={isDark ? 'text-indigo-400 font-serif-title' : 'text-slate-900 font-serif-title'}>
                  Campus Governance Platform
                </span>
              </h1>
              <p className={`mt-4 text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                A single unified portal connecting collegiate students and institutional administrative hierarchy. Manage daily lecture schedules, subject attendance thresholds, hostel maintenance, leave approvals, and competitive exam preparation.
              </p>
            </div>

            {/* Structured Dual Access Portals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-14">
              {/* Student Portal Entry Card */}
              <div className={`rounded-xl border p-8 transition flex flex-col justify-between ${
                isDark 
                  ? 'bg-[#111827] border-slate-800 hover:border-slate-700' 
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${
                      isDark 
                        ? 'bg-indigo-950/60 border-indigo-500/30 text-indigo-400' 
                        : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    }`}>
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      STUDENT ACCESS
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2">Student Academic Portal</h3>
                  <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Access your personalized subject attendance analytics, live daily and weekly timetables, hostel repair helpdesk, formal leave & certificate requests, previous examination papers, and AI exam preparation.
                  </p>

                  <div className={`space-y-2.5 mb-8 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Subject-wise 75% regulatory attendance tracker with early warning alerts</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Hostel maintenance requests with 5-stage transparent repair lifecycle</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>AI Exam Assistant: 21-Question timed mock tests & paper trend analysis</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => { setView('student-login'); setAuthError(null); }}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                      isDark 
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>Sign In to Student Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setView('student-register'); setAuthError(null); }}
                    className={`w-full py-2.5 px-4 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      isDark 
                        ? 'border-slate-800 hover:bg-slate-800/60 text-slate-300' 
                        : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    New Student? Register Campus Profile
                  </button>
                </div>
              </div>

              {/* Administrator Portal Entry Card */}
              <div className={`rounded-xl border p-8 transition flex flex-col justify-between ${
                isDark 
                  ? 'bg-[#111827] border-slate-800 hover:border-slate-700' 
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${
                      isDark 
                        ? 'bg-amber-950/60 border-amber-500/30 text-amber-400' 
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      GOVERNANCE MATRIX
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2">College Administration Portal</h3>
                  <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Institutional hierarchy governance: <strong>Principal &rarr; Dean &rarr; Branch HOD &rarr; Faculty/Staff</strong>. Mark batch attendance, publish timetable modifications, resolve hostel repair tickets, and authorize leaves & certificates.
                  </p>

                  <div className={`space-y-2.5 mb-8 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Hierarchical privilege enforcement backed by Firestore Security Rules</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Live attendance marking by branch, semester, and course subject</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Institutional analytics: Department rates, complaint queues, and trends</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => { setView('admin-login'); setAuthError(null); }}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                      isDark 
                        ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                        : 'bg-amber-700 hover:bg-amber-800 text-white'
                    }`}
                  >
                    <span>Sign In to Admin Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setView('admin-register'); setAuthError(null); }}
                    className={`w-full py-2.5 px-4 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      isDark 
                        ? 'border-slate-800 hover:bg-slate-800/60 text-slate-300' 
                        : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    Register Faculty / Administrative Official
                  </button>
                </div>
              </div>
            </div>

            {/* Institutional Compliance Standards Bar */}
            <div className={`p-6 rounded-xl border max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div>
                <div className="text-xl font-bold font-mono text-indigo-400">75% Min</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Mandatory Attendance</div>
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-emerald-400">Live Sync</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Timetable Dispatches</div>
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-amber-400">5-Stage</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Hostel Helpdesk SLA</div>
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-sky-400">21 Questions</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Timed Mock Exam Engine</div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: STUDENT LOGIN */}
        {view === 'student-login' && (
          <div className="max-w-md mx-auto w-full">
            <div className={`rounded-xl border p-8 shadow-sm ${
              isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="text-center mb-6">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 border ${
                  isDark ? 'bg-indigo-950/60 border-indigo-500/30 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                }`}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Student Portal Login</h2>
                <p className="text-xs text-slate-500 mt-1">Official University Enrollment Access</p>
              </div>

              {/* Demo Pre-fill Pill-less Bar */}
              <div className={`mb-5 p-3 rounded-lg border flex items-center justify-between text-xs ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className="font-semibold text-xs">Evaluator Quick Test</div>
                  <div className="text-[11px] text-slate-500">Auto-fill student demo credentials</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('student')}
                  className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs cursor-pointer transition"
                >
                  Auto-Fill
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{authSuccess}</span>
                </div>
              )}

              <form onSubmit={(e) => handleLogin(e, 'student')} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Campus Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@campus.edu"
                      className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-xs focus:outline-none transition ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' 
                          : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setView('forgot-password')}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-xs focus:outline-none transition ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' 
                          : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  {submitting ? 'Verifying Student Role...' : 'Sign In as Student'}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center space-y-2 text-xs text-slate-500">
                <p>
                  New enrollment?{' '}
                  <button
                    onClick={() => { setView('student-register'); setAuthError(null); }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                  >
                    Register Campus Profile
                  </button>
                </p>
                <p>
                  Administrative official?{' '}
                  <button
                    onClick={() => { setView('admin-login'); setAuthError(null); }}
                    className="text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                  >
                    Access Admin Portal
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ADMIN LOGIN */}
        {view === 'admin-login' && (
          <div className="max-w-md mx-auto w-full">
            <div className={`rounded-xl border p-8 shadow-sm ${
              isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="text-center mb-6">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 border ${
                  isDark ? 'bg-amber-950/60 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">College Administration Login</h2>
                <p className="text-xs text-slate-500 mt-1">Hierarchical Access: Principal &bull; Dean &bull; HOD &bull; Faculty</p>
              </div>

              {/* Demo Pre-fill */}
              <div className={`mb-5 p-3 rounded-lg border flex items-center justify-between text-xs ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className="font-semibold text-xs">Evaluator Quick Test</div>
                  <div className="text-[11px] text-slate-500">Auto-fill Principal demo credentials</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin', 'Principal')}
                  className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs cursor-pointer transition"
                >
                  Auto-Fill
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{authSuccess}</span>
                </div>
              )}

              <form onSubmit={(e) => handleLogin(e, 'admin')} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Administrative Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@campus.edu"
                      className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-xs focus:outline-none transition ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-500' 
                          : 'bg-white border-slate-300 text-slate-900 focus:border-amber-600'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setView('forgot-password')}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-xs focus:outline-none transition ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-500' 
                          : 'bg-white border-slate-300 text-slate-900 focus:border-amber-600'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  {submitting ? 'Verifying Administrative Rights...' : 'Sign In as Administrator'}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center space-y-2 text-xs text-slate-500">
                <p>
                  New faculty registration?{' '}
                  <button
                    onClick={() => { setView('admin-register'); setAuthError(null); }}
                    className="text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                  >
                    Register Authority Account
                  </button>
                </p>
                <p>
                  Enrolled student?{' '}
                  <button
                    onClick={() => { setView('student-login'); setAuthError(null); }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                  >
                    Go to Student Portal
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: STUDENT REGISTRATION */}
        {view === 'student-register' && (
          <div className="max-w-lg mx-auto w-full">
            <div className={`rounded-xl border p-8 shadow-sm ${
              isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="text-center mb-6">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 border ${
                  isDark ? 'bg-indigo-950/60 border-indigo-500/30 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                }`}>
                  <UserCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Student Profile Registration</h2>
                <p className="text-xs text-slate-500 mt-1">Enrollment into Campus Life Database</p>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleStudentRegister} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Enrollment Roll No</label>
                    <input
                      type="text"
                      required
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. 21CS042"
                      className={`w-full border rounded-lg px-3 py-2 font-mono focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Campus Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@campus.edu"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Academic Department / Branch</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Year of Study</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Semester</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                      <option value="3rd Semester">3rd Semester</option>
                      <option value="4th Semester">4th Semester</option>
                      <option value="5th Semester">5th Semester</option>
                      <option value="6th Semester">6th Semester</option>
                      <option value="7th Semester">7th Semester</option>
                      <option value="8th Semester">8th Semester</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Emergency / Contact Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  {submitting ? 'Registering...' : 'Register Student Profile'}
                </button>
              </form>

              <div className="mt-5 text-center text-xs text-slate-500">
                Already registered?{' '}
                <button
                  onClick={() => { setView('student-login'); setAuthError(null); }}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign In instead
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: ADMIN REGISTRATION */}
        {view === 'admin-register' && (
          <div className="max-w-lg mx-auto w-full">
            <div className={`rounded-xl border p-8 shadow-sm ${
              isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="text-center mb-6">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 border ${
                  isDark ? 'bg-amber-950/60 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Register College Authority Official</h2>
                <p className="text-xs text-slate-500 mt-1">Hierarchical Role Assignment</p>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAdminRegister} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Official Name & Academic Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Robert Sterling, Ph.D."
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Administrative Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@campus.edu"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">College Hierarchy Position</label>
                  <select
                    value={adminHierarchy}
                    onChange={(e) => setAdminHierarchy(e.target.value as AdminRole)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Principal">Principal (Overall College Authority)</option>
                    <option value="Dean">Dean (Academic & Student Affairs)</option>
                    <option value="Branch HOD">Branch HOD (Head of Department)</option>
                    <option value="Faculty/Staff">Faculty / Academic Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Administration">Institutional Administration (Principal/Dean)</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  {submitting ? 'Registering...' : 'Register Official'}
                </button>
              </form>

              <div className="mt-5 text-center text-xs text-slate-500">
                Already registered?{' '}
                <button
                  onClick={() => { setView('admin-login'); setAuthError(null); }}
                  className="text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                >
                  Admin Sign In
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: FORGOT PASSWORD */}
        {view === 'forgot-password' && (
          <div className="max-w-md mx-auto w-full">
            <div className={`rounded-xl border p-8 shadow-sm ${
              isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="text-center mb-6">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 border ${
                  isDark ? 'bg-indigo-950/60 border-indigo-500/30 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                }`}>
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Credential Recovery</h2>
                <p className="text-xs text-slate-500 mt-1">Dispatches password recovery instructions</p>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{authSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@campus.edu"
                    className={`w-full border rounded-lg px-3 py-2.5 text-xs focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  {submitting ? 'Sending Instructions...' : 'Send Recovery Link'}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                <button
                  onClick={() => setView('landing')}
                  className="text-slate-600 dark:text-slate-300 hover:underline cursor-pointer"
                >
                  &larr; Return to Campus Home
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Institutional Quiet Footer */}
      <footer className={`border-t py-6 text-center text-xs transition-colors ${
        isDark ? 'bg-[#0f172a] border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif-title font-semibold text-slate-400 tracking-wider">CAMPUS LIFE ERP</span>
            <span aria-hidden="true">&bull;</span>
            <span>Enterprise Academic & Student Management</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Protected by Firebase Authentication &amp; Firestore Security Rules &bull; Session Active
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
