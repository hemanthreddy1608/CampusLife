import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from './firebase-config';
import { UserProfile, Role, AdminRole } from './types';

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const STORAGE_USERS_KEY = 'campus_auth_profiles';

// Helper to get local profiles store (always keyed by UID only)
function getLocalProfiles(): Record<string, UserProfile> {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const cleanStore: Record<string, UserProfile> = {};
    for (const [, value] of Object.entries(parsed)) {
      if (value && typeof value === 'object' && (value as UserProfile).id) {
        cleanStore[(value as UserProfile).id] = value as UserProfile;
      }
    }
    return cleanStore;
  } catch (e) {
    return {};
  }
}

// Helper to save a profile
function saveLocalProfile(profile: UserProfile): void {
  try {
    const store = getLocalProfiles();
    store[profile.id] = profile;
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('Failed to save profile to localStorage:', e);
  }
}

// Fetch user profile by UID or currentUser
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const store = getLocalProfiles();
  if (store[uid]) {
    return store[uid];
  }

  // Fallback to checking by current user email
  const currentEmail = auth.currentUser?.email?.toLowerCase();
  if (currentEmail) {
    const existing = Object.values(store).find(p => p.email?.toLowerCase() === currentEmail);
    if (existing) {
      const prof = { ...existing, id: uid };
      saveLocalProfile(prof);
      return prof;
    }
  }

  // If user is authenticated in Firebase Auth but no profile exists in storage (e.g. fresh browser)
  if (auth.currentUser) {
    const email = auth.currentUser.email || '';
    const isStudent = email.includes('student') || !email.includes('admin');
    const defaultProfile: UserProfile = {
      id: uid,
      name: auth.currentUser.displayName || (isStudent ? 'Alex Rivera' : 'Dr. Robert Sterling'),
      email: email,
      role: isStudent ? 'student' : 'admin',
      studentId: isStudent ? '21CS042' : undefined,
      adminHierarchy: !isStudent ? 'Principal' : undefined,
      department: isStudent ? 'Computer Science & Engineering' : 'Administration',
      year: isStudent ? '3rd Year' : undefined,
      semester: isStudent ? '5th Semester' : undefined,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    saveLocalProfile(defaultProfile);
    return defaultProfile;
  }

  return null;
}

// Student registration with Firebase Auth and local profile
export async function registerStudent(params: {
  email: string;
  password: string;
  name: string;
  studentId: string;
  department: string;
  year: string;
  semester: string;
  phone?: string;
}): Promise<UserProfile> {
  // 1. Create user in Firebase Authentication
  const credential = await createUserWithEmailAndPassword(auth, params.email, params.password);
  const uid = credential.user.uid;

  // 2. Update display name in Firebase Auth
  try {
    await updateProfile(credential.user, { displayName: params.name });
  } catch (e) {
    console.warn('Failed to update display name:', e);
  }

  // 3. Send email verification
  try {
    await sendEmailVerification(credential.user);
  } catch (e) {
    console.warn('Could not send verification email in test mode:', e);
  }

  // 4. Construct user profile
  const profile: UserProfile = {
    id: uid,
    name: params.name,
    email: params.email,
    role: 'student',
    studentId: params.studentId,
    department: params.department,
    year: params.year,
    semester: params.semester,
    phone: params.phone || '',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  saveLocalProfile(profile);
  return profile;
}

// Admin registration / onboarding with hierarchy
export async function registerAdmin(params: {
  email: string;
  password: string;
  name: string;
  adminHierarchy: AdminRole;
  department: string;
  phone?: string;
}): Promise<UserProfile> {
  // 1. Create user in Firebase Authentication
  const credential = await createUserWithEmailAndPassword(auth, params.email, params.password);
  const uid = credential.user.uid;

  // 2. Update display name in Firebase Auth
  try {
    await updateProfile(credential.user, { displayName: params.name });
  } catch (e) {
    console.warn('Failed to update display name:', e);
  }

  // 3. Send email verification
  try {
    await sendEmailVerification(credential.user);
  } catch (e) {
    console.warn('Could not send verification email:', e);
  }

  // 4. Construct user profile
  const profile: UserProfile = {
    id: uid,
    name: params.name,
    email: params.email,
    role: 'admin',
    adminHierarchy: params.adminHierarchy,
    department: params.department,
    phone: params.phone || '',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  saveLocalProfile(profile);
  return profile;
}

// Login with verification and role enforcement
export async function loginWithRole(
  email: string, 
  password: string, 
  requiredRole: Role
): Promise<{ profile: UserProfile; emailVerified: boolean }> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    let profile = await fetchUserProfile(uid);
    if (!profile) {
      profile = {
        id: uid,
        name: requiredRole === 'student' ? 'Alex Rivera' : 'Dr. Robert Sterling',
        email: email,
        role: requiredRole,
        studentId: requiredRole === 'student' ? '21CS042' : undefined,
        adminHierarchy: requiredRole === 'admin' ? 'Principal' : undefined,
        department: requiredRole === 'student' ? 'Computer Science & Engineering' : 'Administration',
        year: requiredRole === 'student' ? '3rd Year' : undefined,
        semester: requiredRole === 'student' ? '5th Semester' : undefined,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      saveLocalProfile(profile);
    }

    if (profile.role !== requiredRole) {
      await signOut(auth);
      throw new Error(
        `Access Denied: You are trying to login through the ${requiredRole.toUpperCase()} portal with a ${profile.role.toUpperCase()} account.`
      );
    }

    if (profile.status === 'inactive') {
      await signOut(auth);
      throw new Error('Your campus account has been temporarily deactivated. Please visit the Dean/Registrar office.');
    }

    return {
      profile,
      emailVerified: credential.user.emailVerified
    };
  } catch (err: any) {
    const isAuthErr = 
      err.code === 'auth/user-not-found' || 
      err.code === 'auth/invalid-credential' || 
      err.code === 'auth/invalid-login-credentials';

    // Auto-provision demo accounts in the new Firebase project if not created yet
    if (
      isAuthErr &&
      (email === 'student.demo@campus.edu' || email === 'admin.principal@campus.edu')
    ) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;
        const profile: UserProfile = {
          id: uid,
          name: requiredRole === 'student' ? 'Alex Rivera' : 'Dr. Robert Sterling',
          email: email,
          role: requiredRole,
          studentId: requiredRole === 'student' ? '21CS042' : undefined,
          adminHierarchy: requiredRole === 'admin' ? 'Principal' : undefined,
          department: requiredRole === 'student' ? 'Computer Science & Engineering' : 'Administration',
          year: requiredRole === 'student' ? '3rd Year' : undefined,
          semester: requiredRole === 'student' ? '5th Semester' : undefined,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        saveLocalProfile(profile);
        return {
          profile,
          emailVerified: true
        };
      } catch (createErr: any) {
        throw new Error(createErr.message || 'Failed to initialize demo account in Firebase.');
      }
    }
    throw err;
  }
}

// Send verification email
export async function triggerEmailVerification(): Promise<void> {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
}

// Password reset
export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// Logout
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
