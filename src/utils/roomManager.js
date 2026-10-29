/**
 * Room Management & Lifecycle Utility for QuizPulse
 *
 * Implements Option 1:
 * - 4-digit PIN collision detection against Firebase Realtime Database
 * - Safe recycling of rooms older than 24 hours OR with last activity > 24 hours ago
 * - Clean overwriting with set() to clear ghost players and stale answers upon recycling
 * - Zero active deletion on exit (rooms persist until naturally recycled)
 */

import { ref, get, set } from 'firebase/database';

export const STALE_ROOM_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Checks whether an existing room in the database is stale and safe to recycle.
 * Condition: Created older than 24 hours ago OR last activity was more than 24 hours ago.
 *
 * @param {object|null} roomData - Snapshot value from Firebase RTDB
 * @returns {boolean} True if room is safe to overwrite/recycle
 */
export function isRoomStale(roomData) {
  if (!roomData) return true;

  const now = Date.now();
  const created = Number(roomData.createdAt) || 0;
  const lastActive = Number(
    roomData.lastActivity ||
    roomData.updatedAt ||
    roomData.questionStartTime ||
    roomData.createdAt
  ) || 0;

  // If room has no valid timestamps (legacy/incomplete test room), safe to recycle
  if (!created && !lastActive) {
    return true;
  }

  // Room is older than 24 hours
  const isOlderThan24h = created > 0 && (now - created > STALE_ROOM_THRESHOLD_MS);

  // Room has had no activity for more than 24 hours
  const isInactiveOver24h = lastActive > 0 && (now - lastActive > STALE_ROOM_THRESHOLD_MS);

  // If closed or finished AND inactive for > 1 hour, or either 24h threshold met
  if (isOlderThan24h || isInactiveOver24h) {
    return true;
  }

  return false;
}

/**
 * Searches for an available 4-digit room code or recycles a stale (>24h) room code.
 *
 * @param {object} db - Firebase Realtime Database instance
 * @param {number} maxAttempts - Max random candidate attempts before fallback
 * @returns {Promise<{ roomCode: string, isRecycled: boolean }>}
 */
export async function findAvailableOrStaleRoomCode(db, maxAttempts = 25) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidateCode = Math.floor(1000 + Math.random() * 9000).toString();

    try {
      const roomRef = ref(db, `rooms/${candidateCode}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        // Pristine, never-before-used room code
        return { roomCode: candidateCode, isRecycled: false };
      }

      const roomData = snapshot.val();
      if (isRoomStale(roomData)) {
        // Room exists but is older than 24 hours or inactive > 24 hours -> safe to recycle
        return { roomCode: candidateCode, isRecycled: true };
      }

      // Room is actively in use (<24h old and active within 24h) -> collision! Try next PIN.
    } catch (err) {
      console.warn(`[RoomManager] Error checking candidate PIN ${candidateCode}:`, err);
      // If network read fails, return candidate
      return { roomCode: candidateCode, isRecycled: false };
    }
  }

  // Fallback if all attempts hit active rooms (extremely rare with 9,000 combinations)
  const fallbackCode = Math.floor(1000 + Math.random() * 9000).toString();
  return { roomCode: fallbackCode, isRecycled: false };
}

/**
 * Initializes or resets a room in Firebase Realtime Database with a clean state.
 * Uses set() to wipe any previous players or lingering answers from prior games.
 *
 * @param {object} db - Firebase RTDB instance
 * @param {string} roomCode - 4-digit room code
 * @param {Array} questions - Sanitized questions array
 * @param {boolean} showScoreboard - Scoreboard setting
 * @returns {Promise<void>}
 */
export async function initializeRoomInFirebase(db, roomCode, questions, showScoreboard = false) {
  if (!db || !roomCode) return;

  const roomRef = ref(db, `rooms/${roomCode}`);
  const now = Date.now();

  await set(roomRef, {
    roomCode,
    status: 'lobby',
    currentQuestionIndex: 0,
    questions,
    showScoreboardAfterQuestion: Boolean(showScoreboard),
    createdAt: now,
    lastActivity: now
  });
}
