import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  AttendanceRecord, 
  TimetableEntry, 
  HostelComplaint, 
  LeaveRequest, 
  CertificateRequest, 
  CampusNotification, 
  PreviousPaper 
} from '../types';
import { 
  getStudentAttendance, 
  getTimetable, 
  getStudentComplaints, 
  createComplaint, 
  getStudentLeaves, 
  createLeaveRequest, 
  getStudentCertificates, 
  createCertificateRequest, 
  getNotifications, 
  getPreviousPapers 
} from '../campus-service';
import AIAssistantSection from './AIAssistantSection';
import { useTheme } from '../ThemeContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Home,
  FileSpreadsheet,
  Award,
  Bell,
  FolderArchive,
  BrainCircuit,
  LogOut,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  ShieldAlert,
  Sun,
  Moon,
  Landmark,
  FileText,
  User,
  GraduationCap
} from 'lucide-react';

interface Props {
  user: UserProfile;
  onLogout: () => void;
}

export default function StudentPortal({ user, onLogout }: Props) {
  const { isDark, toggleTheme } = useTheme();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'attendance' | 'timetable' | 'complaints' | 'leave' | 'certificate' | 'notifications' | 'papers' | 'ai'
  >('dashboard');

  // Module data
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [complaints, setComplaints] = useState<HostelComplaint[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [certificates, setCertificates] = useState<CertificateRequest[]>([]);
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [papers, setPapers] = useState<PreviousPaper[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & form state
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState<HostelComplaint['category']>('Electrical');
  const [complaintRoom, setComplaintRoom] = useState('B-204');
  const [complaintDesc, setComplaintDesc] = useState('');

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState(user.phone || '');

  const [showCertModal, setShowCertModal] = useState(false);
  const [certType, setCertType] = useState<CertificateRequest['certificateType']>('Bonafide Certificate');
  const [certPurpose, setCertPurpose] = useState('');

  // Paper search & filters
  const [paperSearch, setPaperSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  // Timetable view: 'today' | 'week'
  const [ttView, setTtView] = useState<'today' | 'week'>('today');

  // Message feedback
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [att, tt, comp, lvs, certs, notifs, pps] = await Promise.all([
        getStudentAttendance(user.id),
        getTimetable(user.department),
        getStudentComplaints(user.id),
        getStudentLeaves(user.id),
        getStudentCertificates(user.id),
        getNotifications(user),
        getPreviousPapers()
      ]);
      setAttendance(att);
      setTimetable(tt);
      setComplaints(comp);
      setLeaves(lvs);
      setCertificates(certs);
      setNotifications(notifs);
      setPapers(pps);
    } catch (e) {
      console.error('Error loading student data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  // Attendance metrics calculation
  const totalClasses = attendance.length;
  const presentClasses = attendance.filter(a => a.status === 'Present').length;
  const overallPercentage = totalClasses > 0 
    ? Math.round((presentClasses / totalClasses) * 100) 
    : 78;

  // Group attendance by subject
  const subjectAttendanceMap = attendance.reduce((acc, curr) => {
    if (!acc[curr.subjectName]) {
      acc[curr.subjectName] = { total: 0, present: 0, name: curr.subjectName };
    }
    acc[curr.subjectName].total += 1;
    if (curr.status === 'Present') acc[curr.subjectName].present += 1;
    return acc;
  }, {} as Record<string, { total: number; present: number; name: string }>);

  const subjectList = Object.keys(subjectAttendanceMap).length > 0 
    ? Object.values(subjectAttendanceMap)
    : [
        { name: 'Data Structures & Algorithms', total: 24, present: 20 },
        { name: 'Database Management Systems', total: 22, present: 19 },
        { name: 'Operating Systems', total: 20, present: 14 },
        { name: 'Computer Networks', total: 18, present: 15 },
        { name: 'Artificial Intelligence', total: 20, present: 17 }
      ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const activeDayForToday = daysOfWeek.includes(todayDayName) ? todayDayName : 'Monday';
  const todayLectures = timetable.filter(t => t.day === activeDayForToday && t.published);

  // Handle complaint creation
  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintDesc.trim()) return;
    try {
      await createComplaint({
        studentId: user.id,
        studentName: user.name,
        roomNo: complaintRoom,
        category: complaintCategory,
        description: complaintDesc,
        status: 'Pending'
      });
      setComplaintDesc('');
      setShowComplaintModal(false);
      setFeedback({ message: 'Hostel maintenance ticket registered successfully.', type: 'success' });
      await loadData();
    } catch (e: any) {
      setFeedback({ message: e.message || 'Error submitting complaint', type: 'error' });
    }
  };

  // Handle leave request
  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveFrom || !leaveTo || !leaveReason) return;
    try {
      await createLeaveRequest({
        studentId: user.id,
        studentName: user.name,
        rollNo: user.studentId || '21CS042',
        department: user.department,
        fromDate: leaveFrom,
        toDate: leaveTo,
        reason: leaveReason,
        emergencyContact: emergencyPhone,
        status: 'Pending'
      });
      setLeaveReason('');
      setShowLeaveModal(false);
      setFeedback({ message: 'Leave application submitted to Dean / HOD for administrative review.', type: 'success' });
      await loadData();
    } catch (e: any) {
      setFeedback({ message: e.message || 'Error creating leave application', type: 'error' });
    }
  };

  // Handle certificate request
  const handleCreateCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certPurpose) return;
    try {
      await createCertificateRequest({
        studentId: user.id,
        studentName: user.name,
        rollNo: user.studentId || '21CS042',
        department: user.department,
        certificateType: certType,
        purpose: certPurpose,
        status: 'Pending'
      });
      setCertPurpose('');
      setShowCertModal(false);
      setFeedback({ message: `${certType} request placed in administrative issuance queue.`, type: 'success' });
      await loadData();
    } catch (e: any) {
      setFeedback({ message: e.message || 'Error creating certificate request', type: 'error' });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors ${
      isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 border-r flex flex-col shrink-0 transition-colors ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Brand identity header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-serif-title font-bold text-sm ${
              isDark ? 'bg-indigo-900/60 border border-indigo-700/60 text-indigo-300' : 'bg-slate-900 text-white'
            }`}>
              CL
            </div>
            <div>
              <div className="font-serif-title font-bold text-xs tracking-wider">CAMPUS LIFE</div>
              <div className="text-[10px] text-slate-400 font-mono">STUDENT PORTAL</div>
            </div>
          </div>
        </div>

        {/* Student Credential Summary */}
        <div className={`mx-3 my-3 p-3.5 rounded-lg border text-xs ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="font-semibold truncate">{user.name}</div>
          <div className="text-[11px] text-slate-500 font-mono truncate">{user.studentId || '21CS042'} &bull; {user.department}</div>
          <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">{user.year || '3rd Yr'} / {user.semester || '5th Sem'}</span>
            <span className={`font-mono font-bold ${overallPercentage >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {overallPercentage}% Attd
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-1">
          {[
            { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'attendance', label: 'Attendance (Live)', icon: CalendarCheck, alert: overallPercentage < 75 },
            { id: 'timetable', label: 'Class Timetable', icon: Calendar },
            { id: 'complaints', label: 'Hostel Maintenance', icon: Home, count: complaints.filter(c => c.status === 'Pending').length },
            { id: 'leave', label: 'Leave Requests', icon: FileSpreadsheet, count: leaves.filter(l => l.status === 'Pending').length },
            { id: 'certificate', label: 'Certificate Requests', icon: Award },
            { id: 'notifications', label: 'Campus Notices', icon: Bell, count: notifications.length },
            { id: 'papers', label: 'Previous Exam Papers', icon: FolderArchive },
            { id: 'ai', label: 'AI Study & Mock Test', icon: BrainCircuit, special: true }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setFeedback(null); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? isDark 
                      ? 'bg-slate-800 text-white font-semibold border-l-2 border-indigo-500' 
                      : 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900 shadow-2xs'
                    : item.special
                    ? isDark 
                      ? 'text-indigo-400 hover:bg-slate-800/60' 
                      : 'text-indigo-700 hover:bg-indigo-50/70'
                    : isDark 
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? (isDark ? 'text-indigo-400' : 'text-slate-900') : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.alert && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Attendance below 75%" />
                )}
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className={`p-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top bar */}
        <header className={`h-16 border-b px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md transition-colors ${
          isDark ? 'bg-[#0f172a]/95 border-slate-800' : 'bg-white/95 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Student Portal</span>
            <span className="text-slate-400">/</span>
            <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
              {activeTab === 'ai' ? 'AI Exam Assistant & Mock Engine' : activeTab.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border text-xs font-medium transition cursor-pointer ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
              title="Toggle Light / Dark mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Refresh Data */}
            <button
              onClick={loadData}
              title="Refresh Institutional Records"
              className={`p-2 rounded-lg border text-xs transition cursor-pointer ${
                isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white' : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>

            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold">{user.email}</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                RBAC &bull; Verified Student
              </div>
            </div>
          </div>
        </header>

        {/* Status Notification Banner */}
        {feedback && (
          <div className={`mx-6 mt-4 p-3 rounded-lg text-xs flex items-center justify-between border ${
            feedback.type === 'success' 
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-300' 
              : 'bg-rose-950/20 border-rose-500/40 text-rose-600 dark:text-rose-300'
          }`}>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="text-xs font-semibold underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-6 flex-1 space-y-6 max-w-7xl w-full mx-auto">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Mandatory 75% Attendance Warning (if below threshold) */}
              {overallPercentage < 75 && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  isDark 
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-200' 
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Mandatory Attendance Shortage Alert
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed">
                      Your current aggregate attendance is <strong className="font-mono">{overallPercentage}%</strong>, which is below the university minimum threshold of <strong>75%</strong>. Failure to attend makeup sessions risks examination debarment.
                    </p>
                  </div>
                </div>
              )}

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  onClick={() => setActiveTab('attendance')}
                  className={`p-5 rounded-xl border cursor-pointer transition ${
                    isDark 
                      ? 'bg-[#111827] border-slate-800 hover:border-slate-700' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                    <span>Attendance Rate</span>
                    <CalendarCheck className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-3xl font-bold font-mono tracking-tight mb-1">
                    {overallPercentage}%
                  </div>
                  <div className="text-xs flex items-center justify-between">
                    <span className={overallPercentage >= 75 ? 'text-emerald-500 font-semibold' : 'text-rose-500 font-semibold'}>
                      {overallPercentage >= 75 ? 'Good Standing' : 'Below 75% Criteria'}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{presentClasses}/{totalClasses || 104} sessions</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('timetable')}
                  className={`p-5 rounded-xl border cursor-pointer transition ${
                    isDark 
                      ? 'bg-[#111827] border-slate-800 hover:border-slate-700' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                    <span>Today's Lectures</span>
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-3xl font-bold font-mono tracking-tight mb-1">
                    {todayLectures.length || 4}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    Next: {todayLectures[0]?.subject || 'Data Structures (CS301)'}
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('leave')}
                  className={`p-5 rounded-xl border cursor-pointer transition ${
                    isDark 
                      ? 'bg-[#111827] border-slate-800 hover:border-slate-700' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                    <span>Pending Requests</span>
                    <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-3xl font-bold font-mono tracking-tight mb-1">
                    {leaves.filter(l => l.status === 'Pending').length + certificates.filter(c => c.status === 'Pending').length}
                  </div>
                  <div className="text-xs text-slate-500">
                    {leaves.filter(l => l.status === 'Pending').length} Leaves &bull; {certificates.filter(c => c.status === 'Pending').length} Certs
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('complaints')}
                  className={`p-5 rounded-xl border cursor-pointer transition ${
                    isDark 
                      ? 'bg-[#111827] border-slate-800 hover:border-slate-700' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                    <span>Hostel Helpdesk</span>
                    <Home className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="text-3xl font-bold font-mono tracking-tight mb-1">
                    {complaints.length}
                  </div>
                  <div className="text-xs text-slate-500">
                    {complaints.filter(c => c.status !== 'Resolved').length} Active in repair
                  </div>
                </div>
              </div>

              {/* Main Content 2-Column Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Schedule for Today */}
                <div className={`lg:col-span-2 rounded-xl border p-6 ${
                  isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                }`}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        Today's Scheduled Lectures ({activeDayForToday})
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Published institutional class timetable</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('timetable')}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Weekly Schedule</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {todayLectures.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 border border-dashed rounded-lg">
                        No lectures scheduled for today. Check weekly timetable for alternate schedules.
                      </div>
                    ) : (
                      todayLectures.map((item, idx) => (
                        <div 
                          key={item.id || idx}
                          className={`p-3.5 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-slate-400">0{idx + 1}</span>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{item.subject}</span>
                                <span className="font-mono text-[10px] text-slate-400 border border-slate-300 dark:border-slate-700 rounded px-1">
                                  {item.subjectCode}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Faculty: {item.faculty} &bull; Room: <span className="font-medium text-slate-700 dark:text-slate-300">{item.room}</span>
                              </div>
                            </div>
                          </div>
                          <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 font-medium shrink-0">
                            {item.period}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Col: Quick Actions & Notifications */}
                <div className="space-y-6">
                  {/* Action Shortcuts */}
                  <div className={`rounded-xl border p-5 ${
                    isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                  }`}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Student Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => { setShowComplaintModal(true); setComplaintDesc(''); }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                          isDark ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-sky-500" />
                          File Hostel Repair Ticket
                        </span>
                        <Plus className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        onClick={() => { setShowLeaveModal(true); setLeaveReason(''); }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                          isDark ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                          Apply for Formal Leave
                        </span>
                        <Plus className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        onClick={() => { setShowCertModal(true); setCertPurpose(''); }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                          isDark ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-500" />
                          Request Academic Certificate
                        </span>
                        <Plus className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        onClick={() => setActiveTab('ai')}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                          isDark 
                            ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/40' 
                            : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100/70'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          Take 21-Question Mock Test
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Campus Circulars Preview */}
                  <div className={`rounded-xl border p-5 ${
                    isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5" />
                        Campus Circulars
                      </h3>
                      <button
                        onClick={() => setActiveTab('notifications')}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      {notifications.slice(0, 3).map((notif, idx) => (
                        <div key={notif.id || idx} className={`p-2.5 rounded-lg border ${
                          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="font-semibold">{notif.title}</div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-base font-bold">Subject-Wise Attendance Tracking</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Statutory Rule: Minimum 75% attendance mandatory across each enrolled course for exam clearance.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Aggregate Standing:</span>
                      <div className="text-2xl font-bold font-mono">{overallPercentage}%</div>
                    </div>
                    <div className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                      overallPercentage >= 75 
                        ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' 
                        : 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                    }`}>
                      {overallPercentage >= 75 ? '● Satisfactory' : '▲ Attendance Shortage'}
                    </div>
                  </div>
                </div>

                {/* Progress bars by subject */}
                <div className="mt-6 space-y-4">
                  {subjectList.map((sub, i) => {
                    const pct = Math.round((sub.present / (sub.total || 1)) * 100);
                    const isBelow = pct < 75;
                    return (
                      <div key={i} className={`p-4 rounded-lg border ${
                        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-xs text-slate-900 dark:text-white">{sub.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Attended: {sub.present} / {sub.total} sessions
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-bold font-mono ${isBelow ? 'text-rose-500' : 'text-emerald-500'}`}>
                              {pct}%
                            </span>
                            {isBelow && (
                              <div className="text-[10px] text-rose-500 uppercase tracking-wider font-semibold">
                                Shortage Warning
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Professional Progress bar */}
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isBelow ? 'bg-rose-500' : pct >= 85 ? 'bg-emerald-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Attendance Log Table */}
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Individual Session Verification Log (Firestore Records)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Course Subject</th>
                        <th className="py-2.5 px-3">Marked Authority</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {attendance.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-500">
                            No individual session logs recorded yet. Faculty can mark attendance from the Administration Portal.
                          </td>
                        </tr>
                      ) : (
                        attendance.map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-mono text-slate-500">{rec.date}</td>
                            <td className="py-2.5 px-3 font-semibold">{rec.subjectName}</td>
                            <td className="py-2.5 px-3 text-slate-500">{rec.markedByName || 'Academic Faculty'}</td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                rec.status === 'Present' 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : rec.status === 'Excused'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  rec.status === 'Present' ? 'bg-emerald-500' : rec.status === 'Excused' ? 'bg-amber-500' : 'bg-rose-500'
                                }`} />
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TIMETABLE */}
          {activeTab === 'timetable' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-base font-bold">Academic Class Timetable</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Department: {user.department} &bull; {user.semester || '5th Sem'}</p>
                  </div>
                  <div className={`flex items-center gap-1 p-1 rounded-lg border text-xs ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <button
                      onClick={() => setTtView('today')}
                      className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                        ttView === 'today' 
                          ? isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Today's Lectures
                    </button>
                    <button
                      onClick={() => setTtView('week')}
                      className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                        ttView === 'week' 
                          ? isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Weekly Schedule
                    </button>
                  </div>
                </div>

                {ttView === 'today' ? (
                  <div className="space-y-2.5">
                    <div className="text-xs font-semibold text-slate-500 mb-2">Lectures for {activeDayForToday}:</div>
                    {todayLectures.map((entry) => (
                      <div key={entry.id} className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{entry.subject}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Code: <span className="font-mono">{entry.subjectCode}</span> &bull; Faculty: {entry.faculty}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            Room: {entry.room}
                          </span>
                          <span className="font-mono text-slate-500">
                            {entry.period}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {daysOfWeek.map((day) => {
                      const dayEntries = timetable.filter(t => t.day === day && t.published);
                      return (
                        <div key={day} className={`border rounded-lg p-4 ${
                          isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50/50'
                        }`}>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                            <span>{day}</span>
                            <span className="font-mono text-[10px] text-slate-400 font-normal">{dayEntries.length} lectures scheduled</span>
                          </h4>
                          {dayEntries.length === 0 ? (
                            <div className="text-xs text-slate-400 italic">No scheduled lectures for this day.</div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {dayEntries.map((e) => (
                                <div key={e.id} className={`p-3 rounded border text-xs ${
                                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                                }`}>
                                  <div className="font-bold truncate">{e.subject}</div>
                                  <div className="text-[11px] text-slate-500 truncate">{e.faculty}</div>
                                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
                                    <span>Rm {e.room}</span>
                                    <span>{e.period}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: HOSTEL COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold">Hostel Maintenance &amp; Facility Helpdesk</h2>
                  <p className="text-xs text-slate-500">Register and track electrical, plumbing, carpentry, and connectivity repairs.</p>
                </div>
                <button
                  onClick={() => setShowComplaintModal(true)}
                  className={`px-3.5 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 transition cursor-pointer ${
                    isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Maintenance Issue</span>
                </button>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Maintenance Tickets Log
                </h3>
                {complaints.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed rounded-lg">
                    No tickets registered. Click "Register Maintenance Issue" to submit a defect report.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {complaints.map((item) => (
                      <div key={item.id} className={`p-4 rounded-lg border space-y-2 text-xs ${
                        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {item.category}
                            </span>
                            <span className="text-slate-500">&bull; Room {item.roomNo}</span>
                            <span className="text-slate-400 font-mono text-[11px]">&bull; #{item.id.slice(0, 6)}</span>
                          </div>
                          <div>
                            <span className={`inline-flex items-center gap-1.5 font-medium ${
                              item.status === 'Resolved' 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : item.status === 'Rejected'
                                ? 'text-rose-600 dark:text-rose-400'
                                : item.status === 'In Progress'
                                ? 'text-sky-600 dark:text-sky-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                item.status === 'Resolved' ? 'bg-emerald-500' : item.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                              }`} />
                              {item.status}
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>

                        {(item.assignedTo || item.resolutionNotes) && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                            {item.assignedTo && <div>Assigned Technician: <span className="font-medium text-slate-700 dark:text-slate-300">{item.assignedTo}</span></div>}
                            {item.resolutionNotes && <div className="mt-0.5 text-emerald-600 dark:text-emerald-400">Resolution Remark: {item.resolutionNotes}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: LEAVE REQUEST */}
          {activeTab === 'leave' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold">Student Leave Applications</h2>
                  <p className="text-xs text-slate-500">Submit requests for medical, academic, or personal leaves.</p>
                </div>
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className={`px-3.5 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 transition cursor-pointer ${
                    isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Leave Application</span>
                </button>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Leave Applications History
                </h3>
                {leaves.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed rounded-lg">
                    No leave requests found. Click "Submit Leave Application" to draft a request.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaves.map((l) => (
                      <div key={l.id} className={`p-4 rounded-lg border text-xs ${
                        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            Duration: <span className="font-mono text-slate-500">{l.fromDate}</span> &rarr; <span className="font-mono text-slate-500">{l.toDate}</span>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 font-medium ${
                            l.status === 'Approved' ? 'text-emerald-600 dark:text-emerald-400' :
                            l.status === 'Rejected' ? 'text-rose-600 dark:text-rose-400' :
                            'text-amber-600 dark:text-amber-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              l.status === 'Approved' ? 'bg-emerald-500' : l.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                            }`} />
                            {l.status}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-2">Reason: {l.reason}</p>
                        {l.remarks && (
                          <div className="text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-2">
                            <strong>Dean / HOD Remarks:</strong> {l.remarks}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATE REQUEST */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold">Academic Certificate Applications</h2>
                  <p className="text-xs text-slate-500">Apply for Bonafide, Character, Course Completion, or NOC certificates.</p>
                </div>
                <button
                  onClick={() => setShowCertModal(true)}
                  className={`px-3.5 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 transition cursor-pointer ${
                    isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Request Certificate</span>
                </button>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Applied Certificates &amp; Tracking
                </h3>
                {certificates.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed rounded-lg">
                    No certificate applications recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {certificates.map((c) => (
                      <div key={c.id} className={`p-4 rounded-lg border text-xs ${
                        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-slate-900 dark:text-white">{c.certificateType}</div>
                          <span className={`inline-flex items-center gap-1.5 font-medium ${
                            c.status === 'Approved' ? 'text-emerald-600 dark:text-emerald-400' :
                            c.status === 'Rejected' ? 'text-rose-600 dark:text-rose-400' :
                            'text-amber-600 dark:text-amber-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              c.status === 'Approved' ? 'bg-emerald-500' : c.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                            }`} />
                            {c.status}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-2">Purpose: {c.purpose}</p>
                        {c.status === 'Approved' && (
                          <div className={`mt-2 p-2.5 rounded border flex items-center justify-between text-xs ${
                            isDark ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          }`}>
                            <span>Verified &amp; cleared by Academic Registrar Office.</span>
                            <button 
                              onClick={() => alert(`Certificate #${c.id.slice(0, 8)} ready for download (Verified PDF).`)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </button>
                          </div>
                        )}
                        {c.remarks && (
                          <div className="text-[11px] text-slate-500 mt-2 border-t border-slate-200 dark:border-slate-800 pt-1.5">
                            Authority Remarks: {c.remarks}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <h2 className="text-base font-bold mb-1">Campus Circulars &amp; Official Notices</h2>
                <p className="text-xs text-slate-500 mb-6">Attendance notices, examination timetables, and campus administrative updates.</p>

                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-4 rounded-lg border text-xs ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold flex items-center gap-2">
                          <Bell className="w-3.5 h-3.5 text-amber-500" />
                          {n.title}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PREVIOUS PAPERS */}
          {activeTab === 'papers' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-base font-bold">Previous Examination Paper Repository</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Verified past semester question papers organized by branch, year, and subject.</p>
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search subject or topic..."
                      value={paperSearch}
                      onChange={(e) => setPaperSearch(e.target.value)}
                      className={`w-full border rounded-lg pl-9 pr-3 py-2 focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="All">All Departments</option>
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="All">All Academic Years</option>
                      <option value="2024-2025">2024-2025</option>
                      <option value="2023-2024">2023-2024</option>
                    </select>
                  </div>
                </div>

                {/* Paper Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {papers
                    .filter(p => {
                      if (selectedBranch !== 'All' && p.branch !== selectedBranch) return false;
                      if (selectedYear !== 'All' && p.academicYear !== selectedYear) return false;
                      if (paperSearch && !p.subject.toLowerCase().includes(paperSearch.toLowerCase()) && !p.title.toLowerCase().includes(paperSearch.toLowerCase())) {
                        return false;
                      }
                      return true;
                    })
                    .map((paper) => (
                      <div key={paper.id} className={`p-4 rounded-lg border flex flex-col justify-between text-xs ${
                        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-[10px] text-slate-400">
                              {paper.academicYear} &bull; {paper.semester}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">{paper.fileSize || '1.5 MB'}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">{paper.title}</h4>
                          <p className="text-slate-500 mb-3">{paper.branch} &bull; {paper.examType}</p>
                          
                          {paper.keyTopics && (
                            <div className="mb-4">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">Key Tested Topics:</span>
                              <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                                {paper.keyTopics.map((t, idx) => (
                                  <span key={idx} className="border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => alert(`Downloading verified past exam archive: ${paper.title}`)}
                          className={`w-full py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                            isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-200' : 'border-slate-300 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Verified Paper</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: AI ASSISTANT SECTION */}
          {activeTab === 'ai' && (
            <AIAssistantSection user={user} />
          )}
        </div>
      </main>

      {/* MODAL 1: CREATE HOSTEL COMPLAINT */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className={`border rounded-xl max-w-md w-full p-6 shadow-xl ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-base font-bold mb-1">Register Hostel Maintenance Issue</h3>
            <p className="text-xs text-slate-500 mb-4">Direct notification forwarded to maintenance wardens.</p>

            <form onSubmit={handleCreateComplaint} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Issue Category</label>
                <select
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value as any)}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Electrical">Electrical (Fan, Light, Switchboard)</option>
                  <option value="Plumbing">Plumbing (Tap, Shower, Geyser, Drain)</option>
                  <option value="Carpentry">Carpentry (Door, Window, Bed, Cupboard)</option>
                  <option value="Cleanliness">Cleanliness &amp; Sanitation</option>
                  <option value="Wi-Fi / Internet">Wi-Fi &amp; LAN Connectivity</option>
                  <option value="Mess / Food">Mess &amp; Drinking Water</option>
                  <option value="Security">Hostel Security</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Hostel Block &amp; Room No</label>
                <input
                  type="text"
                  required
                  value={complaintRoom}
                  onChange={(e) => setComplaintRoom(e.target.value)}
                  placeholder="e.g. Block B, Room 204"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description of Issue</label>
                <textarea
                  required
                  rows={3}
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  placeholder="Describe the defect or repair needed..."
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg font-semibold text-xs transition cursor-pointer ${
                    isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: APPLY LEAVE */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className={`border rounded-xl max-w-md w-full p-6 shadow-xl ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-base font-bold mb-1">Submit Student Leave Application</h3>
            <p className="text-xs text-slate-500 mb-4">Official application for Dean &amp; HOD review.</p>

            <form onSubmit={handleCreateLeave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">From Date</label>
                  <input
                    type="date"
                    required
                    value={leaveFrom}
                    onChange={(e) => setLeaveFrom(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">To Date</label>
                  <input
                    type="date"
                    required
                    value={leaveTo}
                    onChange={(e) => setLeaveTo(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Parent / Emergency Contact</label>
                <input
                  type="tel"
                  required
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Reason for Leave</label>
                <textarea
                  required
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Medical reason, family event, or academic symposium..."
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg font-semibold text-xs transition cursor-pointer ${
                    isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REQUEST CERTIFICATE */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className={`border rounded-xl max-w-md w-full p-6 shadow-xl ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-base font-bold mb-1">Request Official Academic Certificate</h3>
            <p className="text-xs text-slate-500 mb-4">Cleared by the Academic Dean &amp; Registrar Office.</p>

            <form onSubmit={handleCreateCert} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Certificate Type</label>
                <select
                  value={certType}
                  onChange={(e) => setCertType(e.target.value as any)}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Bonafide Certificate">Bonafide Certificate</option>
                  <option value="Character Certificate">Character Certificate</option>
                  <option value="Fee Structure">Fee Structure Certificate</option>
                  <option value="No Objection Certificate (NOC)">No Objection Certificate (NOC)</option>
                  <option value="Course Completion">Course Completion Certificate</option>
                  <option value="Transfer Certificate (TC)">Transfer Certificate (TC)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Purpose / Submission Detail</label>
                <textarea
                  required
                  rows={3}
                  value={certPurpose}
                  onChange={(e) => setCertPurpose(e.target.value)}
                  placeholder="e.g. Bank education loan verification, passport application, or company internship clearance..."
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg font-semibold text-xs transition cursor-pointer ${
                    isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
