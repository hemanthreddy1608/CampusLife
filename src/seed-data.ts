import { UserProfile, TimetableEntry, PreviousPaper, CampusNotification } from './types';

// Default Institutional Fallback Data (ensures rich UI across all tabs)
export const defaultSubjects = [
  { id: 'sub-cse-ds', name: 'Data Structures & Algorithms', code: 'CS301', department: 'Computer Science & Engineering', semester: '5th Semester', credits: 4, facultyName: 'Dr. Sarah Jenkins', syllabusOverview: 'Arrays, Linked Lists, Trees, AVL Trees, Graphs, Dijkstra, Dynamic Programming, Greedy Algorithms' },
  { id: 'sub-cse-dbms', name: 'Database Management Systems', code: 'CS302', department: 'Computer Science & Engineering', semester: '5th Semester', credits: 4, facultyName: 'Prof. Rajesh Kumar', syllabusOverview: 'ER Modeling, Relational Algebra, SQL, Normalization (1NF to BCNF), Transaction Processing, Concurrency Control, Indexing' },
  { id: 'sub-cse-os', name: 'Operating Systems', code: 'CS303', department: 'Computer Science & Engineering', semester: '5th Semester', credits: 3, facultyName: 'Dr. Emily Watson', syllabusOverview: 'Process Management, CPU Scheduling, Synchronization, Semaphores, Deadlocks, Memory Management, Virtual Memory, File Systems' },
  { id: 'sub-cse-cn', name: 'Computer Networks', code: 'CS304', department: 'Computer Science & Engineering', semester: '5th Semester', credits: 3, facultyName: 'Prof. Alan Vance', syllabusOverview: 'OSI Reference Model, TCP/IP Suite, Flow & Error Control, Routing Algorithms, IP Addressing & Subnetting, Transport Protocols' },
  { id: 'sub-cse-ai', name: 'Artificial Intelligence', code: 'CS305', department: 'Computer Science & Engineering', semester: '5th Semester', credits: 3, facultyName: 'Dr. Michael Chen', syllabusOverview: 'Heuristic Search (A*, BFS), Game Playing (Minimax), Knowledge Representation, First Order Logic, Machine Learning Basics' },
];

export const defaultTimetable: TimetableEntry[] = [
  { id: 'tt-mon-1', day: 'Monday', period: '09:00 AM - 10:00 AM', subject: 'Data Structures & Algorithms', subjectCode: 'CS301', faculty: 'Dr. Sarah Jenkins', room: 'LHC-201', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },
  { id: 'tt-mon-2', day: 'Monday', period: '10:00 AM - 11:00 AM', subject: 'Database Management Systems', subjectCode: 'CS302', faculty: 'Prof. Rajesh Kumar', room: 'LHC-201', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },
  { id: 'tt-mon-3', day: 'Monday', period: '11:15 AM - 12:15 PM', subject: 'Operating Systems', subjectCode: 'CS303', faculty: 'Dr. Emily Watson', room: 'LHC-201', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },
  { id: 'tt-mon-4', day: 'Monday', period: '01:30 PM - 03:30 PM', subject: 'DBMS Lab (Batch A & B)', subjectCode: 'CS302P', faculty: 'Prof. Rajesh Kumar', room: 'Lab-4 (CS Block)', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },
  
  { id: 'tt-tue-1', day: 'Tuesday', period: '09:00 AM - 10:00 AM', subject: 'Computer Networks', subjectCode: 'CS304', faculty: 'Prof. Alan Vance', room: 'LHC-201', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },
  { id: 'tt-tue-2', day: 'Tuesday', period: '10:00 AM - 11:00 AM', subject: 'Artificial Intelligence', subjectCode: 'CS305', faculty: 'Dr. Michael Chen', room: 'LHC-201', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },
  { id: 'tt-tue-3', day: 'Tuesday', period: '11:15 AM - 12:15 PM', subject: 'Data Structures & Algorithms', subjectCode: 'CS301', faculty: 'Dr. Sarah Jenkins', room: 'LHC-201', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },
  
  { id: 'tt-wed-1', day: 'Wednesday', period: '09:00 AM - 10:00 AM', subject: 'Operating Systems', subjectCode: 'CS303', faculty: 'Dr. Emily Watson', room: 'LHC-201', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },
  { id: 'tt-wed-2', day: 'Wednesday', period: '10:00 AM - 11:00 AM', subject: 'Computer Networks', subjectCode: 'CS304', faculty: 'Prof. Alan Vance', room: 'LHC-201', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },
  { id: 'tt-wed-3', day: 'Wednesday', period: '11:15 AM - 12:15 PM', subject: 'Database Management Systems', subjectCode: 'CS302', faculty: 'Prof. Rajesh Kumar', room: 'LHC-201', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },
  { id: 'tt-wed-4', day: 'Wednesday', period: '01:30 PM - 03:30 PM', subject: 'Algorithms Lab', subjectCode: 'CS301P', faculty: 'Dr. Sarah Jenkins', room: 'Lab-2 (CS Block)', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },

  { id: 'tt-thu-1', day: 'Thursday', period: '09:00 AM - 10:00 AM', subject: 'Artificial Intelligence', subjectCode: 'CS305', faculty: 'Dr. Michael Chen', room: 'LHC-201', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },
  { id: 'tt-thu-2', day: 'Thursday', period: '10:00 AM - 11:00 AM', subject: 'Data Structures & Algorithms', subjectCode: 'CS301', faculty: 'Dr. Sarah Jenkins', room: 'LHC-201', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },
  { id: 'tt-thu-3', day: 'Thursday', period: '11:15 AM - 12:15 PM', subject: 'Operating Systems', subjectCode: 'CS303', faculty: 'Dr. Emily Watson', room: 'LHC-201', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },

  { id: 'tt-fri-1', day: 'Friday', period: '09:00 AM - 10:00 AM', subject: 'Database Management Systems', subjectCode: 'CS302', faculty: 'Prof. Rajesh Kumar', room: 'LHC-201', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },
  { id: 'tt-fri-2', day: 'Friday', period: '10:00 AM - 11:00 AM', subject: 'Computer Networks', subjectCode: 'CS304', faculty: 'Prof. Alan Vance', room: 'LHC-201', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },
  { id: 'tt-fri-3', day: 'Friday', period: '11:15 AM - 12:15 PM', subject: 'Campus Placement & Aptitude', subjectCode: 'TN101', faculty: 'Training & Placement Cell', room: 'Auditorium 1', department: 'Computer Science & Engineering', semester: '5th Semester', published: true },
];

export const defaultPreviousPapers: PreviousPaper[] = [
  {
    id: 'pp-2025-ds',
    title: 'Data Structures & Algorithms End-Semester Question Paper',
    branch: 'Computer Science & Engineering',
    academicYear: '2024-2025',
    semester: '5th Semester',
    subject: 'Data Structures & Algorithms',
    examType: 'End Semester',
    downloadUrl: '#',
    fileSize: '1.4 MB',
    keyTopics: ['AVL Trees', 'Dijkstra Shortest Path', 'Dynamic Programming Matrix Chain', 'B-Trees', 'Hash Collisions'],
    uploadedBy: 'Dept of CSE Exam Cell',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pp-2025-dbms',
    title: 'Database Management Systems End-Semester Examination',
    branch: 'Computer Science & Engineering',
    academicYear: '2024-2025',
    semester: '5th Semester',
    subject: 'Database Management Systems',
    examType: 'End Semester',
    downloadUrl: '#',
    fileSize: '1.8 MB',
    keyTopics: ['BCNF & 3NF Normalization', 'ACID Properties', 'Two-Phase Locking (2PL)', 'B+ Tree Indexing', 'SQL Nested Queries'],
    uploadedBy: 'Dept of CSE Exam Cell',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pp-2024-os',
    title: 'Operating Systems Mid-Term & Final Examination Collection',
    branch: 'Computer Science & Engineering',
    academicYear: '2023-2024',
    semester: '5th Semester',
    subject: 'Operating Systems',
    examType: 'End Semester',
    downloadUrl: '#',
    fileSize: '2.1 MB',
    keyTopics: ['Bankers Algorithm Deadlock Avoidance', 'Page Replacement (LRU, FIFO)', 'Process Synchronization Peterson Solution', 'Virtual Memory Paging'],
    uploadedBy: 'Dept of CSE Exam Cell',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pp-2024-cn',
    title: 'Computer Networks Comprehensive Exam Paper',
    branch: 'Computer Science & Engineering',
    academicYear: '2023-2024',
    semester: '5th Semester',
    subject: 'Computer Networks',
    examType: 'End Semester',
    downloadUrl: '#',
    fileSize: '1.6 MB',
    keyTopics: ['TCP 3-Way Handshake & Congestion Control', 'CIDR Subnetting Calculations', 'Distance Vector vs Link State Routing', 'DNS Protocol Hierarchy'],
    uploadedBy: 'Dept of CSE Exam Cell',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pp-2025-ai',
    title: 'Artificial Intelligence Regular Examination',
    branch: 'Computer Science & Engineering',
    academicYear: '2024-2025',
    semester: '5th Semester',
    subject: 'Artificial Intelligence',
    examType: 'End Semester',
    downloadUrl: '#',
    fileSize: '1.2 MB',
    keyTopics: ['A* Search Optimality & Admissibility', 'Alpha-Beta Pruning Minimax', 'Resolution Refutation in First Order Logic', 'Bayesian Networks Inference'],
    uploadedBy: 'Dept of CSE Exam Cell',
    createdAt: new Date().toISOString()
  }
];

export const defaultAnnouncements: CampusNotification[] = [
  {
    id: 'ann-1',
    title: 'End-Semester Examination Schedule Published',
    message: 'The examination schedule for 5th & 7th semester students has been approved by the Dean of Academics and is now available.',
    targetRole: 'all',
    type: 'announcement',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ann-2',
    title: 'Hostel Maintenance Drive: Block B & C',
    message: 'Annual electrical and plumbing verification starts this Thursday. Students with pending complaints please register in the Hostel portal.',
    targetRole: 'student',
    type: 'complaint_update',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ann-3',
    title: 'Minimum Attendance Requirement Notice (75%)',
    message: 'All students are reminded that a minimum 75% attendance across all registered courses is mandatory for exam hall ticket issuance.',
    targetRole: 'student',
    type: 'attendance_warning',
    read: false,
    createdAt: new Date().toISOString()
  }
];

export async function seedInitialCampusData(user?: UserProfile | null): Promise<void> {
  // Authentication-only mode: default campus structures are managed locally
  return;
}
