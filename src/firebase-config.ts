import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCGI_KpN9gNEXD9I4CDJqhguYg2w2o66Gk",
  authDomain: "campuslife-a5b8b.firebaseapp.com",
  projectId: "campuslife-a5b8b",
  storageBucket: "campuslife-a5b8b.firebasestorage.app",
  messagingSenderId: "593618768713",
  appId: "1:593618768713:web:e0006a0bceb5e1dbb88098"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth (Firebase Authentication only - No Firestore or Storage)
export const auth = getAuth(app);

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
};

export type { FirebaseUser };
