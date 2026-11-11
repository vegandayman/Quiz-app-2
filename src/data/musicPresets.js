/**
 * Music Question Presets, YouTube Helper & Answer Evaluation
 */

import { checkFreeInputAnswer } from '../utils/answerMatcher.js';

// Helper to reliably extract YouTube video ID from any standard URL or embed format
export function extractYouTubeId(url = '') {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // If already a bare 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle youtu.be/ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // Handle youtube.com/watch?v=ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // Handle youtube.com/embed/ID
  const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  // Handle youtube.com/shorts/ID
  const shortsMatch = trimmed.match(/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  return '';
}

/**
 * Curated Music Question Presets for Quiz Masters
 */
export const MUSIC_PRESETS = [
  {
    name: '🎸 Rock Classic (Artist & Song)',
    question: 'Listen closely! Name the iconic band and this legendary song title.',
    youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    videoStartTime: 58,
    timeLimit: 60,
    secretNote: 'Released in 1975 on "A Night at the Opera", recorded across 5 studios in London.',
    fields: [
      { id: 'f-1', type: 'artist', label: 'Artist 1', correctAnswer: 'Queen', acceptedAnswers: 'The Queen, Queen band', points: 1 },
      { id: 'f-2', type: 'song', label: 'Song Name 1', correctAnswer: 'Bohemian Rhapsody', acceptedAnswers: 'Bohemian Rapsody, Mama just killed a man', points: 1 }
    ]
  },
  {
    name: '🕺 80s Pop Hit (Artist & Song)',
    question: 'Name the King of Pop and this 1982 smash hit!',
    youtubeUrl: 'https://www.youtube.com/watch?v=Zi_XLOBDo_Y',
    videoStartTime: 12,
    timeLimit: 60,
    secretNote: 'Produced by Quincy Jones, topped Billboard for 7 weeks in 1983.',
    fields: [
      { id: 'f-1', type: 'artist', label: 'Artist 1', correctAnswer: 'Michael Jackson', acceptedAnswers: 'MJ, King of Pop', points: 1 },
      { id: 'f-2', type: 'song', label: 'Song Name 1', correctAnswer: 'Billie Jean', acceptedAnswers: 'Billy Jean, Billie Jane', points: 1 }
    ]
  },
  {
    name: '⚡ 90s Grunge Anthem (Artist & Song)',
    question: 'Name the Seattle grunge icons and their breakout anthem!',
    youtubeUrl: 'https://www.youtube.com/watch?v=hTWKbfoikeg',
    videoStartTime: 25,
    timeLimit: 60,
    secretNote: 'From the 1991 album "Nevermind", produced by Butch Vig.',
    fields: [
      { id: 'f-1', type: 'artist', label: 'Artist 1', correctAnswer: 'Nirvana', acceptedAnswers: 'Kurt Cobain, Nirvanah', points: 1 },
      { id: 'f-2', type: 'song', label: 'Song Name 1', correctAnswer: 'Smells Like Teen Spirit', acceptedAnswers: 'Teen Spirit, Smells Like Teen Spirt', points: 1 }
    ]
  },
  {
    name: '🔀 Two-Song Mashup (2 Artists & 2 Songs)',
    question: 'Double trouble! Name both artists and both song titles featured in this clip.',
    youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    videoStartTime: 0,
    timeLimit: 90,
    secretNote: 'Award points for any track identified!',
    fields: [
      { id: 'f-1', type: 'artist', label: 'Artist 1', correctAnswer: '', acceptedAnswers: '', points: 1 },
      { id: 'f-2', type: 'song', label: 'Song Name 1', correctAnswer: '', acceptedAnswers: '', points: 1 },
      { id: 'f-3', type: 'artist', label: 'Artist 2', correctAnswer: '', acceptedAnswers: '', points: 1 },
      { id: 'f-4', type: 'song', label: 'Song Name 2', correctAnswer: '', acceptedAnswers: '', points: 1 }
    ]
  }
];

/**
 * Evaluates a player's submitted music fields against the question's target fields.
 * Uses intelligent typo, punctuation, and article tolerance.
 *
 * @param {Object} playerInputs - Keyed by field id or array: { 'f-1': 'Queen', 'f-2': 'Bohemian Rhapsody' }
 * @param {Array} targetFields - Configured question fields
 * @returns {{ isAllCorrect: boolean, totalPoints: number, fieldResults: Array, summaryText: string }}
 */
export function evaluateMusicAnswers(playerInputs = {}, targetFields = []) {
  if (!Array.isArray(targetFields) || targetFields.length === 0) {
    return { isAllCorrect: false, totalPoints: 0, fieldResults: [], summaryText: '' };
  }

  let totalPoints = 0;
  let correctCount = 0;
  const summaryParts = [];

  const fieldResults = targetFields.map((field) => {
    // Player input can be stored keyed by field.id or passed as array
    const rawVal = typeof playerInputs === 'object' && playerInputs !== null
      ? (playerInputs[field.id] || playerInputs[field.label] || '')
      : '';
    const playerText = typeof rawVal === 'string' ? rawVal.trim() : '';

    const matchResult = checkFreeInputAnswer(
      playerText,
      field.correctAnswer || '',
      field.acceptedAnswers || ''
    );

    const isFieldCorrect = Boolean(matchResult.isCorrect);
    const fieldMaxPoints = field.points !== undefined && !isNaN(Number(field.points))
      ? Math.max(0, Number(field.points))
      : 1;
    const pointsAwarded = isFieldCorrect ? fieldMaxPoints : 0;

    if (isFieldCorrect) {
      correctCount++;
      totalPoints += pointsAwarded;
    }

    if (playerText) {
      summaryParts.push(`${field.label}: "${playerText}" (${isFieldCorrect ? '✓' : '✗'})`);
    }

    return {
      fieldId: field.id,
      label: field.label,
      type: field.type || 'artist',
      playerText,
      correctAnswer: field.correctAnswer || '',
      acceptedAnswers: field.acceptedAnswers || '',
      isCorrect: isFieldCorrect,
      pointsAwarded,
      maxPoints: fieldMaxPoints,
      reason: matchResult.reason
    };
  });

  const isAllCorrect = correctCount === targetFields.length && targetFields.length > 0;
  const summaryText = summaryParts.join(' • ');

  return {
    isAllCorrect,
    correctCount,
    totalFields: targetFields.length,
    totalPoints,
    fieldResults,
    summaryText
  };
}

/**
 * Web Audio musical harp chime sound when player submits their music answers
 */
export function playMusicChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Arpeggiated pentatonic chord (C5 - E5 - G5 - C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });
  } catch (e) {}
}
