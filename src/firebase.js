/**
 * Firebase Realtime Database Initialization
 * 
 * This module initializes the Firebase application and exports the Realtime Database
 * reference (`db`) used across the application to synchronize room state at `/rooms/{roomCode}`.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  setPersistence,
  inMemoryPersistence
} from 'firebase/auth';

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
 * Includes in-memory persistence fallback for restricted in-app browsers (e.g. iOS Camera QR scanner)
 * and support for force-refreshing tokens if a socket sync delay occurs.
 */
let authPromise = null;
export const ensureAuth = async (forceRefresh = false) => {
  // If user already authenticated and not forcing a refresh, return current user
  if (auth.currentUser && !forceRefresh) {
    return auth.currentUser;
  }

  // If force refresh requested on existing user, force token refresh with Firebase
  if (forceRefresh && auth.currentUser) {
    try {
      await auth.currentUser.getIdToken(true);
      return auth.currentUser;
    } catch (e) {
      console.warn('[Firebase Auth] Force token refresh encountered an error, re-signing in:', e);
    }
  }

  // If a sign-in is currently underway and not forced, reuse existing promise
  if (authPromise && !forceRefresh) {
    return authPromise;
  }

  authPromise = (async () => {
    // Attempt 1: Standard anonymous sign-in (persisted in IndexedDB/localStorage)
    try {
      const userCredential = await signInAnonymously(auth);
      return userCredential.user;
    } catch (err) {
      console.warn(
        '[Firebase Auth] Primary anonymous sign-in attempt failed, trying in-memory fallback:',
        err?.message || err
      );

      // Attempt 2: In-app browsers (such as iOS Camera QR scanner) may block IndexedDB.
      // Fallback to inMemoryPersistence so auth succeeds even under strict ephemeral sandbox conditions.
      try {
        if (typeof setPersistence === 'function' && inMemoryPersistence) {
          await setPersistence(auth, inMemoryPersistence);
        }
        const fallbackCred = await signInAnonymously(auth);
        return fallbackCred.user;
      } catch (fallbackErr) {
        console.error(
          '[Firebase Auth] All anonymous sign-in attempts failed:',
          fallbackErr?.message || fallbackErr
        );
        authPromise = null;
        return null;
      }
    }
  })();

  return authPromise;
};

// Immediately initialize silent auth in browser environments
if (typeof window !== 'undefined') {
  ensureAuth();
}

// Export the initialized instances and helpers
export { db, app, auth };
export default db;

