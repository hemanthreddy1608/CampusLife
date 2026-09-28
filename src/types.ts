export type Role = 'student' | 'admin';
export type AdminRole = 'Principal' | 'Dean' | 'Branch HOD' | 'Faculty/Staff';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  adminHierarchy?: AdminRole;
  studentId?: string;
  department: string;
  year?: string;
  semester?: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt?: any;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  rollNo?: string;
  subjectId: string;
  subjectName: string;
  department: string;
  semester: string;
  date: string;
  status: 'Present' | 'Absent' | 'Excused';
  markedBy: string;
  markedByName?: string;
  createdAt?: any;
}

export interface TimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: string; // e.g., '09:00 AM - 10:00 AM'
  subject: string;
  subjectCode: string;
  faculty: string;
  room: string;
  department: string;
  semester: string;
  published: boolean;
  updatedAt?: any;
}

export type ComplaintStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';

export interface HostelComplaint {
  id: string;
  studentId: string;
  studentName: string;
  roomNo: string;
  category: 'Electrical' | 'Plumbing' | 'Carpentry' | 'Cleanliness' | 'Wi-Fi / Internet' | 'Mess / Food' | 'Security' | 'Other';
  description: string;
  status: ComplaintStatus;
  assignedTo?: string;
  resolutionNotes?: string;
  createdAt: any;
  updatedAt?: any;
}

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  department: string;
  fromDate: string;
  toDate: string;
  reason: string;
  emergencyContact?: string;
  status: LeaveStatus;
  remarks?: string;
  reviewedBy?: string;
  createdAt: any;
  updatedAt?: any;
}

export type CertificateType = 'Bonafide Certificate' | 'Character Certificate' | 'Fee Structure' | 'No Objection Certificate (NOC)' | 'Course Completion' | 'Transfer Certificate (TC)';
export type CertificateStatus = 'Pending' | 'Approved' | 'Rejected';

export interface CertificateRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  department: string;
  certificateType: CertificateType;
  purpose: string;
  status: CertificateStatus;
  remarks?: string;
  reviewedBy?: string;
  issuedDocumentUrl?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface CampusNotification {
  id: string;
  userId?: string; // empty means global or department broad broadcast
  targetRole?: 'all' | 'student' | 'admin';
  department?: string;
  title: string;
  message: string;
  type: 'attendance_warning' | 'timetable_update' | 'leave_update' | 'complaint_update' | 'certificate_update' | 'announcement';
  read: boolean;
  createdAt: any;
}

export interface PreviousPaper {
  id: string;
  title: string;
  branch: string;
  academicYear: string;
  semester: string;
  subject: string;
  examType: 'Mid-Term 1' | 'Mid-Term 2' | 'End Semester' | 'Supplementary';
  downloadUrl?: string;
  fileSize?: string;
  keyTopics?: string[];
  uploadedBy?: string;
  createdAt: any;
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  department: string;
  semester: string;
  credits: number;
  facultyName: string;
  syllabusOverview?: string;
}

export interface AptitudeQuestion {
  id: string;
  category: 'Quantitative Aptitude' | 'Logical Reasoning' | 'Verbal Ability';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
