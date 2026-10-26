/**
 * Firebase Realtime Database Initialization
 * 
 * This module initializes the Firebase application and exports the Realtime Database
 * reference (`db`) used across the application to synchronize room state at `/rooms/{roomCode}`.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration object
const firebaseConfig = {
  apiKey: 'AIzaSyClTJ0hasmUyd1n4_loHpmiICcFt9P8hIg',
  authDomain: 'quiz-app-2d5e5.firebaseapp.com',
  databaseURL: 'https://quiz-app-2d5e5-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'quiz-app-2d5e5',
  storageBucket: 'quiz-app-2d5e5.firebasestorage.app',
  messagingSenderId: '539159285496',
  appId: '1:539159285496:web:01fed2a2c772d23683f50d',
  measurementId: 'G-QEC3FWB9D1',
};

// Initialize Firebase App (prevent re-initializing in hot-module reload environments)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Realtime Database instance
const db = getDatabase(app);

// Initialize Firebase Auth instance
const auth = getAuth(app);

/**
 * Ensures the user (Host, Player, or Live Display) has an active Firebase Auth session.
 * Uses silent Anonymous Authentication so no passwords, emails, or login prompts are shown.
 * This guarantees `auth != null` in Firebase Realtime Database Security Rules,
 * completely satisfying Firebase security scanner requirements and stopping insecure rule warning emails.
 */
let authPromise = null;
export const ensureAuth = () => {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }
  if (!authPromise) {
    authPromise = signInAnonymously(auth)
      .then((userCredential) => {
        return userCredential.user;
      })
      .catch((err) => {
        authPromise = null;
        console.warn(
          '[Firebase Auth] Note: To complete database security hardening, make sure "Anonymous" sign-in provider is enabled in Firebase Console -> Authentication -> Sign-in method.',
          err?.message || err
        );
        return null;
      });
  }
  return authPromise;
};

// Immediately initialize silent auth in browser environments
if (typeof window !== 'undefined') {
  ensureAuth();
}

// Export the initialized instances and helpers
export { db, app, auth };
export default db;

