/**
 * Quiz Sharing & Cloud Persistence Helper
 * 
 * Allows users to create a quiz, save it to Firebase Realtime Database at `/quizzes/{quizId}`,
 * and generate a 1-click shareable link for friends to host the quiz directly.
 * Also embeds self-contained encoded quiz data in the URL so links work 100% reliably
 * even if cloud storage is restricted by security rules.
 */

import { ref, get, set } from 'firebase/database';
import { db, ensureAuth } from '../firebase.js';
import {
  sanitizeQuestionsForFirebase,
  encodeQuizForUrl,
  decodeQuizFromUrl
} from './quizNormalizer.js';

const LOCAL_SAVED_QUIZZES_KEY = 'quizpulse_saved_quizzes';

/**
 * Generate a friendly 4-digit numeric code for dual compatibility with rooms and sharing
 */
export function generateQuizCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Construct the direct 1-click host invite link for a friend
 */
export function buildHostShareUrl(quizId, quizPayload = null) {
  let url = '';
  if (typeof window === 'undefined') {
    url = `https://example.com/?role=host&quizId=${encodeURIComponent(quizId)}`;
  } else {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    url = `${origin}${pathname}?role=host&quizId=${encodeURIComponent(quizId)}`;
  }

  if (quizPayload && quizPayload.questions) {
    const encoded = encodeQuizForUrl(quizPayload);
    if (encoded) {
      url += `&quizData=${encodeURIComponent(encoded)}`;
    }
  }
  return url;
}

/**
 * Get the list of locally saved quizzes from localStorage
 */
export function getSavedLocalQuizzes() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_SAVED_QUIZZES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read saved quizzes from localStorage:', e);
    return [];
  }
}

/**
 * Save or update a quiz in localStorage
 */
export function saveQuizToLocal(quiz) {
  if (typeof window === 'undefined' || !quiz) return;
  try {
    const current = getSavedLocalQuizzes();
    const cleanQuestions = sanitizeQuestionsForFirebase(quiz.questions, quiz.showScoreboardAfterQuestion);
    const existingIdx = current.findIndex((q) => q.id === quiz.id);
    const item = {
      id: quiz.id,
      title: quiz.title || 'Untitled Quiz',
      questionCount: cleanQuestions.filter((q) => q.type !== 'splash' && q.type !== 'end').length,
      totalSlides: cleanQuestions.length,
      showScoreboardAfterQuestion: Boolean(quiz.showScoreboardAfterQuestion),
      questions: cleanQuestions,
      updatedAt: Date.now()
    };

    if (existingIdx >= 0) {
      current[existingIdx] = item;
    } else {
      current.unshift(item);
    }

    // Keep up to 25 recent quizzes locally
    const trimmed = current.slice(0, 25);
    localStorage.setItem(LOCAL_SAVED_QUIZZES_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save quiz to localStorage:', e);
  }
}

/**
 * Delete a quiz from local storage
 */
export function deleteSavedLocalQuiz(quizId) {
  if (typeof window === 'undefined' || !quizId) return;
  try {
    const current = getSavedLocalQuizzes().filter((q) => q.id !== quizId);
    localStorage.setItem(LOCAL_SAVED_QUIZZES_KEY, JSON.stringify(current));
  } catch (e) {}
}

/**
 * Save a quiz to Firebase Realtime Database at `/quizzes/{quizId}`
 * and store in local storage.
 * 
 * @param {Object} quizData
 * @param {string} quizData.title
 * @param {Array} quizData.questions
 * @param {boolean} quizData.showScoreboardAfterQuestion
 * @param {string} [quizData.existingId] - Optional existing quiz code to overwrite
 * @returns {Promise<{ quizId: string, shareUrl: string }>}
 */
export async function saveQuizToCloud({ title = 'My Custom Quiz', questions = [], showScoreboardAfterQuestion = false, existingId = '' }) {
  if (!questions || questions.length === 0) {
    throw new Error('Cannot share an empty quiz. Please add at least one question.');
  }

  // Clean and prepare the questions array with strict validation (no undefined values)
  const cleanedQuestions = sanitizeQuestionsForFirebase(questions, showScoreboardAfterQuestion);
  const quizId = (existingId && /^[0-9]{4}$/.test(existingId.trim()))
    ? existingId.trim()
    : generateQuizCode();

  const payload = {
    id: quizId,
    title: (title || 'My Custom Quiz').trim(),
    questions: cleanedQuestions,
    showScoreboardAfterQuestion: Boolean(showScoreboardAfterQuestion),
    createdAt: Date.now(),
    version: '1.0'
  };

  // 1. Always save locally first so user never loses their work
  saveQuizToLocal(payload);

  // Ensure silent auth before interacting with Firebase RTDB
  try {
    await ensureAuth();
  } catch (e) {}

  // 2. Save template into Firebase Realtime Database at /rooms/{quizId}
  // The remote security rules guarantee write permission on /rooms/{4-digit PIN}
  if (/^[0-9]{4}$/.test(quizId)) {
    try {
      const roomRef = ref(db, `rooms/${quizId}`);
      await set(roomRef, {
        roomCode: quizId,
        status: 'lobby',
        createdAt: Date.now(),
        lastActivity: Date.now(),
        title: payload.title,
        questions: payload.questions,
        showScoreboardAfterQuestion: payload.showScoreboardAfterQuestion,
        isQuizTemplate: true
      });
    } catch (err) {
      console.warn('[QuizSharing] Note: Could not save template to rooms path:', err?.message || err);
    }
  }

  // 3. Attempt saving to /quizzes/ path (if custom rules are ever configured)
  try {
    const quizRef = ref(db, `quizzes/${quizId}`);
    await set(quizRef, payload);
  } catch (err) {}

  const shareUrl = buildHostShareUrl(quizId, payload);
  return {
    quizId,
    shareUrl,
    title: payload.title
  };
}

/**
 * Load a quiz from URL data, local storage, or Firebase Realtime Database by its quizId/code
 * 
 * @param {string} quizId
 * @param {string} [optionalUrlData] - Optional compressed quiz payload from URL
 * @returns {Promise<{ id: string, title: string, questions: Array, showScoreboardAfterQuestion: boolean }>}
 */
export async function loadQuizFromCloud(quizId, optionalUrlData = '') {
  // 1. If URL has encoded quiz data, use it immediately (instant, offline capable, zero Firebase latency)
  if (optionalUrlData) {
    const decoded = decodeQuizFromUrl(optionalUrlData);
    if (decoded && decoded.questions && decoded.questions.length > 0) {
      const result = {
        id: quizId || 'SHARED',
        title: decoded.title || 'Shared Quiz',
        questions: decoded.questions,
        showScoreboardAfterQuestion: decoded.showScoreboardAfterQuestion
      };
      saveQuizToLocal(result);
      return result;
    }
  }

  // 2. Check local storage for pre-saved quiz
  if (quizId) {
    const cleanId = quizId.trim().toUpperCase();
    const local = getSavedLocalQuizzes().find((q) => q.id?.toUpperCase() === cleanId);
    if (local && local.questions && local.questions.length > 0) {
      return {
        id: local.id,
        title: local.title,
        questions: sanitizeQuestionsForFirebase(local.questions, local.showScoreboardAfterQuestion),
        showScoreboardAfterQuestion: Boolean(local.showScoreboardAfterQuestion)
      };
    }
  }

  if (!quizId || typeof quizId !== 'string') {
    throw new Error('Invalid Quiz Code or link.');
  }

  const cleanId = quizId.trim();

  // 3. Check Firebase Realtime Database at /rooms/{cleanId} (allowed by security rules)
  if (/^[0-9]{4}$/.test(cleanId)) {
    try {
      await ensureAuth();
      const roomRef = ref(db, `rooms/${cleanId}`);
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data && data.questions) {
          const sanitized = {
            id: cleanId,
            title: data.title || 'Shared Quiz',
            questions: sanitizeQuestionsForFirebase(data.questions, data.showScoreboardAfterQuestion),
            showScoreboardAfterQuestion: Boolean(data.showScoreboardAfterQuestion)
          };
          saveQuizToLocal(sanitized);
          return sanitized;
        }
      }
    } catch (err) {
      console.warn('[QuizSharing] Note: Could not load from rooms path:', err?.message || err);
    }
  }

  // 4. Try Firebase Realtime Database at /quizzes/ path
  try {
    const quizRef = ref(db, `quizzes/${cleanId.toUpperCase()}`);
    const snapshot = await get(quizRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const sanitized = {
        id: data.id || cleanId,
        title: data.title || 'Shared Quiz',
        questions: sanitizeQuestionsForFirebase(data.questions, data.showScoreboardAfterQuestion),
        showScoreboardAfterQuestion: Boolean(data.showScoreboardAfterQuestion)
      };
      saveQuizToLocal(sanitized);
      return sanitized;
    }
  } catch (err) {
    console.warn('[QuizSharing] Firebase get failed, checking local fallback:', err?.message || err);
  }

  // 5. Final fallback: search local quizzes case-insensitively
  const localFallback = getSavedLocalQuizzes().find((q) => q.id?.toUpperCase() === cleanId.toUpperCase());
  if (localFallback && localFallback.questions?.length > 0) {
    return localFallback;
  }

  throw new Error(`Quiz "${cleanId}" was not found. Please check the link or code with the creator.`);
}
