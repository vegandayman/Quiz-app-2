import React, { useState, useEffect, useRef } from 'react';
import { ref, get, set, push, onValue, update } from 'firebase/database';
import { db } from '../firebase.js';
import { checkFreeInputAnswer } from '../utils/answerMatcher.js';
import WorldMap from './WorldMap.jsx';
import { playEmergencyBrakeSound } from '../data/paSparetPresets.js';

// Clean inline SVGs (zero external dependencies)
const TrainIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="16" x="4" y="3" rx="2" />
    <path d="M4 11h16" />
    <path d="M12 3v8" />
    <path d="m8 19-2 3" />
    <path d="m18 22-2-3" />
    <circle cx="8" cy="15" r="1" fill="currentColor" />
    <circle cx="16" cy="15" r="1" fill="currentColor" />
  </svg>
);

const MapPinIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const KeyboardIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="M6 8h.001" />
    <path d="M10 8h.001" />
    <path d="M14 8h.001" />
    <path d="M18 8h.001" />
    <path d="M6 12h.001" />
    <path d="M10 12h.001" />
    <path d="M14 12h.001" />
    <path d="M18 12h.001" />
    <path d="M7 16h10" />
  </svg>
);

const GamepadIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" x2="10" y1="12" y2="12" />
    <line x1="8" x2="8" y1="10" y2="14" />
    <line x1="15" x2="15.01" y1="13" y2="13" />
    <line x1="18" x2="18.01" y1="11" y2="11" />
    <rect width="20" height="12" x="2" y="6" rx="6" />
  </svg>
);

const CheckCircleIcon = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircleIcon = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const LoaderIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

const SparklesIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3Z" />
  </svg>
);

const TrophyIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const answerButtons = [
  { symbol: '▲', label: 'Triangle', bg: 'bg-red-600 hover:bg-red-500 active:bg-red-700', border: 'border-red-500' },
  { symbol: '◆', label: 'Diamond', bg: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700', border: 'border-blue-500' },
  { symbol: '●', label: 'Circle', bg: 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600', border: 'border-amber-400' },
  { symbol: '■', label: 'Square', bg: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700', border: 'border-emerald-500' }
];

const SESSION_STORAGE_KEY = 'quizpulse_player_session';

function getStoredPlayerSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function storePlayerSession(roomCode, playerId, playerName) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ roomCode, playerId, playerName, timestamp: Date.now() })
    );
  } catch (e) {}
}

function clearStoredPlayerSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {}
}

/**
 * PlayerJoin Component
 * 
 * - Handles entering 4-digit PIN and nickname
 * - Auto-reconnects players if disconnected during an active game
 * - Allows reclaiming previous player session & scores using identical nickname
 * - Live synchronized answering on player mobile screen
 * - Real-time countdown timer bar
 * - Dynamic score calculation based on question points and speed bonus
 * - Dynamic feedback for Reveal, Leaderboard, and Final Winner Podium
 */
export default function PlayerJoin({ initialRoomCode = '', onOpenHost }) {
  const getInitialPin = () => {
    if (initialRoomCode) return initialRoomCode;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('pin') || '';
    }
    return '';
  };

  const [roomCode, setRoomCode] = useState(getInitialPin);
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedSession, setSavedSession] = useState(getStoredPlayerSession);
  const [reconnectBanner, setReconnectBanner] = useState(null);

  // Player session state
  const [isJoined, setIsJoined] = useState(false);
  const [joinedRoomCode, setJoinedRoomCode] = useState('');
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [myAnswer, setMyAnswer] = useState(null);
  const [playerTextInput, setPlayerTextInput] = useState('');
  const [isSubmittingText, setIsSubmittingText] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null); // { lat, lng }
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  // Quick Resume / Reconnect handler
  const handleQuickResume = async (savedCode, savedId, savedName) => {
    if (!savedCode || !savedName) return false;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const roomRef = ref(db, `rooms/${savedCode}`);
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) {
        clearStoredPlayerSession();
        setSavedSession(null);
        setIsLoading(false);
        return false;
      }
      const data = snapshot.val();
      if (data.status === 'closed') {
        clearStoredPlayerSession();
        setSavedSession(null);
        setIsLoading(false);
        return false;
      }

      // Check if player exists by savedId or by matching name
      let matchedPlayerId = savedId;
      let matchedPlayer = data.players?.[savedId];

      if (!matchedPlayer && data.players) {
        const found = Object.entries(data.players).find(
          ([, p]) => p.name && p.name.trim().toLowerCase() === savedName.trim().toLowerCase()
        );
        if (found) {
          matchedPlayerId = found[0];
          matchedPlayer = found[1];
        }
      }

      if (matchedPlayer) {
        setCurrentPlayerId(matchedPlayerId);
        setPlayerName(matchedPlayer.name);
        setJoinedRoomCode(savedCode);
        setRoomCode(savedCode);
        setIsJoined(true);
        storePlayerSession(savedCode, matchedPlayerId, matchedPlayer.name);
        setReconnectBanner(`Reconnected as ${matchedPlayer.name}! (${matchedPlayer.score || 0} pts)`);
        setTimeout(() => setReconnectBanner(null), 4000);
        setIsLoading(false);
        return true;
      } else {
        clearStoredPlayerSession();
        setSavedSession(null);
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Error during session recovery:', err);
      setIsLoading(false);
      return false;
    }
  };

  // Auto-reconnect on initial mount if saved session is present on this device
  useEffect(() => {
    const session = getStoredPlayerSession();
    if (!session || !session.roomCode || (!session.playerId && !session.playerName)) return;

    if (initialRoomCode && session.roomCode !== initialRoomCode) {
      return;
    }

    handleQuickResume(session.roomCode, session.playerId, session.playerName);
  }, []);

  // Sync if prop changes externally
  useEffect(() => {
    if (initialRoomCode && !isJoined) {
      setRoomCode(initialRoomCode);
    }
  }, [initialRoomCode, isJoined]);

  // Join Room Form Handler
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedCode = roomCode.trim();
    const trimmedName = playerName.trim();

    if (!trimmedCode || trimmedCode.length !== 4) {
      setErrorMessage('Please enter a valid 4-digit Room PIN.');
      return;
    }

    if (!trimmedName) {
      setErrorMessage('Please enter your nickname.');
      return;
    }

    setIsLoading(true);

    const withTimeout = (promise, ms = 6000) => {
      return Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timed out. Please verify the Room PIN and network connection.')), ms)
        )
      ]);
    };

    try {
      const roomRef = ref(db, `rooms/${trimmedCode}`);
      const snapshot = await withTimeout(get(roomRef));

      if (!snapshot.exists()) {
        setErrorMessage(`Room "${trimmedCode}" not found. Verify PIN with the host.`);
        setIsLoading(false);
        return;
      }

      const data = snapshot.val();

      if (data.status === 'closed') {
        setErrorMessage('This room has been closed. Please ask the host for the new Room PIN.');
        setIsLoading(false);
        return;
      }

      // Check if player with this nickname already exists in the room (RECONNECT / RECLAIM)
      const existingPlayerEntry = data.players
        ? Object.entries(data.players).find(
            ([, p]) => p.name && p.name.trim().toLowerCase() === trimmedName.toLowerCase()
          )
        : null;

      if (existingPlayerEntry) {
        // Reclaim existing seat and preserve points/answers!
        const [existingId, existingPlayer] = existingPlayerEntry;
        setCurrentPlayerId(existingId);
        setPlayerName(existingPlayer.name);
        setJoinedRoomCode(trimmedCode);
        setIsJoined(true);
        storePlayerSession(trimmedCode, existingId, existingPlayer.name);
        setReconnectBanner(`Reconnected as ${existingPlayer.name}! (${existingPlayer.score || 0} pts)`);
        setTimeout(() => setReconnectBanner(null), 4000);
        setIsLoading(false);
        return;
      }

      // If nickname is new and game is already past lobby, instruct player
      if (data.status !== 'lobby') {
        setErrorMessage('This game is already in progress. If you were disconnected, make sure to enter your exact previous nickname to reclaim your score.');
        setIsLoading(false);
        return;
      }

      // Add new player to rooms/{roomCode}/players/{playerId}
      const playersListRef = ref(db, `rooms/${trimmedCode}/players`);
      const newPlayerRef = push(playersListRef);
      const generatedPlayerId = newPlayerRef.key;

      await withTimeout(set(newPlayerRef, {
        id: generatedPlayerId,
        name: trimmedName,
        score: 0,
        joinedAt: Date.now()
      }));

      setCurrentPlayerId(generatedPlayerId);
      setJoinedRoomCode(trimmedCode);
      setIsJoined(true);
      storePlayerSession(trimmedCode, generatedPlayerId, trimmedName);
      setIsLoading(false);
    } catch (err) {
      console.error('Error joining room in Firebase:', err);
      setErrorMessage(err.message || 'Failed to connect to Firebase.');
      setIsLoading(false);
    }
  };

  const lastQuestionIndexRef = useRef(null);

  // Leave / Join New Room Action
  const handleLeaveAndJoinNew = () => {
    clearStoredPlayerSession();
    setSavedSession(null);
    setIsJoined(false);
    setJoinedRoomCode('');
    setCurrentPlayerId('');
    setMyAnswer(null);
    setSelectedPin(null);
    setPlayerTextInput('');
    setRoomData(null);
    setRoomCode('');
    setErrorMessage('');
    lastQuestionIndexRef.current = null;
  };

  // Real-time listener for room updates once joined
  useEffect(() => {
    if (!isJoined || !joinedRoomCode) return;

    const roomRef = ref(db, `rooms/${joinedRoomCode}`);

    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setRoomData(data);

      const qIndex = data.currentQuestionIndex || 0;
      const isNewQuestion = lastQuestionIndexRef.current !== qIndex;
      const myAnswers = data.players?.[currentPlayerId]?.answers;

      if (myAnswers && myAnswers[qIndex] !== undefined) {
        const curAns = myAnswers[qIndex];
        setMyAnswer(
          curAns.choiceIndex !== undefined
            ? curAns.choiceIndex
            : curAns.textAnswer !== undefined
            ? curAns.textAnswer
            : curAns.lat !== undefined
            ? { lat: curAns.lat, lng: curAns.lng }
            : true
        );
        if (curAns.lat !== undefined && curAns.lng !== undefined) {
          setSelectedPin({ lat: Number(curAns.lat), lng: Number(curAns.lng) });
        }
      } else {
        setMyAnswer(null);
        // CRITICAL FIX: Only reset local unsubmitted draft inputs when moving to a brand new question!
        // Never clear the player's placed pin or text draft when another player submits in real-time.
        if (isNewQuestion) {
          setSelectedPin(null);
          setPlayerTextInput('');
          setIsMapExpanded(false);
          setShowPhotoModal(false);
        }
      }

      if (isNewQuestion) {
        lastQuestionIndexRef.current = qIndex;
      }
    });

    return () => unsubscribe();
  }, [isJoined, joinedRoomCode, currentPlayerId]);

  // Countdown timer effect on player phone
  useEffect(() => {
    if (roomData?.status !== 'question') return;

    const duration = roomData?.timeLimit || 60;
    const startTime = roomData?.questionStartTime || Date.now();

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
    }, 500);

    return () => clearInterval(interval);
  }, [roomData?.status, roomData?.questionStartTime, roomData?.timeLimit]);

  // Handle Player Tapping an Answer Button with speed-based Kahoot scoring and custom question points
  const handleSelectAnswer = async (choiceIndex) => {
    if (myAnswer !== null || !roomData || timeLeft <= 0) return;

    const currentQIndex = roomData.currentQuestionIndex || 0;
    const currentQ = roomData.questions?.[currentQIndex];
    const isCorrect = choiceIndex === currentQ?.correctIndex;

    // Use custom question points (defaults to 1 if not specified in editor)
    const maxPoints = currentQ?.points !== undefined && currentQ.points !== '' ? Math.max(0, Number(currentQ.points)) : 1;
    const timeLimit = roomData.timeLimit || currentQ?.timeLimit || 60;
    const startTime = roomData.questionStartTime || Date.now();
    const timeElapsedSec = Math.max(0, (Date.now() - startTime) / 1000);
    const speedRatio = Math.max(0, Math.min(1, 1 - (timeElapsedSec / timeLimit) / 2));
    const pointsAwarded = isCorrect
      ? (maxPoints <= 1 ? maxPoints : Math.max(1, Math.round(maxPoints * speedRatio)))
      : 0;

    setMyAnswer(choiceIndex);

    const currentScore = roomData.players?.[currentPlayerId]?.score || 0;
    const playerRef = ref(db, `rooms/${joinedRoomCode}/players/${currentPlayerId}`);

    await update(playerRef, {
      score: currentScore + pointsAwarded,
      [`answers/${currentQIndex}`]: {
        choiceIndex,
        choiceText: currentQ?.options?.[choiceIndex] || '',
        isCorrect,
        pointsAwarded,
        timeElapsedSec: parseFloat(timeElapsedSec.toFixed(1)),
        answeredAt: Date.now()
      }
    });
  };

  // Handle Player Submitting Free-Text Answer with typo/punctuation buffer
  const handleSubmitFreeText = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const trimmed = playerTextInput.trim();
    if (!trimmed || myAnswer !== null || !roomData || timeLeft <= 0 || isSubmittingText) return;

    setIsSubmittingText(true);
    const currentQIndex = roomData.currentQuestionIndex || 0;
    const currentQ = roomData.questions?.[currentQIndex];

    const matchResult = checkFreeInputAnswer(
      trimmed,
      currentQ?.correctAnswer || '',
      currentQ?.acceptedAnswers || ''
    );
    const isCorrect = Boolean(matchResult.isCorrect);

    const maxPoints = currentQ?.points !== undefined && currentQ.points !== '' ? Math.max(0, Number(currentQ.points)) : 1;
    const timeLimit = roomData.timeLimit || currentQ?.timeLimit || 60;
    const startTime = roomData.questionStartTime || Date.now();
    const timeElapsedSec = Math.max(0, (Date.now() - startTime) / 1000);
    const speedRatio = Math.max(0, Math.min(1, 1 - (timeElapsedSec / timeLimit) / 2));
    const pointsAwarded = isCorrect
      ? (maxPoints <= 1 ? maxPoints : Math.max(1, Math.round(maxPoints * speedRatio)))
      : 0;

    setMyAnswer(trimmed);

    const currentScore = roomData.players?.[currentPlayerId]?.score || 0;
    const playerRef = ref(db, `rooms/${joinedRoomCode}/players/${currentPlayerId}`);

    await update(playerRef, {
      score: currentScore + pointsAwarded,
      [`answers/${currentQIndex}`]: {
        textAnswer: trimmed,
        isCorrect,
        pointsAwarded,
        reason: matchResult.reason,
        timeElapsedSec: parseFloat(timeElapsedSec.toFixed(1)),
        answeredAt: Date.now()
      }
    });

    setIsSubmittingText(false);
  };

  // Handle Player Submitting Closest-Wins Pin Guess
  const handleSubmitPin = async () => {
    if (!selectedPin || myAnswer !== null || !roomData || timeLeft <= 0 || isSubmittingPin) return;

    setIsSubmittingPin(true);
    const currentQIndex = roomData.currentQuestionIndex || 0;
    const startTime = roomData.questionStartTime || Date.now();
    const timeElapsedSec = Math.max(0, (Date.now() - startTime) / 1000);

    setMyAnswer(selectedPin);

    const playerRef = ref(db, `rooms/${joinedRoomCode}/players/${currentPlayerId}`);
    await update(playerRef, {
      [`answers/${currentQIndex}`]: {
        lat: selectedPin.lat,
        lng: selectedPin.lng,
        timeElapsedSec: parseFloat(timeElapsedSec.toFixed(1)),
        answeredAt: Date.now()
      }
    });

    setIsSubmittingPin(false);
  };

  // Handle Player Pulling Emergency Brake for På Spåret
  const handleSubmitPaSparet = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const trimmed = playerTextInput.trim();
    if (!trimmed || myAnswer !== null || !roomData || timeLeft <= 0 || isSubmittingText) return;

    setIsSubmittingText(true);
    const currentQIndex = roomData.currentQuestionIndex || 0;
    const currentQ = roomData.questions?.[currentQIndex];

    const startTime = roomData.questionStartTime || Date.now();
    const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    let lockedTier = 10;
    if (elapsed >= 80) lockedTier = 2;
    else if (elapsed >= 60) lockedTier = 4;
    else if (elapsed >= 40) lockedTier = 6;
    else if (elapsed >= 20) lockedTier = 8;
    else lockedTier = 10;

    const matchResult = checkFreeInputAnswer(
      trimmed,
      currentQ?.destination || currentQ?.correctAnswer || '',
      currentQ?.acceptedAnswers || ''
    );
    const isCorrect = Boolean(matchResult.isCorrect);
    const pointsAwarded = isCorrect ? lockedTier : 0;

    // Play tactile sound effect!
    playEmergencyBrakeSound();

    setMyAnswer(trimmed);

    const currentScore = roomData.players?.[currentPlayerId]?.score || 0;
    const playerRef = ref(db, `rooms/${joinedRoomCode}/players/${currentPlayerId}`);

    await update(playerRef, {
      score: currentScore + pointsAwarded,
      [`answers/${currentQIndex}`]: {
        textAnswer: trimmed,
        isCorrect,
        pointsAwarded,
        lockedTier,
        reason: matchResult.reason,
        timeElapsedSec: elapsed,
        answeredAt: Date.now()
      }
    });

    setIsSubmittingText(false);
  };

  const status = roomData?.status || 'lobby';
  const currentQIndex = roomData?.currentQuestionIndex || 0;
  const currentQuestion = roomData?.questions?.[currentQIndex];
  const myPlayerObj = roomData?.players?.[currentPlayerId];
  const lastAnswerObj = myPlayerObj?.answers?.[currentQIndex];

  // Calculate På Spåret active tier and next drop time
  const elapsedSinceQuestionStart = Math.max(0, Math.floor((Date.now() - (roomData?.questionStartTime || Date.now())) / 1000));
  let currentPaSparetTier = 10;
  let nextPaSparetDropSec = 20 - (elapsedSinceQuestionStart % 20);
  if (elapsedSinceQuestionStart >= 80) {
    currentPaSparetTier = 2;
    nextPaSparetDropSec = 0;
  } else if (elapsedSinceQuestionStart >= 60) {
    currentPaSparetTier = 4;
    nextPaSparetDropSec = 80 - elapsedSinceQuestionStart;
  } else if (elapsedSinceQuestionStart >= 40) {
    currentPaSparetTier = 6;
    nextPaSparetDropSec = 60 - elapsedSinceQuestionStart;
  } else if (elapsedSinceQuestionStart >= 20) {
    currentPaSparetTier = 8;
    nextPaSparetDropSec = 40 - elapsedSinceQuestionStart;
  } else {
    currentPaSparetTier = 10;
    nextPaSparetDropSec = 20 - elapsedSinceQuestionStart;
  }

  const allSlides = roomData?.questions || [];
  const totalQuestions = allSlides.filter((q) => q.type !== 'splash' && q.type !== 'end').length;
  const questionsPassed = allSlides.slice(0, currentQIndex + 1).filter((q) => q.type !== 'splash' && q.type !== 'end').length;

  // Compute rankings
  const rawPlayers = roomData?.players || {};
  const sortedPlayers = Object.entries(rawPlayers)
    .map(([id, p]) => ({
      id,
      name: typeof p === 'object' ? p.name : p,
      score: typeof p === 'object' ? p.score || 0 : 0
    }))
    .sort((a, b) => b.score - a.score);

  const myRank = sortedPlayers.findIndex((p) => p.id === currentPlayerId) + 1;

  // ----------------------------------------------------
  // VIEW: Joined Player Screen
  // ----------------------------------------------------
  if (isJoined) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 font-sans">
        {/* Top Mini Bar with Switch Room Button */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">{playerName}</span>
            <span className="text-[10px] text-slate-400 font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
              PIN: {joinedRoomCode}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-purple-400 font-bold">
              {myPlayerObj?.score || 0} pts
            </div>

            <button
              type="button"
              onClick={handleLeaveAndJoinNew}
              className="text-[11px] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-900 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
            >
              Switch Room
            </button>
          </div>
        </header>

        {reconnectBanner && (
          <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center justify-between gap-2 shadow-lg shadow-emerald-950/50">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{reconnectBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setReconnectBanner(null)}
              className="text-emerald-400 hover:text-white font-bold text-xs cursor-pointer px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* NOTICE: ROOM CLOSED BY HOST */}
        {status === 'closed' && (
          <main className="my-auto text-center flex flex-col items-center">
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 max-w-sm w-full shadow-2xl">
              <h2 className="text-xl font-black text-white mb-2">Room Closed</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-5">
                The host has closed this room or generated a new PIN.
              </p>
              <button
                type="button"
                onClick={handleLeaveAndJoinNew}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-purple-600/30"
              >
                Join New Room
              </button>
            </div>
          </main>
        )}

        {/* 1. LOBBY WAITING SCREEN */}
        {status === 'lobby' && (
          <main className="my-auto text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-2xl font-black text-purple-300 mb-4 shadow-lg shadow-purple-500/20">
              {playerName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-black text-white mb-1">You're in!</h2>
            <p className="text-xs text-slate-400 mb-6">See your name on the live display screen?</p>
            <div className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Waiting for quiz master to start...</span>
            </div>
          </main>
        )}

        {/* 1.5. SPLASH / INTERMISSION SCREEN */}
        {status === 'splash' && (
          <main className="my-auto text-center flex flex-col items-center max-w-sm w-full mx-auto animate-in zoom-in-95 duration-200">
            <div className="w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Round Announcement
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {currentQuestion?.title || 'Now the Music Round!'}
              </h2>

              {currentQuestion?.subtitle && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {currentQuestion.subtitle}
                </p>
              )}

              {currentQuestion?.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-purple-500/30 max-h-48 w-full bg-slate-950 shadow-lg">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Splash preview"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="pt-2 text-xs text-purple-300 font-semibold flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span>Look up at the live display! Questions start soon...</span>
              </div>
            </div>
          </main>
        )}

        {/* 2. QUESTION SCREEN */}
        {status === 'question' && (
          <main className={`my-auto w-full mx-auto flex flex-col items-center transition-all duration-300 ${
            currentQuestion?.type === 'closest_pin' ? 'max-w-4xl 2xl:max-w-6xl px-1 sm:px-4' : 'max-w-md'
          }`}>
            {/* Header: Question Number, Points Value & Live Timer Bar */}
            <div className="w-full flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Question {currentQIndex + 1}
                </p>
                {currentQuestion?.type === 'closest_pin' && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3 text-emerald-400" />
                    <span>Closest Pin</span>
                  </span>
                )}
                {currentQuestion?.type === 'free_input' && (
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold flex items-center gap-1">
                    <KeyboardIcon className="w-3 h-3 text-cyan-400" />
                    <span>Free Text</span>
                  </span>
                )}
                {currentQuestion?.type === 'pa_sparet' && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1">
                    <TrainIcon className="w-3 h-3 text-amber-400" />
                    <span>På Spåret</span>
                  </span>
                )}
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-300 font-bold">
                  {currentQuestion?.type === 'pa_sparet'
                    ? `Tier: ${currentPaSparetTier} pts`
                    : `${currentQuestion?.points !== undefined && currentQuestion.points !== '' ? currentQuestion.points : 1} ${Number(currentQuestion?.points ?? 1) === 1 ? 'pt' : 'pts'}`}
                </span>
              </div>
              <span className={`text-xs font-mono font-bold ${timeLeft <= 5 ? 'text-rose-400 animate-ping' : 'text-slate-400'}`}>
                {timeLeft}s
              </span>
            </div>

            {/* Timer Progress Bar */}
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-4 border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  timeLeft <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, (timeLeft / (roomData?.timeLimit || 60)) * 100))}%` }}
              />
            </div>

            {/* Closest-Wins Map vs Free-Input vs Multiple Choice */}
            {currentQuestion?.type === 'closest_pin' ? (
              myAnswer === null ? (
                timeLeft > 0 ? (
                  <div className="w-full space-y-3">
                    <div className="bg-slate-900/90 border-2 border-emerald-500/40 rounded-3xl p-3.5 sm:p-5 shadow-2xl space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                          <MapPinIcon className="w-4 h-4 text-emerald-400" />
                          <span>Drop Pin on World Map</span>
                        </span>

                        <div className="flex items-center gap-2">
                          {currentQuestion?.imageUrl && (
                            <button
                              type="button"
                              onClick={() => setShowPhotoModal(!showPhotoModal)}
                              className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 hover:border-emerald-500 text-[11px] font-bold text-emerald-300 flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                              title="Toggle Landmark Photo Clue"
                            >
                              <span>📷 Photo Clue</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setIsMapExpanded(!isMapExpanded)}
                            className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 hover:border-emerald-500 text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                            title={isMapExpanded ? "Compact View" : "Maximize Map"}
                          >
                            <span>{isMapExpanded ? '⤡ Compact' : '⤢ Maximize'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Optional Landmark Photo Drawer */}
                      {showPhotoModal && currentQuestion?.imageUrl && (
                        <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-950 shadow-xl max-h-48 sm:max-h-60 transition-all">
                          <img
                            src={currentQuestion.imageUrl}
                            alt="Mystery Landmark Clue"
                            className="w-full h-44 sm:h-56 object-cover object-center"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPhotoModal(false)}
                            className="absolute top-2 right-2 bg-slate-950/80 hover:bg-slate-950 text-white p-1 rounded-full text-xs font-bold w-6 h-6 flex items-center justify-center border border-slate-700 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Interactive World Map with dynamic responsive height */}
                      <div
                        className={`w-full transition-all duration-300 rounded-2xl overflow-hidden border border-slate-800 shadow-inner relative touch-none overscroll-none ${
                          isMapExpanded
                            ? 'h-[72vh] min-h-[460px]'
                            : 'h-[48vh] sm:h-[56vh] min-h-[320px] max-h-[640px]'
                        }`}
                        style={{ touchAction: 'none', overscrollBehavior: 'none' }}
                      >
                        <WorldMap
                          interactive={true}
                          selectedPin={selectedPin}
                          onPinSelect={(lat, lng) => setSelectedPin({ lat, lng })}
                          className="w-full h-full"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                        <span>Pinch / + to zoom • Drag to pan</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {selectedPin ? `📍 ${selectedPin.lat.toFixed(2)}°, ${selectedPin.lng.toFixed(2)}°` : 'Tap anywhere to drop pin'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmitPin}
                      disabled={!selectedPin || isSubmittingPin}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base sm:text-lg shadow-xl shadow-emerald-600/30 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmittingPin ? (
                        <>
                          <LoaderIcon className="w-5 h-5 text-white" />
                          <span>Locking In Pin...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-5 h-5 text-white" />
                          <span>{selectedPin ? 'Lock In My Pin Location' : 'Tap Map to Place Pin First'}</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="py-12 px-6 rounded-3xl bg-slate-900 border border-slate-800 text-center w-full shadow-2xl">
                    <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
                      <XCircleIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-white">Time's Up!</h3>
                    <p className="text-xs text-slate-400 mt-2">
                      Look up at the live display screen for the closest pin reveal!
                    </p>
                  </div>
                )
              ) : (
                /* Submitted Pin Confirmed State */
                <div className="py-8 px-6 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 text-center w-full shadow-2xl space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2">
                    <CheckCircleIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-white">Pin Locked In!</h3>
                  <p className="text-xs text-slate-300">
                    Your pin was locked in at <span className="font-mono text-emerald-300 font-bold">{selectedPin ? `${selectedPin.lat.toFixed(2)}°, ${selectedPin.lng.toFixed(2)}°` : 'coords'}</span>
                  </p>

                  {/* Mini locked map preview */}
                  {selectedPin && (
                    <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-slate-800 opacity-90">
                      <WorldMap
                        interactive={false}
                        selectedPin={selectedPin}
                        className="w-full h-full"
                      />
                    </div>
                  )}

                  <p className="text-xs text-slate-400">
                    Waiting for other players to finish... look up at the big screen!
                  </p>
                </div>
              )
            ) : currentQuestion?.type === 'free_input' ? (
              myAnswer === null ? (
                timeLeft > 0 ? (
                  <form onSubmit={handleSubmitFreeText} className="w-full space-y-4">
                    <div className="bg-slate-900/90 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                          <KeyboardIcon className="w-4 h-4 text-cyan-400" />
                          <span>Type Your Answer:</span>
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">Auto-buffered</span>
                      </div>

                      <input
                        type="text"
                        autoFocus
                        value={playerTextInput}
                        onChange={(e) => setPlayerTextInput(e.target.value)}
                        placeholder="e.g. Spider-Man..."
                        className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 rounded-2xl px-4 py-3.5 text-base sm:text-lg font-bold text-white placeholder-slate-600 outline-none transition-all"
                      />

                      <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-200/90 leading-relaxed">
                        ✨ <strong>Spelling & Punctuation Buffer:</strong> Minor typos, capitalization, hyphens, and missing punctuation are automatically forgiven!
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!playerTextInput.trim() || isSubmittingText}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base sm:text-lg shadow-xl shadow-cyan-600/30 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmittingText ? (
                        <>
                          <LoaderIcon className="w-5 h-5 text-white" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-5 h-5 text-white" />
                          <span>Submit Answer</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="py-12 px-6 rounded-3xl bg-slate-900 border border-slate-800 text-center w-full shadow-2xl">
                    <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
                      <XCircleIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-white">Time's Up!</h3>
                    <p className="text-xs text-slate-400 mt-2">
                      Look up at the live display screen for the results...
                    </p>
                  </div>
                )
              ) : (
                <div className="py-10 px-6 rounded-3xl bg-slate-900 border-2 border-cyan-500/40 text-center w-full shadow-2xl">
                  <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
                    <CheckCircleIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-white">Answer Submitted!</h3>
                  <div className="mt-3 inline-block px-4 py-2 rounded-xl bg-slate-950 border border-cyan-500/30">
                    <span className="text-[11px] text-slate-400 block font-medium">You typed:</span>
                    <strong className="text-cyan-300 font-mono text-base">"{myAnswer}"</strong>
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    Typo & punctuation buffer active. Look up at the big screen when time expires!
                  </p>
                </div>
              )
            ) : currentQuestion?.type === 'pa_sparet' ? (
              myAnswer === null ? (
                timeLeft > 0 ? (
                  <form onSubmit={handleSubmitPaSparet} className="w-full space-y-4">
                    {/* Emergency Brake Tier Alert Banner */}
                    <div className="bg-gradient-to-r from-red-950/80 via-amber-950/60 to-red-950/80 border-2 border-red-500/60 rounded-3xl p-4 shadow-xl text-center space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-red-600/30 border border-red-500/50 text-red-200 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                          EMERGENCY BRAKE
                        </span>
                        <span className="text-xs font-mono text-amber-300 font-bold">
                          {nextPaSparetDropSec > 0 ? `Drops in ${nextPaSparetDropSec}s` : 'Final Tier!'}
                        </span>
                      </div>

                      <div className="py-2">
                        <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">Current Active Reward</p>
                        <h4 className="text-4xl font-black text-amber-300 tracking-tight drop-shadow">
                          {currentPaSparetTier} <span className="text-xl font-bold text-amber-400/90">POINTS</span>
                        </h4>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Pulling the brake locks in your score. The earlier you brake, the higher your points!
                      </p>
                    </div>

                    {/* Unlocked Clues Feed */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-2 text-left shadow-lg">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                        Unlocked Clues Feed:
                      </span>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(currentQuestion.clues || [])
                          .filter(clue => elapsedSinceQuestionStart >= clue.timeSec)
                          .map((clue, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-start gap-2.5">
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold shrink-0">
                                {clue.tier}p
                              </span>
                              <p className="text-xs text-slate-200 leading-snug">{clue.text}</p>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Destination Guess Free-Text Input */}
                    <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-4 shadow-xl space-y-2 text-left">
                      <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <TrainIcon className="w-4 h-4 text-amber-400" />
                        <span>Enter Destination City:</span>
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={playerTextInput}
                        onChange={(e) => setPlayerTextInput(e.target.value)}
                        placeholder="e.g. Gothenburg / Göteborg..."
                        className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-2xl px-4 py-3.5 text-base sm:text-lg font-bold text-white placeholder-slate-600 outline-none transition-all"
                      />
                    </div>

                    {/* Large Red Emergency Brake Button */}
                    <button
                      type="submit"
                      disabled={!playerTextInput.trim() || isSubmittingText}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base sm:text-lg shadow-xl shadow-red-700/40 active:scale-98 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border-2 border-red-400/50"
                    >
                      {isSubmittingText ? (
                        <div className="flex items-center gap-2">
                          <LoaderIcon className="w-5 h-5 text-white" />
                          <span>Pulling Emergency Brake...</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🛑</span>
                            <span>PULL EMERGENCY BRAKE</span>
                          </div>
                          <span className="text-[11px] font-mono font-normal opacity-90">
                            Lock in now for {currentPaSparetTier} Points
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="py-12 px-6 rounded-3xl bg-slate-900 border border-slate-800 text-center w-full shadow-2xl">
                    <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
                      <XCircleIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-white">Journey Ended!</h3>
                    <p className="text-xs text-slate-400 mt-2">
                      The train has arrived at its destination. Look up at the screen!
                    </p>
                  </div>
                )
              ) : (
                /* Emergency Brake Engaged Screen */
                <div className="py-8 px-6 rounded-3xl bg-slate-900 border-2 border-amber-500/50 text-center w-full shadow-2xl space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center text-red-400 mb-2 shadow-lg shadow-red-600/30">
                    <span className="text-3xl animate-pulse">🛑</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">Emergency Brake Pulled!</h3>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1.5">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold block">Your Locked Guess:</span>
                    <strong className="text-amber-300 font-sans text-xl block">
                      "{typeof myAnswer === 'object' ? myAnswer.text : (lastAnswerObj?.textAnswer || myAnswer)}"
                    </strong>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
                      Locked at {lastAnswerObj?.lockedTier || (typeof myAnswer === 'object' ? myAnswer.lockedTier : currentPaSparetTier)} Points Tier
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Train cab view is still streaming on the big screen. Destination will reveal at the end of the journey!
                  </p>
                </div>
              )
            ) : (
              /* Multiple-Choice Question Mode */
              myAnswer === null ? (
                timeLeft > 0 ? (
                  <div className="grid grid-cols-2 gap-3 w-full h-80 sm:h-96">
                    {answerButtons.map((btn, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectAnswer(idx)}
                        className={`${btn.bg} ${btn.border} border-2 rounded-2xl flex flex-col items-center justify-center gap-2 text-white shadow-xl cursor-pointer transition-transform active:scale-95`}
                      >
                        <span className="text-5xl font-black">{btn.symbol}</span>
                        <span className="text-xs font-bold uppercase opacity-80">{btn.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 px-6 rounded-3xl bg-slate-900 border border-slate-800 text-center w-full shadow-2xl">
                    <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
                      <XCircleIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-white">Time's Up!</h3>
                    <p className="text-xs text-slate-400 mt-2">
                      Look up at the live display screen for the results...
                    </p>
                  </div>
                )
              ) : (
                <div className="py-12 px-6 rounded-3xl bg-slate-900 border border-slate-800 text-center w-full shadow-2xl">
                  <div className="w-16 h-16 mx-auto rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-4">
                    <CheckCircleIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-white">Answer Locked In!</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    You selected <strong className="text-purple-300">{answerButtons[myAnswer]?.symbol} {answerButtons[myAnswer]?.label}</strong>
                  </p>
                  <p className="text-xs text-slate-500 mt-3">
                    Look up at the big screen for results...
                  </p>
                </div>
              )
            )}
          </main>
        )}

        {/* 3. REVEAL / SCORE SCREEN */}
        {status === 'reveal' && (() => {
          const isClosestPin = currentQuestion?.type === 'closest_pin';
          const isFree = currentQuestion?.type === 'free_input';
          const isPaSparet = currentQuestion?.type === 'pa_sparet';

          if (isClosestPin) {
            const isWinner = Boolean(lastAnswerObj?.isWinner);
            const hasPin = lastAnswerObj?.lat !== undefined;
            const distanceFormatted = lastAnswerObj?.distanceFormatted;
            const revealStage = roomData?.revealStage || 1;

            return (
              <main className="my-auto text-center flex flex-col items-center w-full max-w-sm mx-auto space-y-4">
                {revealStage < 3 ? (
                  <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl w-full space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                      <MapPinIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-white">Revealing Guesses!</h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Look up at the main display screen! The host is revealing player guesses on the world map.
                    </p>
                  </div>
                ) : isWinner ? (
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-950/70 to-slate-900 border-2 border-amber-500 shadow-2xl w-full animate-in zoom-in-95 duration-300 space-y-3">
                    <TrophyIcon className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
                    <h2 className="text-2xl sm:text-3xl font-black text-white">Closest Pin Winner! 👑</h2>
                    <p className="text-lg font-black text-amber-400">
                      +{lastAnswerObj?.pointsAwarded ?? (currentQuestion?.points !== undefined ? currentQuestion.points : 1)} Point
                    </p>
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-xs text-amber-200">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Your distance to {currentQuestion?.landmarkName || 'landmark'}:</span>
                      <span className="font-mono font-black text-lg text-amber-300">{distanceFormatted}</span>
                    </div>
                    <p className="text-xs text-slate-400 pt-1">
                      Total Score: <span className="text-amber-300 font-mono font-bold">{myPlayerObj?.score || 0} pts</span>
                    </p>
                  </div>
                ) : hasPin ? (
                  <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl w-full space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <MapPinIcon className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-black text-white">Great Effort!</h2>
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Your distance:</span>
                      <span className="font-mono font-bold text-emerald-300 text-base">{distanceFormatted}</span>
                      <span className="block text-[10px] text-slate-500 mt-1">from {currentQuestion?.landmarkName || 'the target'}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Check the big screen to see who had the closest guess!
                    </p>
                    <p className="text-xs text-slate-400 pt-1">
                      Total Score: <span className="text-purple-300 font-mono font-bold">{myPlayerObj?.score || 0} pts</span>
                    </p>
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl w-full">
                    <div className="w-14 h-14 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                      <XCircleIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-black text-white">No Pin Placed</h2>
                    <p className="text-xs text-slate-400 mt-1">You didn't drop a pin before time ran out.</p>
                  </div>
                )}
              </main>
            );
          }

          if (isPaSparet) {
            const isCorrect = Boolean(lastAnswerObj?.isCorrect);
            const hasAnswered = lastAnswerObj !== undefined && lastAnswerObj.textAnswer !== undefined;
            const pointsWon = lastAnswerObj?.pointsAwarded || 0;
            const lockedTier = lastAnswerObj?.lockedTier || 2;

            return (
              <main className="my-auto text-center flex flex-col items-center w-full max-w-sm mx-auto space-y-4">
                {isCorrect ? (
                  <div className="p-8 rounded-3xl bg-emerald-950/60 border-2 border-emerald-500 shadow-2xl w-full animate-in zoom-in-95 duration-200 space-y-3">
                    <TrainIcon className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                    <h2 className="text-2xl font-black text-white">Destination Reached! 🚂</h2>
                    <p className="text-2xl font-black text-emerald-400">
                      +{pointsWon} Points
                    </p>
                    <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/30 text-xs space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Destination City:</span>
                      <strong className="text-emerald-300 font-sans text-lg">{currentQuestion.destination || currentQuestion.correctAnswer}</strong>
                      <span className="text-[11px] font-mono text-emerald-400/90 block">
                        Locked in at {lockedTier} pts tier
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 pt-1">
                      Total Score: <span className="text-purple-300 font-mono font-bold">{myPlayerObj?.score || 0} pts</span>
                    </p>
                  </div>
                ) : hasAnswered ? (
                  <div className="p-8 rounded-3xl bg-rose-950/60 border border-rose-500/60 shadow-2xl w-full animate-in zoom-in-95 duration-200 space-y-3">
                    <XCircleIcon className="w-16 h-16 text-rose-400 mx-auto" />
                    <h2 className="text-2xl font-black text-white">Wrong Destination!</h2>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-rose-500/30">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">You guessed:</span>
                        <span className="font-mono text-rose-300 font-bold">"{lastAnswerObj?.textAnswer}"</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Correct destination was:</span>
                        <span className="font-sans text-emerald-300 font-bold text-sm">{currentQuestion.destination || currentQuestion.correctAnswer}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 pt-1">
                      Total Score: <span className="text-purple-300 font-mono font-bold">{myPlayerObj?.score || 0} pts</span>
                    </p>
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl w-full space-y-3">
                    <TrainIcon className="w-14 h-14 text-amber-400 mx-auto opacity-70" />
                    <h2 className="text-xl font-black text-white">No Brake Pulled</h2>
                    <p className="text-xs text-slate-400">
                      The destination was <strong className="text-amber-300">{currentQuestion.destination || currentQuestion.correctAnswer}</strong>
                    </p>
                    <p className="text-xs text-slate-400 pt-1">
                      Total Score: <span className="text-purple-300 font-mono font-bold">{myPlayerObj?.score || 0} pts</span>
                    </p>
                  </div>
                )}
              </main>
            );
          }

          const isCorrect = lastAnswerObj !== undefined
            ? Boolean(lastAnswerObj.isCorrect)
            : (isFree ? false : myAnswer === currentQuestion?.correctIndex);
          const hasAnswered = myAnswer !== null;

          return (
            <main className="my-auto text-center flex flex-col items-center w-full max-w-sm mx-auto">
              {isCorrect ? (
                <div className="p-8 rounded-3xl bg-emerald-950/60 border border-emerald-500/60 shadow-2xl w-full animate-in zoom-in-95 duration-200 space-y-3">
                  <CheckCircleIcon className="w-16 h-16 text-emerald-400 mx-auto" />
                  <h2 className="text-2xl font-black text-white">Correct!</h2>
                  <p className="text-lg font-black text-emerald-400">
                    +{lastAnswerObj?.pointsAwarded ?? (currentQuestion?.points !== undefined ? currentQuestion.points : 1)} {Number(lastAnswerObj?.pointsAwarded ?? (currentQuestion?.points !== undefined ? currentQuestion.points : 1)) === 1 ? 'Point' : 'Points'}
                  </p>
                  {isFree && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Your matched answer:</span>
                      <span className="font-mono font-bold text-emerald-300">"{lastAnswerObj?.textAnswer || myAnswer}"</span>
                      {lastAnswerObj?.reason && lastAnswerObj.reason !== 'exact' && (
                        <span className="text-[10px] text-emerald-400 block mt-1">({lastAnswerObj.reason})</span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 pt-1">
                    Total Score: <span className="text-purple-300 font-mono font-bold">{myPlayerObj?.score || 0} pts</span>
                  </p>
                </div>
              ) : hasAnswered ? (
                <div className="p-8 rounded-3xl bg-rose-950/60 border border-rose-500/60 shadow-2xl w-full animate-in zoom-in-95 duration-200 space-y-3">
                  <XCircleIcon className="w-16 h-16 text-rose-400 mx-auto" />
                  <h2 className="text-2xl font-black text-white">Incorrect!</h2>
                  {isFree ? (
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-rose-500/30">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">You typed:</span>
                        <span className="font-mono text-rose-300 font-bold">"{lastAnswerObj?.textAnswer || myAnswer}"</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Correct answer was:</span>
                        <span className="font-mono text-emerald-300 font-bold">"{currentQuestion?.correctAnswer}"</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-rose-300">Keep going, next question is coming!</p>
                  )}
                  <p className="text-xs text-slate-400 pt-1">
                    Total Score: <span className="text-purple-300 font-mono font-bold">{myPlayerObj?.score || 0} pts</span>
                  </p>
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl w-full">
                  <div className="w-14 h-14 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                    <XCircleIcon className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-black text-white">No Answer</h2>
                  <p className="text-xs text-slate-400 mt-1">You didn't submit an answer in time.</p>
                </div>
              )}
            </main>
          );
        })()}

        {/* 4. LEADERBOARD SCREEN */}
        {status === 'leaderboard' && (
          <main className="my-auto text-center flex flex-col items-center">
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 max-w-sm w-full shadow-2xl">
              <TrophyIcon className="w-12 h-12 text-amber-400 mx-auto mb-3" />

              {/* Question Progress: Passed vs Total Questions */}
              <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/90 border border-purple-700/60 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-purple-200">
                  Question {questionsPassed} of {totalQuestions} Completed
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800 mb-4">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalQuestions > 0 ? (questionsPassed / totalQuestions) * 100 : 0}%` }}
                />
              </div>

              <h2 className="text-xl font-black text-white mb-1">
                You are in {myRank === 1 ? '🥇 1st' : myRank === 2 ? '🥈 2nd' : myRank === 3 ? '🥉 3rd' : `#${myRank}`} Place!
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                {myRank === 1 ? 'Outstanding! Holding the top spot!' : 'Look up at the live screen to view the full scoreboard!'}
              </p>
              <div className="px-6 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-500 uppercase font-bold">Your Total Score</span>
                <p className="text-3xl font-black text-purple-400 mt-1">{myPlayerObj?.score || 0} pts</p>
              </div>
            </div>
          </main>
        )}

        {/* 5. FINISHED / FINAL WINNER PODIUM */}
        {status === 'finished' && (
          <main className="my-auto text-center flex flex-col items-center w-full max-w-sm mx-auto space-y-4">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-950 border-2 border-purple-500/40 w-full shadow-2xl space-y-4">
              <span className="text-5xl block animate-bounce">
                {myRank === 1 ? '👑' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎉'}
              </span>
              <div>
                <h2 className="text-2xl font-black text-white">
                  {myRank === 1 ? 'CHAMPION!' : myRank <= 3 ? `${myRank === 2 ? '2nd' : '3rd'} Place Podium!` : `Finished #${myRank} of ${sortedPlayers.length}!`}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  {myRank === 1
                    ? 'Congratulations! You won the quiz!'
                    : myRank <= 3
                    ? 'Outstanding! You made it onto the winners podium!'
                    : 'Great game! Thanks for competing!'}
                </p>
              </div>

              <div className="px-6 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Your Final Score</span>
                <p className="text-3xl font-black text-amber-400 mt-0.5">{myPlayerObj?.score || 0} pts</p>
              </div>
            </div>

            {/* Complete Final Leaderboard */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 w-full shadow-xl space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-left flex items-center gap-1.5">
                <TrophyIcon className="w-3.5 h-3.5 text-amber-400" />
                Final Standings ({sortedPlayers.length} Players)
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {sortedPlayers.map((p, idx) => {
                  const isMe = p.id === currentPlayerId;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                        isMe
                          ? 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold'
                          : idx === 0
                          ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                          : 'bg-slate-950 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-slate-500 w-5 text-right font-bold">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </span>
                        <span className="truncate">{p.name} {isMe && '(You)'}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-300 ml-2 shrink-0">{p.score} pts</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        )}

        <footer className="text-center text-slate-600 text-[11px] py-1">
          QuizPulse Player Controller
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: Join Form (Enter PIN & Nickname)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between items-center p-6 font-sans">
      <header className="flex items-center gap-2 pt-2">
        <SparklesIcon className="w-5 h-5 text-purple-400" />
        <h1 className="text-lg font-black text-white">QuizPulse</h1>
      </header>

      <main className="w-full max-w-md my-auto">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-purple-400 mb-2">
              <GamepadIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-white">Join Quiz</h2>
            <p className="text-xs text-slate-400">Enter the 4-digit PIN on the live display</p>
          </div>

          {savedSession && (
            <div className="mb-5 p-4 rounded-2xl bg-purple-950/50 border border-purple-500/50 text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Previous Session Found
                </span>
                <button
                  type="button"
                  onClick={() => {
                    clearStoredPlayerSession();
                    setSavedSession(null);
                  }}
                  className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Forget
                </button>
              </div>
              <p className="text-xs text-slate-200">
                Resume playing as <strong className="text-emerald-400 font-bold">{savedSession.playerName}</strong> in Room <span className="font-mono text-purple-300 font-bold">#{savedSession.roomCode}</span>?
              </p>
              <button
                type="button"
                onClick={() => handleQuickResume(savedSession.roomCode, savedSession.playerId, savedSession.playerName)}
                disabled={isLoading}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                {isLoading ? <LoaderIcon className="w-3.5 h-3.5" /> : <span>Resume Game &rarr;</span>}
              </button>
            </div>
          )}

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Game PIN</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 4921"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-2xl font-mono font-bold tracking-widest text-white outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Nickname</label>
              <input
                type="text"
                maxLength={18}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="e.g. Alex"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold outline-none focus:border-purple-500"
                required
              />
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !roomCode || !playerName}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? <LoaderIcon className="w-4 h-4" /> : <span>Enter Game</span>}
            </button>
          </form>
        </div>
      </main>

      <footer className="text-slate-600 text-xs flex flex-col items-center gap-2">
        <span>QuizPulse Realtime Multiplayer</span>
        <button
          type="button"
          onClick={() => {
            if (onOpenHost) {
              onOpenHost();
            } else if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              url.searchParams.set('role', 'host');
              window.location.href = url.toString();
            }
          }}
          className="text-[11px] text-slate-500 hover:text-purple-400 transition-colors cursor-pointer flex items-center gap-1 py-1 px-2.5 rounded-md hover:bg-slate-900/60"
        >
          <span>Host a Quiz</span>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </footer>
    </div>
  );
}
