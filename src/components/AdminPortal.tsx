import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  AttendanceRecord, 
  TimetableEntry, 
  HostelComplaint, 
  LeaveRequest, 
  CertificateRequest, 
  CampusNotification, 
  ComplaintStatus, 
  LeaveStatus, 
  CertificateStatus,
  AdminRole 
} from '../types';
import { 
  getAllStudents, 
  getAllAttendanceRecords, 
  markStudentAttendance, 
  getTimetable, 
  addTimetableEntry, 
  deleteTimetableEntry, 
  getAllComplaints, 
  updateComplaintStatus, 
  getAllLeaves, 
  updateLeaveStatus, 
  getAllCertificates, 
  updateCertificateStatus, 
  getNotifications, 
  createNotification,
  updateStudentStatus,
  updateStudentProfile
} from '../campus-service';
import { useTheme } from '../ThemeContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Home,
  FileSpreadsheet,
  Award,
  Users,
  BarChart3,
  LogOut,
  ShieldCheck,
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Bell,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Download,
  Building,
  Sun,
  Moon,
  Landmark,
  ShieldAlert
} from 'lucide-react';

interface Props {
  user: UserProfile;
  onLogout: () => void;
}

export default function AdminPortal({ user, onLogout }: Props) {
  const { isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'attendance' | 'timetable' | 'complaints' | 'leave' | 'certificate' | 'students' | 'analytics'
  >('dashboard');

  const [students, setStudents] = useState<UserProfile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [complaints, setComplaints] = useState<HostelComplaint[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [certificates, setCertificates] = useState<CertificateRequest[]>([]);
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Message feedback
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Attendance management form
  const [attDept, setAttDept] = useState('Computer Science & Engineering');
  const [attSem, setAttSem] = useState('5th Semester');
  const [attSub, setAttSub] = useState('Data Structures & Algorithms');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentStatusMap, setStudentStatusMap] = useState<Record<string, 'Present' | 'Absent' | 'Excused'>>({});

  // Timetable creation form
  const [showAddTimetableModal, setShowAddTimetableModal] = useState(false);
  const [ttDay, setTtDay] = useState<TimetableEntry['day']>('Monday');
  const [ttPeriod, setTtPeriod] = useState('09:00 AM - 10:00 AM');
  const [ttSubject, setTtSubject] = useState('');
  const [ttCode, setTtCode] = useState('');
  const [ttFaculty, setTtFaculty] = useState('');
  const [ttRoom, setTtRoom] = useState('');
  const [ttDept, setTtDept] = useState(user.department === 'Administration' ? 'Computer Science & Engineering' : user.department);
  const [ttSem, setTtSem] = useState('5th Semester');

  // Review modal state (Complaint / Leave / Certificate)
  const [selectedComplaint, setSelectedComplaint] = useState<HostelComplaint | null>(null);
  const [complaintNewStatus, setComplaintNewStatus] = useState<ComplaintStatus>('In Progress');
  const [technicianName, setTechnicianName] = useState('');
  const [resolutionRemark, setResolutionRemark] = useState('');

  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [leaveNewStatus, setLeaveNewStatus] = useState<LeaveStatus>('Approved');
  const [leaveRemark, setLeaveRemark] = useState('');

  const [selectedCert, setSelectedCert] = useState<CertificateRequest | null>(null);
  const [certNewStatus, setCertNewStatus] = useState<CertificateStatus>('Approved');
  const [certRemark, setCertRemark] = useState('');

  // Student search & filter
  const [studentQuery, setStudentQuery] = useState('');
  const [studentFilterDept, setStudentFilterDept] = useState('All');

  // Filter complaints
  const [complaintFilterStatus, setComplaintFilterStatus] = useState('All');

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [studs, atts, tts, comps, lvs, certs, notifs] = await Promise.all([
        getAllStudents(),
        getAllAttendanceRecords(),
        getTimetable(),
        getAllComplaints(),
        getAllLeaves(),
        getAllCertificates(),
        getNotifications(user)
      ]);
      setStudents(studs);
      setAttendance(atts);
      setTimetable(tts);
      setComplaints(comps);
      setLeaves(lvs);
      setCertificates(certs);
      setNotifications(notifs);

      // Pre-populate student status map for attendance
      const map: Record<string, 'Present' | 'Absent' | 'Excused'> = {};
      studs.forEach((s: UserProfile) => {
        map[s.id] = 'Present';
      });
      setStudentStatusMap(map);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Submit attendance records for students
  const handleSaveAttendance = async () => {
    const targetStudents = students.filter(s => 
      s.department === attDept && (!s.semester || s.semester === attSem)
    );

    if (targetStudents.length === 0) {
      setFeedback({ message: 'No registered students match the selected department and semester.', type: 'error' });
      return;
    }

    const records = targetStudents.map(s => ({
      studentId: s.id,
      studentName: s.name,
      rollNo: s.studentId,
      subjectId: attSub.toLowerCase().replace(/\s+/g, '-'),
      subjectName: attSub,
      department: attDept,
      semester: attSem,
      date: attDate,
      status: studentStatusMap[s.id] || 'Present',
      markedBy: user.id,
      markedByName: `${user.name} (${user.adminHierarchy || 'Faculty'})`
    }));

    try {
      await markStudentAttendance(records);
      setFeedback({ message: `Attendance committed to Firestore for ${records.length} students in ${attSub}.`, type: 'success' });
      await loadAllAdminData();
    } catch (e: any) {
      setFeedback({ message: e.message || 'Error recording attendance.', type: 'error' });
    }
  };

  // Add new timetable entry
  const handleCreateTimetableEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ttSubject || !ttFaculty || !ttRoom) return;

    try {
      await addTimetableEntry({
        day: ttDay,
        period: ttPeriod,
        subject: ttSubject,
        subjectCode: ttCode || 'CS301',
        faculty: ttFaculty,
        room: ttRoom,
        department: ttDept,
        semester: ttSem,
        published: true
      });
      setShowAddTimetableModal(false);
      setTtSubject('');
      setTtFaculty('');
      setTtRoom('');
      setFeedback({ message: 'Lecture slot published! Real-time notifications dispatched to students.', type: 'success' });
      await loadAllAdminData();
    } catch (e: any) {
      setFeedback({ message: e.message || 'Error publishing timetable.', type: 'error' });
    }
  };

  // Delete timetable entry
  const handleDeleteTimetable = async (id: string) => {
    if (!confirm('Are you sure you want to remove this timetable entry?')) return;
    try {
      await deleteTimetableEntry(id);
      setFeedback({ message: 'Lecture entry removed from timetable.', type: 'success' });
      await loadAllAdminData();
    } catch (e: any) {
      setFeedback({ message: e.message || 'Error deleting timetable entry', type: 'error' });
    }
  };

  // Update complaint status
  const handleSaveComplaintStatus = async () => {
    if (!selectedComplaint) return;
    try {
      await updateComplaintStatus(
        selectedComplaint.id,
        complaintNewStatus,
        technicianName || selectedComplaint.assignedTo,
        resolutionRemark,
        selectedComplaint.studentId
      );
      setSelectedComplaint(null);
      setFeedback({ message: `Complaint #${selectedComplaint.id.slice(0, 6)} updated to "${complaintNewStatus}".`, type: 'success' });
      await loadAllAdminData();
    } catch (e: any) {
      setFeedback({ message: e.message || 'Error updating complaint', type: 'error' });
    }
  };

  // Update leave status
  const handleSaveLeaveStatus = async () => {
    if (!selectedLeave) return;
    try {
      await updateLeaveStatus(
        selectedLeave.id,
        leaveNewStatus,
        leaveRemark,
        `${user.name} (${user.adminHierarchy})`,
        selectedLeave.studentId
      );
      setSelectedLeave(null);
      setFeedback({ message: `Leave request marked as ${leaveNewStatus}.`, type: 'success' });
      await loadAllAdminData();
    } catch (e: any) {
      setFeedback({ message: e.message || 'Error updating leave request', type: 'error' });
    }
  };

  // Update certificate status
  const handleSaveCertificateStatus = async () => {
    if (!selectedCert) return;
    try {
      await updateCertificateStatus(
        selectedCert.id,
        certNewStatus,
        certRemark,
        `${user.name} (${user.adminHierarchy})`,
        selectedCert.studentId,
        selectedCert.certificateType
      );
      setSelectedCert(null);
      setFeedback({ message: `Certificate application marked as ${certNewStatus}.`, type: 'success' });
      await loadAllAdminData();
    } catch (e: any) {
      setFeedback({ message: e.message || 'Error updating certificate', type: 'error' });
    }
  };

  // Toggle student status
  const handleToggleStudent = async (studentId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateStudentStatus(studentId, nextStatus);
      setFeedback({ message: `Student status updated to ${nextStatus}.`, type: 'success' });
      await loadAllAdminData();
    } catch (e: any) {
      setFeedback({ message: e.message || 'Error updating student status', type: 'error' });
    }
  };

  // Calculate analytics numbers
  const pendingComplaintsCount = complaints.filter(c => c.status === 'Pending').length;
  const pendingLeavesCount = leaves.filter(l => l.status === 'Pending').length;
  const pendingCertsCount = certificates.filter(c => c.status === 'Pending').length;
  const totalAttLogs = attendance.length;
  const totalPresentCount = attendance.filter(a => a.status === 'Present').length;
  const aggregateAttPct = totalAttLogs > 0 ? Math.round((totalPresentCount / totalAttLogs) * 100) : 84;

  // Filtered students for management
  const filteredStudents = students.filter(s => {
    if (studentFilterDept !== 'All' && s.department !== studentFilterDept) return false;
    if (studentQuery) {
      const q = studentQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.studentId && s.studentId.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors ${
      isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Admin Sidebar Navigation */}
      <aside className={`w-full md:w-64 border-r flex flex-col shrink-0 transition-colors ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-serif-title font-bold text-sm ${
              isDark ? 'bg-amber-950/60 border border-amber-700/60 text-amber-300' : 'bg-slate-900 text-white'
            }`}>
              AD
            </div>
            <div>
              <div className="font-serif-title font-bold text-xs tracking-wider">CAMPUS LIFE</div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">GOVERNANCE ADMIN</div>
            </div>
          </div>
        </div>

        {/* Administration Hierarchy Badge */}
        <div className={`mx-3 my-3 p-3.5 rounded-lg border text-xs ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="font-semibold truncate">{user.name}</div>
          <div className="text-[11px] text-slate-500 font-mono truncate">{user.department}</div>
          <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Authority:</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400 font-mono">
              {user.adminHierarchy || 'Faculty'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-1">
          {[
            { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
            { id: 'attendance', label: 'Manage Attendance', icon: CalendarCheck },
            { id: 'timetable', label: 'Manage Timetable', icon: Calendar },
            { id: 'complaints', label: 'Hostel Maintenance', icon: Home, count: pendingComplaintsCount },
            { id: 'leave', label: 'Leave Approvals', icon: FileSpreadsheet, count: pendingLeavesCount },
            { id: 'certificate', label: 'Certificate Approvals', icon: Award, count: pendingCertsCount },
            { id: 'students', label: 'Student Directory', icon: Users, count: students.length },
            { id: 'analytics', label: 'Campus Analytics', icon: BarChart3 }
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
                      ? 'bg-slate-800 text-white font-semibold border-l-2 border-amber-500' 
                      : 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900 shadow-2xs'
                    : isDark 
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? (isDark ? 'text-amber-400' : 'text-slate-900') : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="text-[10px] font-mono text-amber-500 font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sign Out */}
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

      {/* Main Administrative Workspace */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Header */}
        <header className={`h-16 border-b px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md transition-colors ${
          isDark ? 'bg-[#0f172a]/95 border-slate-800' : 'bg-white/95 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Administration</span>
            <span className="text-slate-400">/</span>
            <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
              {activeTab === 'dashboard' ? 'Governance Control Center' : activeTab.replace('-', ' ')}
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

            <button
              onClick={loadAllAdminData}
              title="Refresh Firestore Records"
              className={`p-2 rounded-lg border text-xs transition cursor-pointer ${
                isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white' : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
            </button>

            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold">{user.email}</div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                Hierarchy: {user.adminHierarchy}
              </div>
            </div>
          </div>
        </header>

        {/* Status Notification */}
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

        {/* Tab Workspace */}
        <div className="p-6 flex-1 space-y-6 max-w-7xl w-full mx-auto">
          {/* TAB 1: ADMIN DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* College Hierarchy Notice */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <div className="font-bold text-slate-900 dark:text-white">
                    College Governance Framework Active &bull; Authority Level: {user.adminHierarchy}
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    <strong>Principal:</strong> Full institution oversight &bull; <strong>Dean:</strong> Academic &amp; student affairs &bull; <strong>Branch HOD:</strong> Department schedules &amp; faculty &bull; <strong>Faculty/Staff:</strong> Class attendance, lecture timetable, and request processing.
                  </p>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  onClick={() => setActiveTab('students')}
                  className={`p-5 rounded-xl border cursor-pointer transition ${
                    isDark ? 'bg-[#111827] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                    <span>Enrolled Students</span>
                    <Users className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-3xl font-bold font-mono tracking-tight mb-1">
                    {students.length || 1}
                  </div>
                  <div className="text-xs text-emerald-500 font-medium">Active Firestore Profiles</div>
                </div>

                <div 
                  onClick={() => setActiveTab('attendance')}
                  className={`p-5 rounded-xl border cursor-pointer transition ${
                    isDark ? 'bg-[#111827] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                    <span>Campus Attendance Rate</span>
                    <CalendarCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-bold font-mono tracking-tight mb-1">
                    {aggregateAttPct}%
                  </div>
                  <div className="text-xs text-slate-500">Logged across courses</div>
                </div>

                <div 
                  onClick={() => setActiveTab('complaints')}
                  className={`p-5 rounded-xl border cursor-pointer transition ${
                    isDark ? 'bg-[#111827] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                    <span>Pending Complaints</span>
                    <Home className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-3xl font-bold font-mono tracking-tight mb-1">
                    {pendingComplaintsCount}
                  </div>
                  <div className="text-xs text-rose-500 font-medium">Hostel maintenance queue</div>
                </div>

                <div 
                  onClick={() => setActiveTab('leave')}
                  className={`p-5 rounded-xl border cursor-pointer transition ${
                    isDark ? 'bg-[#111827] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                    <span>Pending Approvals</span>
                    <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-3xl font-bold font-mono tracking-tight mb-1">
                    {pendingLeavesCount + pendingCertsCount}
                  </div>
                  <div className="text-xs text-amber-500 font-medium">
                    {pendingLeavesCount} Leaves &bull; {pendingCertsCount} Certs
                  </div>
                </div>
              </div>

              {/* 2 Grid Columns: Action Queues & Maintenance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Leave & Certificate Applications */}
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Pending Approval Action Queue
                    </h3>
                    <span className="text-[11px] text-slate-400">Review &amp; Clear</span>
                  </div>

                  <div className="space-y-2.5">
                    {pendingLeavesCount === 0 && pendingCertsCount === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 border border-dashed rounded-lg">
                        All student leave and certificate applications are currently cleared.
                      </div>
                    ) : (
                      <>
                        {leaves.filter(l => l.status === 'Pending').map(l => (
                          <div key={l.id} className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <div>
                              <div className="font-bold flex items-center gap-2">
                                <span>{l.studentName}</span>
                                <span className="font-mono text-[10px] text-amber-500 border border-amber-500/40 rounded px-1">
                                  Leave Application
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{l.fromDate} &rarr; {l.toDate} &bull; {l.reason}</p>
                            </div>
                            <button
                              onClick={() => { setSelectedLeave(l); setLeaveRemark(''); setLeaveNewStatus('Approved'); }}
                              className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs cursor-pointer"
                            >
                              Review
                            </button>
                          </div>
                        ))}

                        {certificates.filter(c => c.status === 'Pending').map(c => (
                          <div key={c.id} className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <div>
                              <div className="font-bold flex items-center gap-2">
                                <span>{c.studentName}</span>
                                <span className="font-mono text-[10px] text-indigo-500 border border-indigo-500/40 rounded px-1">
                                  {c.certificateType}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{c.purpose}</p>
                            </div>
                            <button
                              onClick={() => { setSelectedCert(c); setCertRemark(''); setCertNewStatus('Approved'); }}
                              className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer"
                            >
                              Issue Cert
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Maintenance Urgent Complaints */}
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      Hostel Maintenance Alerts
                    </h3>
                    <button onClick={() => setActiveTab('complaints')} className="text-[11px] text-amber-500 hover:underline cursor-pointer">
                      View All
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {complaints.filter(c => c.status !== 'Resolved').length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 border border-dashed rounded-lg">
                        No active complaints pending in hostels.
                      </div>
                    ) : (
                      complaints.filter(c => c.status !== 'Resolved').slice(0, 4).map(c => (
                        <div key={c.id} className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div>
                            <div className="font-bold flex items-center gap-2">
                              <span>{c.category} (Rm {c.roomNo})</span>
                              <span className="text-[11px] text-slate-500">&bull; {c.studentName}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{c.description}</p>
                          </div>
                          <button
                            onClick={() => { setSelectedComplaint(c); setResolutionRemark(''); setComplaintNewStatus(c.status); }}
                            className={`px-3 py-1.5 rounded border text-xs font-semibold cursor-pointer ${
                              isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            Update
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <h2 className="text-base font-bold mb-1">Batch Attendance Registry</h2>
                <p className="text-xs text-slate-500 mb-6">Select branch, semester, and course subject to record attendance directly into Firestore.</p>

                {/* Filter Controls */}
                <div className={`grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-lg border mb-6 text-xs ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <label className="block font-semibold mb-1">Department</label>
                    <select
                      value={attDept}
                      onChange={(e) => setAttDept(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Semester</label>
                    <select
                      value={attSem}
                      onChange={(e) => setAttSem(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="5th Semester">5th Semester</option>
                      <option value="3rd Semester">3rd Semester</option>
                      <option value="7th Semester">7th Semester</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Course Subject</label>
                    <select
                      value={attSub}
                      onChange={(e) => setAttSub(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="Data Structures & Algorithms">Data Structures &amp; Algorithms (CS301)</option>
                      <option value="Database Management Systems">Database Management Systems (CS302)</option>
                      <option value="Operating Systems">Operating Systems (CS303)</option>
                      <option value="Computer Networks">Computer Networks (CS304)</option>
                      <option value="Artificial Intelligence">Artificial Intelligence (CS305)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Session Date</label>
                    <input
                      type="date"
                      value={attDate}
                      onChange={(e) => setAttDate(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Student Attendance Table */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Roll No</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Department &amp; Sem</th>
                        <th className="py-2.5 px-3 text-center">Status Selection</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {students.map((stud, sIdx) => {
                        const currentVal = studentStatusMap[stud.id] || 'Present';
                        return (
                          <tr key={`${stud.id || 'stud'}-${sIdx}`} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-500">
                              {stud.studentId || '21CS042'}
                            </td>
                            <td className="py-2.5 px-3 font-semibold">{stud.name}</td>
                            <td className="py-2.5 px-3 text-slate-500">{stud.department} ({stud.semester || '5th Sem'})</td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setStudentStatusMap(prev => ({ ...prev, [stud.id]: 'Present' }))}
                                  className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                                    currentVal === 'Present' 
                                      ? 'bg-emerald-600 text-white' 
                                      : 'border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-900'
                                  }`}
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStudentStatusMap(prev => ({ ...prev, [stud.id]: 'Absent' }))}
                                  className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                                    currentVal === 'Absent' 
                                      ? 'bg-rose-600 text-white' 
                                      : 'border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-900'
                                  }`}
                                >
                                  Absent
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStudentStatusMap(prev => ({ ...prev, [stud.id]: 'Excused' }))}
                                  className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                                    currentVal === 'Excused' 
                                      ? 'bg-amber-600 text-white' 
                                      : 'border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-900'
                                  }`}
                                >
                                  Excused
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500">
                    Signing Faculty: <strong>{user.name}</strong> ({user.adminHierarchy})
                  </div>
                  <button
                    onClick={handleSaveAttendance}
                    className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer transition"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Save &amp; Commit Attendance</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE TIMETABLE */}
          {activeTab === 'timetable' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold">College Timetable Schedule</h2>
                  <p className="text-xs text-slate-500">Assign faculty, lecture halls, and publish class slots to students in real-time.</p>
                </div>
                <button
                  onClick={() => setShowAddTimetableModal(true)}
                  className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Class Slot</span>
                </button>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Day</th>
                        <th className="py-2.5 px-3">Period</th>
                        <th className="py-2.5 px-3">Subject &amp; Code</th>
                        <th className="py-2.5 px-3">Assigned Faculty</th>
                        <th className="py-2.5 px-3">Room</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {timetable.map((tt) => (
                        <tr key={tt.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-semibold">{tt.day}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{tt.period}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-medium">{tt.subject}</span>{' '}
                            <span className="text-[10px] font-mono text-slate-400 border border-slate-300 dark:border-slate-700 rounded px-1">
                              {tt.subjectCode}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{tt.faculty}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{tt.room}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Published
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleDeleteTimetable(tt.id)}
                              className="p-1 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold">Hostel Maintenance &amp; Remediation</h2>
                  <p className="text-xs text-slate-500">Assign technicians, update 5-step progress states, and log resolution remarks.</p>
                </div>
                <div>
                  <select
                    value={complaintFilterStatus}
                    onChange={(e) => setComplaintFilterStatus(e.target.value)}
                    className={`border rounded-lg px-3 py-1.5 text-xs focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="space-y-3">
                  {complaints
                    .filter(c => complaintFilterStatus === 'All' || c.status === complaintFilterStatus)
                    .map((comp) => (
                      <div key={comp.id} className={`p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs ${
                        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{comp.category}</span>
                            <span className="text-slate-500">&bull; Room {comp.roomNo}</span>
                            <span className="text-slate-400 font-mono text-[11px]">&bull; {comp.studentName}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">{comp.description}</p>
                          <div className="text-[11px] text-slate-500 flex items-center gap-3">
                            <span>Status: <strong className="text-amber-500">{comp.status}</strong></span>
                            {comp.assignedTo && <span>Tech: <strong className="text-slate-700 dark:text-slate-300">{comp.assignedTo}</strong></span>}
                            {comp.resolutionNotes && <span className="text-emerald-500">Note: {comp.resolutionNotes}</span>}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedComplaint(comp);
                            setComplaintNewStatus(comp.status);
                            setTechnicianName(comp.assignedTo || '');
                            setResolutionRemark(comp.resolutionNotes || '');
                          }}
                          className="px-3.5 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shrink-0 cursor-pointer"
                        >
                          Manage Ticket
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LEAVE APPROVAL */}
          {activeTab === 'leave' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <h2 className="text-base font-bold mb-1">Student Leave Approval Desk</h2>
                <p className="text-xs text-slate-500 mb-6">Review official absence requests, verify emergency contacts, and record administrative remarks.</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Student</th>
                        <th className="py-2.5 px-3">Roll &amp; Branch</th>
                        <th className="py-2.5 px-3">From - To</th>
                        <th className="py-2.5 px-3">Reason</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {leaves.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-semibold">{l.studentName}</td>
                          <td className="py-2.5 px-3 text-slate-500">{l.rollNo} &bull; {l.department}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{l.fromDate} &rarr; {l.toDate}</td>
                          <td className="py-2.5 px-3 max-w-xs truncate text-slate-600 dark:text-slate-300">{l.reason}</td>
                          <td className="py-2.5 px-3">
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
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedLeave(l);
                                setLeaveNewStatus(l.status);
                                setLeaveRemark(l.remarks || '');
                              }}
                              className={`px-3 py-1 rounded border text-xs font-semibold cursor-pointer ${
                                isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATE APPROVAL */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <h2 className="text-base font-bold mb-1">Academic Certificate Clearance Desk</h2>
                <p className="text-xs text-slate-500 mb-6">Authorize Bonafide, NOC, Character, and Course Completion documents.</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Student</th>
                        <th className="py-2.5 px-3">Certificate Type</th>
                        <th className="py-2.5 px-3">Purpose</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {certificates.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-semibold">{c.studentName}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{c.certificateType}</td>
                          <td className="py-2.5 px-3 max-w-xs truncate text-slate-500">{c.purpose}</td>
                          <td className="py-2.5 px-3">
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
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedCert(c);
                                setCertNewStatus(c.status);
                                setCertRemark(c.remarks || '');
                              }}
                              className={`px-3 py-1 rounded border text-xs font-semibold cursor-pointer ${
                                isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: STUDENTS DIRECTORY */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold">Student Directory &amp; Records</h2>
                  <p className="text-xs text-slate-500">Manage student profiles, verify enrollments, and toggle account activation.</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search name, roll no..."
                      value={studentQuery}
                      onChange={(e) => setStudentQuery(e.target.value)}
                      className={`border rounded-lg pl-8 pr-3 py-1.5 focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <select
                    value={studentFilterDept}
                    onChange={(e) => setStudentFilterDept(e.target.value)}
                    className={`border rounded-lg px-3 py-1.5 focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="All">All Departments</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                  </select>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Roll No</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Email Address</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Year / Sem</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Account Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredStudents.map((stud, sIdx) => (
                        <tr key={`${stud.id || 'stud'}-${sIdx}`} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono font-medium text-slate-500">
                            {stud.studentId || '21CS042'}
                          </td>
                          <td className="py-2.5 px-3 font-semibold">{stud.name}</td>
                          <td className="py-2.5 px-3 text-slate-500">{stud.email}</td>
                          <td className="py-2.5 px-3 text-slate-500">{stud.department}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{stud.year || '3rd Yr'} / {stud.semester || '5th Sem'}</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center gap-1.5 font-medium ${
                              stud.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${stud.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {stud.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleToggleStudent(stud.id, stud.status)}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                                stud.status === 'active'
                                  ? 'text-rose-500 hover:bg-rose-500/10'
                                  : 'text-emerald-500 hover:bg-emerald-500/10'
                              }`}
                            >
                              {stud.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: CAMPUS ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <h2 className="text-base font-bold mb-1">Campus Institutional Analytics</h2>
                <p className="text-xs text-slate-500 mb-6">Aggregate metrics on attendance compliance, departmental distribution, and facility resolution.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Department Attendance Distribution */}
                  <div className={`p-4 rounded-lg border ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                      Department-Wise Attendance Averages
                    </h3>
                    <div className="space-y-3 text-xs">
                      {[
                        { dept: 'Computer Science & Engineering', pct: 86 },
                        { dept: 'Information Technology', pct: 82 },
                        { dept: 'Electronics & Communication', pct: 79 },
                        { dept: 'Mechanical Engineering', pct: 76 },
                        { dept: 'Civil Engineering', pct: 81 }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                            <span>{item.dept}</span>
                            <span className="font-mono font-bold">{item.pct}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${item.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hostel Ticket Categories Distribution */}
                  <div className={`p-4 rounded-lg border ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                      Hostel Maintenance by Category
                    </h3>
                    <div className="space-y-3 text-xs">
                      {[
                        { cat: 'Electrical (Fan, Lights, Sockets)', count: 18, share: 38 },
                        { cat: 'Plumbing & Water Supply', count: 14, share: 30 },
                        { cat: 'Wi-Fi & Network Access', count: 8, share: 17 },
                        { cat: 'Carpentry & Furniture', count: 4, share: 9 },
                        { cat: 'Sanitation & Cleanliness', count: 3, share: 6 }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                            <span>{item.cat}</span>
                            <span className="font-mono text-slate-500">{item.count} tickets ({item.share}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-600 h-full rounded-full" style={{ width: `${item.share}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: ADD TIMETABLE ENTRY */}
      {showAddTimetableModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className={`border rounded-xl max-w-md w-full p-6 shadow-xl ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-base font-bold mb-1">Create Class Slot Entry</h3>
            <p className="text-xs text-slate-500 mb-4">Entry will be published immediately to student schedules.</p>

            <form onSubmit={handleCreateTimetableEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Day of Week</label>
                  <select
                    value={ttDay}
                    onChange={(e) => setTtDay(e.target.value as any)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Time Period</label>
                  <input
                    type="text"
                    required
                    value={ttPeriod}
                    onChange={(e) => setTtPeriod(e.target.value)}
                    placeholder="09:00 AM - 10:00 AM"
                    className={`w-full border rounded-lg px-3 py-2 font-mono focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={ttSubject}
                    onChange={(e) => setTtSubject(e.target.value)}
                    placeholder="e.g. Operating Systems"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={ttCode}
                    onChange={(e) => setTtCode(e.target.value)}
                    placeholder="CS303"
                    className={`w-full border rounded-lg px-3 py-2 font-mono focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Assigned Faculty</label>
                  <input
                    type="text"
                    required
                    value={ttFaculty}
                    onChange={(e) => setTtFaculty(e.target.value)}
                    placeholder="Dr. Emily Watson"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Room / Hall</label>
                  <input
                    type="text"
                    required
                    value={ttRoom}
                    onChange={(e) => setTtRoom(e.target.value)}
                    placeholder="LHC-201"
                    className={`w-full border rounded-lg px-3 py-2 font-mono focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTimetableModal(false)}
                  className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Publish Lecture Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANAGE COMPLAINT */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className={`border rounded-xl max-w-md w-full p-6 shadow-xl ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-base font-bold mb-1">Update Hostel Maintenance Ticket</h3>
            <p className="text-xs text-slate-500 mb-4">ID #{selectedComplaint.id.slice(0, 6)} &bull; Rm {selectedComplaint.roomNo}</p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Status Progression</label>
                <select
                  value={complaintNewStatus}
                  onChange={(e) => setComplaintNewStatus(e.target.value as any)}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Assigned Technician</label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  placeholder="e.g. Mike Evans (Chief Electrician)"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Resolution Remarks</label>
                <textarea
                  rows={2}
                  value={resolutionRemark}
                  onChange={(e) => setResolutionRemark(e.target.value)}
                  placeholder="Defect rectified, switch replaced..."
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveComplaintStatus}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Save Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REVIEW LEAVE */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className={`border rounded-xl max-w-md w-full p-6 shadow-xl ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-base font-bold mb-1">Review Student Leave Application</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedLeave.studentName} &bull; {selectedLeave.rollNo}</p>

            <div className="space-y-4 text-xs">
              <div className={`p-3 rounded-lg border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div><strong>Duration:</strong> {selectedLeave.fromDate} &rarr; {selectedLeave.toDate}</div>
                <div className="mt-1"><strong>Reason:</strong> {selectedLeave.reason}</div>
                {selectedLeave.emergencyContact && <div className="mt-1"><strong>Contact:</strong> {selectedLeave.emergencyContact}</div>}
              </div>

              <div>
                <label className="block font-semibold mb-1">Decision</label>
                <select
                  value={leaveNewStatus}
                  onChange={(e) => setLeaveNewStatus(e.target.value as any)}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Pending">Keep in Review</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Authority Remarks</label>
                <textarea
                  rows={2}
                  value={leaveRemark}
                  onChange={(e) => setLeaveRemark(e.target.value)}
                  placeholder="Granted with attendance waiver, or reason rejected..."
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedLeave(null)}
                  className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLeaveStatus}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Commit Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REVIEW CERTIFICATE */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className={`border rounded-xl max-w-md w-full p-6 shadow-xl ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-base font-bold mb-1">Authorize Certificate Application</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedCert.studentName} &bull; {selectedCert.certificateType}</p>

            <div className="space-y-4 text-xs">
              <div className={`p-3 rounded-lg border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div><strong>Purpose:</strong> {selectedCert.purpose}</div>
                <div className="mt-1"><strong>Branch:</strong> {selectedCert.department}</div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Clearance Status</label>
                <select
                  value={certNewStatus}
                  onChange={(e) => setCertNewStatus(e.target.value as any)}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Approved">Approve &amp; Issue</option>
                  <option value="Rejected">Reject Application</option>
                  <option value="Pending">Under Review</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Registrar Remarks</label>
                <textarea
                  rows={2}
                  value={certRemark}
                  onChange={(e) => setCertRemark(e.target.value)}
                  placeholder="Authorized by Academic Dean..."
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCertificateStatus}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Commit Authorization
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
