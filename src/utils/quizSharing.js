/**
 * Quiz Sharing & Cloud Persistence Helper
 * 
 * Allows users to create a quiz, save it to Firebase Realtime Database at `/quizzes/{quizId}`,
 * and generate a 1-click shareable link for friends to host the quiz directly.
 */

import { ref, get, set, update } from 'firebase/database';
import { db } from '../firebase.js';

const LOCAL_SAVED_QUIZZES_KEY = 'quizpulse_saved_quizzes';

/**
 * Generate a friendly 6-character alphanumeric code (excluding ambiguous characters 0, O, 1, I)
 */
export function generateQuizCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Construct the direct 1-click host invite link for a friend
 */
export function buildHostShareUrl(quizId) {
  if (typeof window === 'undefined') return `?role=host&quizId=${quizId}`;
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}?role=host&quizId=${encodeURIComponent(quizId)}`;
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
    const existingIdx = current.findIndex((q) => q.id === quiz.id);
    const item = {
      id: quiz.id,
      title: quiz.title || 'Untitled Quiz',
      questionCount: Array.isArray(quiz.questions)
        ? quiz.questions.filter((q) => q.type !== 'splash' && q.type !== 'end').length
        : 0,
      totalSlides: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
      showScoreboardAfterQuestion: Boolean(quiz.showScoreboardAfterQuestion),
      questions: quiz.questions,
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

  // Clean and prepare the questions array
  const cleanedQuestions = JSON.parse(JSON.stringify(questions));
  const quizId = (existingId && existingId.trim().toUpperCase()) || generateQuizCode();

  const payload = {
    id: quizId,
    title: (title || 'My Custom Quiz').trim(),
    questions: cleanedQuestions,
    showScoreboardAfterQuestion: Boolean(showScoreboardAfterQuestion),
    createdAt: Date.now(),
    version: '1.0'
  };

  // 1. Save to Firebase Realtime Database
  const quizRef = ref(db, `quizzes/${quizId}`);
  await set(quizRef, payload);

  // 2. Save locally for easy retrieval in HostConsole
  saveQuizToLocal(payload);

  const shareUrl = buildHostShareUrl(quizId);
  return {
    quizId,
    shareUrl,
    title: payload.title
  };
}

/**
 * Load a quiz from Firebase Realtime Database by its quizId/code
 * 
 * @param {string} quizId
 * @returns {Promise<{ id: string, title: string, questions: Array, showScoreboardAfterQuestion: boolean }>}
 */
export async function loadQuizFromCloud(quizId) {
  if (!quizId || typeof quizId !== 'string') {
    throw new Error('Invalid Quiz Code or link.');
  }

  const cleanId = quizId.trim().toUpperCase();
  const quizRef = ref(db, `quizzes/${cleanId}`);
  const snapshot = await get(quizRef);

  if (!snapshot.exists()) {
    // Try exact match in case of mixed case
    const exactRef = ref(db, `quizzes/${quizId.trim()}`);
    const exactSnapshot = await get(exactRef);
    if (!exactSnapshot.exists()) {
      throw new Error(`Quiz "${cleanId}" was not found. Please check the link or code with the creator.`);
    }
    const data = exactSnapshot.val();
    saveQuizToLocal(data);
    return data;
  }

  const data = snapshot.val();
  // Cache to local library
  saveQuizToLocal(data);
  return data;
}
