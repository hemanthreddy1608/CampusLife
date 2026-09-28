import {
  defaultTimetable,
  defaultPreviousPapers,
  defaultAnnouncements
} from './seed-data';
import {
  AttendanceRecord,
  TimetableEntry,
  HostelComplaint,
  LeaveRequest,
  CertificateRequest,
  CampusNotification,
  PreviousPaper,
  UserProfile,
  ComplaintStatus,
  LeaveStatus,
  CertificateStatus
} from './types';

// Helper for local storage persistence
function getStoredItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save to localStorage (${key}):`, e);
  }
}

// ==================== BASELINE ATTENDANCE GENERATOR ====================
function generateBaselineAttendance(studentId: string): AttendanceRecord[] {
  const subjects = [
    { code: 'CS301', name: 'Data Structures & Algorithms', faculty: 'Dr. Sarah Jenkins' },
    { code: 'CS302', name: 'Database Management Systems', faculty: 'Prof. Rajesh Kumar' },
    { code: 'CS303', name: 'Operating Systems', faculty: 'Dr. Emily Watson' },
    { code: 'CS304', name: 'Computer Networks', faculty: 'Prof. Alan Vance' },
    { code: 'CS305', name: 'Artificial Intelligence', faculty: 'Dr. Michael Chen' },
  ];

  const records: AttendanceRecord[] = [];
  const baseDate = new Date();
  
  let recId = 1;
  for (let i = 18; i >= 1; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const sub = subjects[(recId - 1) % subjects.length];
    const status: 'Present' | 'Absent' = (recId % 6 === 0 || recId === 13) ? 'Absent' : 'Present';

    records.push({
      id: `att-base-${recId}`,
      studentId: studentId,
      studentName: 'Alex Rivera',
      rollNo: '21CS042',
      subjectId: sub.code,
      subjectName: sub.name,
      date: d.toISOString().split('T')[0],
      status: status,
      department: 'Computer Science & Engineering',
      semester: '5th Semester',
      markedBy: sub.faculty,
      createdAt: d.toISOString()
    });
    recId++;
  }

  return records;
}

// ==================== ATTENDANCE ====================
export async function getStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
  const all = getStoredItem<AttendanceRecord[]>('campus_attendance_store', []);
  const matching = all.filter(r => r.studentId === studentId);
  if (matching.length > 0) {
    return matching;
  }
  const baseline = generateBaselineAttendance(studentId);
  setStoredItem('campus_attendance_store', [...all, ...baseline]);
  return baseline;
}

export async function markStudentAttendance(records: Omit<AttendanceRecord, 'id' | 'createdAt'>[]): Promise<void> {
  const existing = getStoredItem<AttendanceRecord[]>('campus_attendance_store', []);
  const newRecords: AttendanceRecord[] = records.map((r, i) => ({
    ...r,
    id: `att-${Date.now()}-${i}`,
    createdAt: new Date().toISOString()
  }));
  setStoredItem('campus_attendance_store', [...newRecords, ...existing]);
}

export async function getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
  const all = getStoredItem<AttendanceRecord[]>('campus_attendance_store', []);
  if (all.length > 0) return all;
  const baseline = generateBaselineAttendance('21CS042');
  setStoredItem('campus_attendance_store', baseline);
  return baseline;
}

// ==================== TIMETABLE ====================
export async function getTimetable(department?: string): Promise<TimetableEntry[]> {
  let entries = getStoredItem<TimetableEntry[]>('campus_timetable_store', defaultTimetable);
  if (entries.length === 0) {
    entries = defaultTimetable;
    setStoredItem('campus_timetable_store', defaultTimetable);
  }
  if (department && department !== 'All') {
    return entries.filter(e => e.department === department);
  }
  return entries;
}

export async function addTimetableEntry(entry: Omit<TimetableEntry, 'id'>): Promise<string> {
  const current = getStoredItem<TimetableEntry[]>('campus_timetable_store', defaultTimetable);
  const id = `tt-${Date.now()}`;
  const newEntry: TimetableEntry = {
    ...entry,
    id,
    published: true
  };
  setStoredItem('campus_timetable_store', [...current, newEntry]);

  // Create notification
  await createNotification({
    title: `Timetable Updated: ${entry.subject}`,
    message: `${entry.day} ${entry.period} for ${entry.subject} in Room ${entry.room} has been scheduled.`,
    targetRole: 'student',
    department: entry.department,
    type: 'timetable_update',
    read: false,
    createdAt: new Date().toISOString()
  });

  return id;
}

export async function updateTimetableEntry(id: string, entry: Partial<TimetableEntry>): Promise<void> {
  const current = getStoredItem<TimetableEntry[]>('campus_timetable_store', defaultTimetable);
  const updated = current.map(item => item.id === id ? { ...item, ...entry } : item);
  setStoredItem('campus_timetable_store', updated);
}

export async function deleteTimetableEntry(id: string): Promise<void> {
  const current = getStoredItem<TimetableEntry[]>('campus_timetable_store', defaultTimetable);
  setStoredItem('campus_timetable_store', current.filter(item => item.id !== id));
}

// ==================== COMPLAINTS ====================
export async function getStudentComplaints(studentId: string): Promise<HostelComplaint[]> {
  const all = getStoredItem<HostelComplaint[]>('campus_complaints_store', []);
  return all.filter(c => c.studentId === studentId);
}

export async function getAllComplaints(): Promise<HostelComplaint[]> {
  return getStoredItem<HostelComplaint[]>('campus_complaints_store', []);
}

export async function createComplaint(complaint: Omit<HostelComplaint, 'id' | 'createdAt'>): Promise<string> {
  const current = getStoredItem<HostelComplaint[]>('campus_complaints_store', []);
  const id = `comp-${Date.now()}`;
  const newComplaint: HostelComplaint = {
    ...complaint,
    id,
    createdAt: new Date().toISOString()
  };
  setStoredItem('campus_complaints_store', [newComplaint, ...current]);

  await createNotification({
    title: `New Maintenance Ticket: ${complaint.category}`,
    message: `${complaint.studentName} reported: ${complaint.description} in Room ${complaint.roomNo}`,
    targetRole: 'admin',
    type: 'complaint_update',
    read: false,
    createdAt: new Date().toISOString()
  });

  return id;
}

export async function updateComplaintStatus(
  id: string, 
  status: ComplaintStatus, 
  assignedTo?: string,
  resolutionNotes?: string,
  studentId?: string
): Promise<void> {
  const current = getStoredItem<HostelComplaint[]>('campus_complaints_store', []);
  const updated = current.map(c => {
    if (c.id === id) {
      const u: HostelComplaint = {
        ...c,
        status,
        updatedAt: new Date().toISOString()
      };
      if (assignedTo) u.assignedTo = assignedTo;
      if (resolutionNotes) u.resolutionNotes = resolutionNotes;
      return u;
    }
    return c;
  });
  setStoredItem('campus_complaints_store', updated);

  if (studentId) {
    await createNotification({
      userId: studentId,
      title: `Hostel Complaint Status: ${status}`,
      message: `Your hostel ticket status was updated to "${status}". Notes: ${resolutionNotes || 'Under active processing'}`,
      targetRole: 'student',
      type: 'complaint_update',
      read: false,
      createdAt: new Date().toISOString()
    });
  }
}

// ==================== LEAVE REQUESTS ====================
export async function getStudentLeaves(studentId: string): Promise<LeaveRequest[]> {
  const all = getStoredItem<LeaveRequest[]>('campus_leaves_store', []);
  return all.filter(l => l.studentId === studentId);
}

export async function getAllLeaveRequests(): Promise<LeaveRequest[]> {
  return getStoredItem<LeaveRequest[]>('campus_leaves_store', []);
}

export const getAllLeaves = getAllLeaveRequests;

export async function createLeaveRequest(leave: Omit<LeaveRequest, 'id' | 'createdAt'>): Promise<string> {
  const current = getStoredItem<LeaveRequest[]>('campus_leaves_store', []);
  const id = `leave-${Date.now()}`;
  const newLeave: LeaveRequest = {
    ...leave,
    id,
    createdAt: new Date().toISOString()
  };
  setStoredItem('campus_leaves_store', [newLeave, ...current]);

  await createNotification({
    title: `Leave Application Submitted`,
    message: `${leave.studentName} requested leave from ${leave.fromDate} to ${leave.toDate}: ${leave.reason}`,
    targetRole: 'admin',
    department: leave.department,
    type: 'leave_update',
    read: false,
    createdAt: new Date().toISOString()
  });

  return id;
}

export async function updateLeaveStatus(
  id: string, 
  status: LeaveStatus, 
  remarks?: string,
  reviewedBy?: string,
  studentId?: string
): Promise<void> {
  const current = getStoredItem<LeaveRequest[]>('campus_leaves_store', []);
  const updated = current.map(l => {
    if (l.id === id) {
      const u: LeaveRequest = {
        ...l,
        status,
        updatedAt: new Date().toISOString()
      };
      if (remarks) u.remarks = remarks;
      if (reviewedBy) u.reviewedBy = reviewedBy;
      return u;
    }
    return l;
  });
  setStoredItem('campus_leaves_store', updated);

  if (studentId) {
    await createNotification({
      userId: studentId,
      title: `Leave Application ${status}`,
      message: `Your leave request has been marked as "${status}" by ${reviewedBy || 'Academic Authority'}. Remarks: ${remarks || 'None'}`,
      targetRole: 'student',
      type: 'leave_update',
      read: false,
      createdAt: new Date().toISOString()
    });
  }
}

// ==================== CERTIFICATES ====================
export async function getStudentCertificates(studentId: string): Promise<CertificateRequest[]> {
  const all = getStoredItem<CertificateRequest[]>('campus_certificates_store', []);
  return all.filter(c => c.studentId === studentId);
}

export async function getAllCertificateRequests(): Promise<CertificateRequest[]> {
  return getStoredItem<CertificateRequest[]>('campus_certificates_store', []);
}

export const getAllCertificates = getAllCertificateRequests;

export async function createCertificateRequest(cert: Omit<CertificateRequest, 'id' | 'createdAt'>): Promise<string> {
  const current = getStoredItem<CertificateRequest[]>('campus_certificates_store', []);
  const id = `cert-${Date.now()}`;
  const newCert: CertificateRequest = {
    ...cert,
    id,
    createdAt: new Date().toISOString()
  };
  setStoredItem('campus_certificates_store', [newCert, ...current]);

  await createNotification({
    title: `Certificate Request: ${cert.certificateType}`,
    message: `${cert.studentName} requested a ${cert.certificateType} for: ${cert.purpose}`,
    targetRole: 'admin',
    type: 'certificate_update',
    read: false,
    createdAt: new Date().toISOString()
  });

  return id;
}

export async function updateCertificateStatus(
  id: string,
  status: CertificateStatus,
  remarks?: string,
  reviewedBy?: string,
  studentId?: string,
  certificateType?: string
): Promise<void> {
  const current = getStoredItem<CertificateRequest[]>('campus_certificates_store', []);
  const updated = current.map(c => {
    if (c.id === id) {
      const u: CertificateRequest = {
        ...c,
        status,
        updatedAt: new Date().toISOString()
      };
      if (remarks) u.remarks = remarks;
      if (reviewedBy) u.reviewedBy = reviewedBy;
      if (status === 'Approved') {
        u.issuedDocumentUrl = '#';
      }
      return u;
    }
    return c;
  });
  setStoredItem('campus_certificates_store', updated);

  if (studentId) {
    await createNotification({
      userId: studentId,
      title: `Certificate Request ${status}`,
      message: `Your request for ${certificateType || 'Certificate'} was marked as "${status}" by ${reviewedBy || 'Academic Authority'}. ${remarks ? 'Remarks: ' + remarks : ''}`,
      targetRole: 'student',
      type: 'certificate_update',
      read: false,
      createdAt: new Date().toISOString()
    });
  }
}

// ==================== NOTIFICATIONS ====================
export async function createNotification(notif: Omit<CampusNotification, 'id'>): Promise<string> {
  const current = getStoredItem<CampusNotification[]>('campus_notifications_store', defaultAnnouncements);
  const id = `notif-${Date.now()}`;
  const newNotif: CampusNotification = {
    ...notif,
    id
  };
  setStoredItem('campus_notifications_store', [newNotif, ...current]);
  return id;
}

export async function getNotifications(user?: UserProfile): Promise<CampusNotification[]> {
  let list = getStoredItem<CampusNotification[]>('campus_notifications_store', defaultAnnouncements);
  if (list.length === 0) {
    list = defaultAnnouncements;
    setStoredItem('campus_notifications_store', defaultAnnouncements);
  }
  
  if (!user) return list;

  return list.filter(n => {
    if (n.userId && n.userId === user.id) return true;
    if (n.targetRole === 'all') return true;
    if (n.targetRole === user.role) {
      if (!n.department || n.department === 'All' || n.department === user.department) {
        return true;
      }
    }
    return false;
  }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

// ==================== PREVIOUS PAPERS ====================
export async function getPreviousPapers(): Promise<PreviousPaper[]> {
  let papers = getStoredItem<PreviousPaper[]>('campus_papers_store', defaultPreviousPapers);
  if (papers.length === 0) {
    papers = defaultPreviousPapers;
    setStoredItem('campus_papers_store', defaultPreviousPapers);
  }
  return papers;
}

export async function addPreviousPaper(paper: Omit<PreviousPaper, 'id'>): Promise<string> {
  const current = getStoredItem<PreviousPaper[]>('campus_papers_store', defaultPreviousPapers);
  const id = `paper-${Date.now()}`;
  const newPaper: PreviousPaper = {
    ...paper,
    id
  };
  setStoredItem('campus_papers_store', [newPaper, ...current]);
  return id;
}

// ==================== STUDENTS / ADMIN MANAGEMENT ====================
const defaultStudents: UserProfile[] = [
  {
    id: 'stud-1',
    name: 'Alex Rivera',
    email: 'student.demo@campus.edu',
    role: 'student',
    studentId: '21CS042',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: '5th Semester',
    phone: '+1 (555) 234-5678',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'stud-2',
    name: 'Chloe Bennett',
    email: 'chloe.bennett@campus.edu',
    role: 'student',
    studentId: '21CS043',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: '5th Semester',
    phone: '+1 (555) 345-6789',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'stud-3',
    name: 'David Zhao',
    email: 'david.zhao@campus.edu',
    role: 'student',
    studentId: '21CS044',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: '5th Semester',
    phone: '+1 (555) 456-7890',
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

export async function getAllStudents(): Promise<UserProfile[]> {
  const registeredUsersRaw = localStorage.getItem('campus_auth_profiles');
  const registeredUsers: Record<string, UserProfile> = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : {};
  
  const uniqueStudents: UserProfile[] = [];
  const seenIds = new Set<string>();
  const seenEmails = new Set<string>();

  // Process registered students and deduplicate strictly
  for (const u of Object.values(registeredUsers)) {
    if (u && typeof u === 'object' && u.role === 'student' && u.id) {
      if (seenIds.has(u.id)) continue;
      if (u.email && seenEmails.has(u.email.toLowerCase())) continue;
      seenIds.add(u.id);
      if (u.email) seenEmails.add(u.email.toLowerCase());
      uniqueStudents.push(u);
    }
  }

  // Include default institutional students if not already overridden/present
  defaultStudents.forEach(ds => {
    if (!seenIds.has(ds.id) && (!ds.email || !seenEmails.has(ds.email.toLowerCase()))) {
      seenIds.add(ds.id);
      if (ds.email) seenEmails.add(ds.email.toLowerCase());
      uniqueStudents.push(ds);
    }
  });

  return uniqueStudents;
}

export async function updateStudentStatus(studentId: string, status: 'active' | 'inactive'): Promise<void> {
  const registeredUsersRaw = localStorage.getItem('campus_auth_profiles');
  const registeredUsers: Record<string, UserProfile> = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : {};
  if (registeredUsers[studentId]) {
    registeredUsers[studentId].status = status;
    localStorage.setItem('campus_auth_profiles', JSON.stringify(registeredUsers));
  }
}

export async function updateStudentProfile(studentId: string, data: Partial<UserProfile>): Promise<void> {
  const registeredUsersRaw = localStorage.getItem('campus_auth_profiles');
  const registeredUsers: Record<string, UserProfile> = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : {};
  if (registeredUsers[studentId]) {
    registeredUsers[studentId] = { ...registeredUsers[studentId], ...data };
    localStorage.setItem('campus_auth_profiles', JSON.stringify(registeredUsers));
  }
}
