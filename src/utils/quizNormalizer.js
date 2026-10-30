/**
 * Quiz Normalizer & Firebase Sanitization Utilities
 * 
 * Ensures all question data written to or read from Firebase Realtime Database:
 * 1. Contains ZERO undefined values (which crash Firebase update/set operations)
 * 2. Correctly normalizes both Array and Object representations from Firebase RTDB
 * 3. Enforces clean schema defaults for all 5 slide types (Choice, Free-Text, Closest-Pin, På Spåret, Splash, End)
 * 4. Supports URL-encoded quiz sharing so 1-click links work even if cloud storage is restricted
 */

import { DEFAULT_INTRO_RULES_SPLASH } from '../data/introSplashDefaults.js';
import LZString from 'lz-string';

export const DEFAULT_END_SCREEN = {
  id: 'final-end-screen',
  type: 'end',
  title: "Final Scoreboard & Winners' Podium",
  subtitle: 'Congratulations to our champions and all participants!',
  showFullLeaderboard: true,
  enableConfetti: true,
  isPermanent: true
};

const ACTIVE_QUIZ_LOCAL_KEY = 'quizpulse_current_active_quiz';

/**
 * Normalizes question collections from Firebase RTDB into a standard JavaScript Array.
 * Firebase RTDB sometimes returns sparse arrays or objects with numeric keys { 0: {...}, 1: {...} }.
 */
export function normalizeQuestionsArray(rawQuestions) {
  if (!rawQuestions) return [];
  if (Array.isArray(rawQuestions)) return rawQuestions;
  if (typeof rawQuestions === 'object') {
    return Object.keys(rawQuestions)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => rawQuestions[k])
      .filter(Boolean);
  }
  return [];
}

/**
 * Sanitizes an individual question slide into a pristine, serializable object.
 * Strictly avoids undefined values so Firebase update/set never throws.
 */
export function sanitizeQuestionForFirebase(q, idx = 0, fallbackScoreboard = false) {
  if (!q || typeof q !== 'object') {
    return {
      id: idx + 1,
      type: 'question',
      question: `Question ${idx + 1}`,
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctIndex: 0,
      points: 1,
      secretNote: '',
      timeLimit: 60,
      showScoreboardAfterQuestion: Boolean(fallbackScoreboard)
    };
  }

  const type = q.type || 'question';
  const id = q.id !== undefined && q.id !== null ? q.id : idx + 1;
  const showScoreboard = q.showScoreboardAfterQuestion !== undefined
    ? Boolean(q.showScoreboardAfterQuestion)
    : Boolean(fallbackScoreboard);

  // 1. End Screen
  if (type === 'end') {
    return {
      id: 'final-end-screen',
      type: 'end',
      title: q.title || DEFAULT_END_SCREEN.title,
      subtitle: q.subtitle || DEFAULT_END_SCREEN.subtitle,
      showFullLeaderboard: q.showFullLeaderboard !== undefined ? Boolean(q.showFullLeaderboard) : true,
      enableConfetti: q.enableConfetti !== undefined ? Boolean(q.enableConfetti) : true,
      isPermanent: true
    };
  }

  // 2. Splash Screen
  if (type === 'splash') {
    const splashObj = {
      id,
      type: 'splash',
      badge: q.badge || 'Welcome',
      title: q.title || 'Welcome to QuizPulse Live!',
      subtitle: q.subtitle || '',
      imageUrl: q.imageUrl || ''
    };
    if (Array.isArray(q.rules) && q.rules.length > 0) {
      splashObj.rules = q.rules.map((r, rIdx) => ({
        id: r.id || rIdx + 1,
        title: r.title || `Rule ${rIdx + 1}`,
        description: r.description || ''
      }));
    }
    return splashObj;
  }

  // 3. Closest Pin (World Map)
  if (type === 'closest_pin') {
    return {
      id,
      type: 'closest_pin',
      question: q.question || 'Where in the world was this photo taken?',
      landmarkName: q.landmarkName || 'Mystery Landmark',
      locationName: q.locationName || '',
      lat: q.lat !== undefined && !isNaN(Number(q.lat)) ? Number(q.lat) : 48.8584,
      lng: q.lng !== undefined && !isNaN(Number(q.lng)) ? Number(q.lng) : 2.2945,
      unit: q.unit === 'mi' || q.unit === 'miles' ? 'mi' : 'km',
      imageUrl: q.imageUrl || '',
      points: q.points !== undefined && q.points !== '' && !isNaN(Number(q.points)) ? Math.max(0, Number(q.points)) : 1,
      secretNote: q.secretNote || '',
      timeLimit: q.timeLimit && !isNaN(Number(q.timeLimit)) ? Number(q.timeLimit) : 60,
      showScoreboardAfterQuestion: showScoreboard
    };
  }

  // 4. Free Input (Typo Buffer)
  if (type === 'free_input') {
    return {
      id,
      type: 'free_input',
      question: q.question || 'Type your free-text question here...',
      correctAnswer: q.correctAnswer || '',
      acceptedAnswers: q.acceptedAnswers || '',
      imageUrl: q.imageUrl || '',
      points: q.points !== undefined && q.points !== '' && !isNaN(Number(q.points)) ? Math.max(0, Number(q.points)) : 1,
      secretNote: q.secretNote || '',
      timeLimit: q.timeLimit && !isNaN(Number(q.timeLimit)) ? Number(q.timeLimit) : 60,
      showScoreboardAfterQuestion: showScoreboard
    };
  }

  // 5. På Spåret (Train Journey)
  if (type === 'pa_sparet') {
    const rawClues = Array.isArray(q.clues) && q.clues.length === 5 ? q.clues : [
      { tier: 10, timeSec: 0, text: '' },
      { tier: 8, timeSec: 20, text: '' },
      { tier: 6, timeSec: 40, text: '' },
      { tier: 4, timeSec: 60, text: '' },
      { tier: 2, timeSec: 80, text: '' }
    ];

    const cleanClues = rawClues.map((c, cIdx) => ({
      tier: c.tier !== undefined ? Number(c.tier) : (10 - cIdx * 2),
      timeSec: c.timeSec !== undefined ? Number(c.timeSec) : (cIdx * 20),
      text: c.text || ''
    }));

    return {
      id,
      type: 'pa_sparet',
      question: q.question || 'Where are we heading? / Vart är vi på väg?',
      destination: q.destination || q.correctAnswer || '',
      acceptedAnswers: q.acceptedAnswers || '',
      youtubeUrl: q.youtubeUrl || '',
      videoStartTime: q.videoStartTime !== undefined && !isNaN(Number(q.videoStartTime)) ? Number(q.videoStartTime) : 0,
      duration: q.duration && !isNaN(Number(q.duration)) ? Number(q.duration) : 90,
      clues: cleanClues,
      imageUrl: q.imageUrl || '',
      points: 10,
      secretNote: q.secretNote || '',
      timeLimit: q.timeLimit && !isNaN(Number(q.timeLimit)) ? Number(q.timeLimit) : 90,
      showScoreboardAfterQuestion: showScoreboard
    };
  }

  // 6. Standard 4-Choice Question
  const rawOptions = Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
  const cleanOptions = rawOptions.slice(0, 4).map((opt) => (opt !== undefined && opt !== null ? String(opt) : ''));
  while (cleanOptions.length < 4) {
    cleanOptions.push(`Option ${cleanOptions.length + 1}`);
  }

  const correctIndex = typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < 4 ? q.correctIndex : 0;

  return {
    id,
    type: 'question',
    question: q.question || 'New Multiple-Choice Question',
    options: cleanOptions,
    correctIndex,
    imageUrl: q.imageUrl || '',
    points: q.points !== undefined && q.points !== '' && !isNaN(Number(q.points)) ? Math.max(0, Number(q.points)) : 1,
    secretNote: q.secretNote || '',
    timeLimit: q.timeLimit && !isNaN(Number(q.timeLimit)) ? Number(q.timeLimit) : 60,
    showScoreboardAfterQuestion: showScoreboard
  };
}

/**
 * Sanitizes an entire questions array for Firebase RTDB and local storage.
 * Completely strips all undefined values via JSON serialization cycle.
 */
export function sanitizeQuestionsForFirebase(questions, fallbackScoreboard = false) {
  if (!questions || !Array.isArray(questions)) return [];

  const nonEnd = questions.filter((q) => q && q.type !== 'end');
  const existingEnd = questions.find((q) => q && q.type === 'end') || DEFAULT_END_SCREEN;

  const sanitizedList = nonEnd.map((q, idx) => sanitizeQuestionForFirebase(q, idx, fallbackScoreboard));
  sanitizedList.push(sanitizeQuestionForFirebase(existingEnd, sanitizedList.length, fallbackScoreboard));

  // Double safe guarantee: No undefined properties can survive JSON cycle
  return JSON.parse(JSON.stringify(sanitizedList));
}

/**
 * Store the active custom quiz in localStorage so room PIN resets or refreshes never lose it
 */
export function saveActiveCustomQuizToStorage(quiz) {
  if (typeof window === 'undefined' || !quiz) return;
  try {
    const payload = {
      title: quiz.title || 'My Custom Quiz',
      questions: sanitizeQuestionsForFirebase(quiz.questions, quiz.showScoreboardAfterQuestion),
      showScoreboardAfterQuestion: Boolean(quiz.showScoreboardAfterQuestion),
      updatedAt: Date.now()
    };
    localStorage.setItem(ACTIVE_QUIZ_LOCAL_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to save active custom quiz to localStorage:', e);
  }
}

/**
 * Retrieve the active custom quiz from localStorage if present
 */
export function getActiveCustomQuizFromStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_QUIZ_LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return {
        title: parsed.title || 'My Custom Quiz',
        questions: sanitizeQuestionsForFirebase(parsed.questions, parsed.showScoreboardAfterQuestion),
        showScoreboardAfterQuestion: Boolean(parsed.showScoreboardAfterQuestion)
      };
    }
  } catch (e) {
    console.warn('Failed to read active custom quiz from localStorage:', e);
  }
  return null;
}

/**
 * Clear the active custom quiz from localStorage
 */
export function clearActiveCustomQuizFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACTIVE_QUIZ_LOCAL_KEY);
  } catch (e) {}
}

/**
 * Compact, URL-safe compression for sharing full quizzes directly in URL
 */
export function encodeQuizForUrl(quizData) {
  try {
    const minimal = {
      t: quizData.title || 'My Custom Quiz',
      s: Boolean(quizData.showScoreboardAfterQuestion),
      q: sanitizeQuestionsForFirebase(quizData.questions, quizData.showScoreboardAfterQuestion)
    };
    const jsonStr = JSON.stringify(minimal);
    // LZString URI compression ensures ultra-compact output safe for all browsers
    return LZString.compressToEncodedURIComponent(jsonStr);
  } catch (e) {
    console.warn('Failed to encode quiz for URL:', e);
    return '';
  }
}

/**
 * Decode quiz from URL-safe string (supports LZString with legacy base64 fallback)
 */
export function decodeQuizFromUrl(encodedStr) {
  if (!encodedStr || typeof encodedStr !== 'string') return null;
  try {
    // 1. Try LZString decompression
    let jsonStr = LZString.decompressFromEncodedURIComponent(encodedStr);

    // 2. Legacy base64 fallback
    if (!jsonStr) {
      try {
        let base64 = encodedStr.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        jsonStr = new TextDecoder().decode(bytes);
      } catch (err) {}
    }

    if (!jsonStr) return null;
    const parsed = JSON.parse(jsonStr);

    const questions = parsed.q || parsed.questions;
    if (Array.isArray(questions) && questions.length > 0) {
      return {
        title: parsed.t || parsed.title || 'Shared Quiz',
        showScoreboardAfterQuestion: parsed.s !== undefined ? Boolean(parsed.s) : Boolean(parsed.showScoreboardAfterQuestion),
        questions: sanitizeQuestionsForFirebase(questions, parsed.s)
      };
    }
  } catch (e) {
    console.warn('Failed to decode quiz from URL param:', e);
  }
  return null;
}
