import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { db } from '../firebase.js';
import WorldMap from './WorldMap.jsx';
import {
  findClosestPlayers,
  calculateFocusBounds,
  calculateGuessesBounds,
  calculateTargetAndGuessesBounds
} from '../utils/geoDistance.js';
import { extractYouTubeId, playTrainWhistleSound, playClueChimeSound } from '../data/paSparetPresets.js';

// Clean inline SVGs (zero external dependencies)
const TrainIcon = ({ className = 'w-5 h-5' }) => (
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

const MapPinIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const UsersIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

const TvIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
    <polyline points="17 2 12 7 7 2" />
  </svg>
);

const ArrowRightIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const LoaderIcon = ({ className = 'w-4 h-4' }) => (
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

const CrownIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15 8 21 9 17 14 18 20 12 17 6 20 7 14 3 9 9 8 12 2" />
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

const shapes = [
  { symbol: '▲', name: 'Triangle', bg: 'bg-red-600', border: 'border-red-500', glow: 'shadow-red-600/30' },
  { symbol: '◆', name: 'Diamond', bg: 'bg-blue-600', border: 'border-blue-500', glow: 'shadow-blue-600/30' },
  { symbol: '●', name: 'Circle', bg: 'bg-amber-500', border: 'border-amber-400', glow: 'shadow-amber-500/30' },
  { symbol: '■', name: 'Square', bg: 'bg-emerald-600', border: 'border-emerald-500', glow: 'shadow-emerald-600/30' }
];

/**
 * LiveDisplay Component (Shared Big Screen / TV / Projector)
 * 
 * - Full capability to join or switch to a new room at any time
 * - Shows Lobby (Big PIN), Questions, Timer, Revealed Answers with Vote Distribution, and Leaderboard
 * - Celebratory Olympic Podium for the Finished game stage
 */
export default function LiveDisplay({ roomCode: initialRoomCode = '', onSwitchToHost }) {
  const getInitialPin = () => {
    if (initialRoomCode) return initialRoomCode;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('pin') || '';
    }
    return '';
  };

  const [activeCode, setActiveCode] = useState(getInitialPin);
  const [inputCode, setInputCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [roomData, setRoomData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const whistlePlayedForQRef = useRef(null);
  const lastChimeTierRef = useRef(null);

  // Sync if roomCode prop changes
  useEffect(() => {
    if (initialRoomCode) {
      setActiveCode(initialRoomCode);
    }
  }, [initialRoomCode]);

  // Connect handler using validated 4-digit PIN
  const handleConnectRoom = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmed = inputCode.trim();
    if (!trimmed || trimmed.length !== 4) {
      setErrorMessage('Please enter a valid 4-digit Room PIN.');
      return;
    }

    setIsVerifying(true);

    try {
      const roomRef = ref(db, `rooms/${trimmed}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        setErrorMessage(`Room "${trimmed}" not found. Verify the PIN on the Host Console.`);
        setIsVerifying(false);
        return;
      }

      setActiveCode(trimmed);
      setIsVerifying(false);
    } catch (err) {
      console.error('Error verifying room:', err);
      setErrorMessage(err.message || 'Failed to connect to Firebase.');
      setIsVerifying(false);
    }
  };

  // Switch room / join new room handler
  const handleSwitchRoom = () => {
    setActiveCode('');
    setInputCode('');
    setRoomData(null);
    setErrorMessage('');
  };

  // Real-time listener for the room state
  useEffect(() => {
    if (!activeCode) return;

    const roomRef = ref(db, `rooms/${activeCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      setRoomData(data);
    });

    return () => unsubscribe();
  }, [activeCode]);

  // Countdown timer effect
  useEffect(() => {
    if (roomData?.status !== 'question') {
      whistlePlayedForQRef.current = null;
      lastChimeTierRef.current = null;
      return;
    }

    const duration = roomData?.timeLimit || 60;
    const startTime = roomData?.questionStartTime || Date.now();

    const interval = setInterval(() => {
      const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      setElapsedSeconds(elapsed);
    }, 400);

    return () => clearInterval(interval);
  }, [roomData?.status, roomData?.questionStartTime, roomData?.timeLimit]);

  // Sound effects for På Spåret
  useEffect(() => {
    if (roomData?.status !== 'question') return;
    const currentQ = roomData?.questions?.[roomData?.currentQuestionIndex || 0];
    if (currentQ?.type !== 'pa_sparet') return;

    // Train whistle sound at round start
    if (whistlePlayedForQRef.current !== roomData?.currentQuestionIndex) {
      whistlePlayedForQRef.current = roomData?.currentQuestionIndex;
      lastChimeTierRef.current = 10;
      playTrainWhistleSound();
    }

    // Clue chime sounds at milestone tiers
    if (elapsedSeconds >= 80 && lastChimeTierRef.current > 2) {
      lastChimeTierRef.current = 2;
      playClueChimeSound();
    } else if (elapsedSeconds >= 60 && lastChimeTierRef.current > 4) {
      lastChimeTierRef.current = 4;
      playClueChimeSound();
    } else if (elapsedSeconds >= 40 && lastChimeTierRef.current > 6) {
      lastChimeTierRef.current = 6;
      playClueChimeSound();
    } else if (elapsedSeconds >= 20 && lastChimeTierRef.current > 8) {
      lastChimeTierRef.current = 8;
      playClueChimeSound();
    }
  }, [roomData?.status, roomData?.currentQuestionIndex, roomData?.questions, elapsedSeconds]);

  // ----------------------------------------------------
  // PIN ENTRY SCREEN (Join New Room)
  // ----------------------------------------------------
  if (!activeCode) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between items-center p-6 sm:p-10 font-sans">
        <header className="flex items-center gap-2 pt-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-500/30">
            <SparklesIcon className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-black tracking-tight text-white">QuizPulse LIVE</h1>
        </header>

        <main className="w-full max-w-md my-auto">
          <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-purple-400 mb-3 shadow">
                <TvIcon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Live Room Display
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter the 4-digit PIN generated on the Host Console
              </p>
            </div>

            <form onSubmit={handleConnectRoom} className="space-y-4">
              <div>
                <label htmlFor="roomPinInput" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-left">
                  Game PIN
                </label>
                <input
                  id="roomPinInput"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 4921"
                  disabled={isVerifying}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white font-mono text-center text-2xl font-bold tracking-widest placeholder:text-slate-600 transition-all outline-none"
                  autoComplete="off"
                  required
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs text-left leading-relaxed animate-in fade-in duration-200">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || inputCode.length !== 4}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg mt-2 ${
                  isVerifying || inputCode.length !== 4
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 hover:scale-[1.01] active:scale-95'
                }`}
              >
                {isVerifying ? (
                  <>
                    <LoaderIcon className="w-4 h-4 text-white" />
                    <span>Connecting Display...</span>
                  </>
                ) : (
                  <>
                    <span>Connect Big Screen</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </main>

        <footer className="w-full max-w-md text-center py-2 text-xs text-slate-600">
          QuizPulse TV & Projector Screen
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // ROOM CLOSED STATE (When host generates new PIN)
  // ----------------------------------------------------
  if (roomData?.status === 'closed') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4">
            <TvIcon className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Room Closed</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            The host has closed this room or generated a new PIN. Connect to the new room to resume live display.
          </p>
          <button
            type="button"
            onClick={handleSwitchRoom}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 cursor-pointer transition-all"
          >
            Connect to New Room PIN
          </button>
        </div>
      </div>
    );
  }

  const rawPlayers = roomData?.players || {};
  const players = Object.entries(rawPlayers).map(([id, p]) => ({
    id,
    name: typeof p === 'object' ? p.name : p,
    score: typeof p === 'object' ? p.score || 0 : 0,
    answers: typeof p === 'object' ? p.answers || {} : {}
  }));

  const currentQIndex = roomData?.currentQuestionIndex || 0;
  const currentQuestion = roomData?.questions?.[currentQIndex] || null;

  // Answers tally per option and free-text submissions
  const choiceTally = [0, 0, 0, 0];
  const freeTextSubmissions = [];
  let totalAnswersSubmitted = 0;

  players.forEach((p) => {
    const ans = p.answers?.[currentQIndex];
    if (ans !== undefined) {
      if (ans.choiceIndex !== undefined) {
        choiceTally[ans.choiceIndex] = (choiceTally[ans.choiceIndex] || 0) + 1;
      }
      if (ans.textAnswer !== undefined) {
        freeTextSubmissions.push({
          playerId: p.id,
          playerName: p.name,
          text: ans.textAnswer,
          isCorrect: ans.isCorrect,
          pointsAwarded: ans.pointsAwarded
        });
      }
      totalAnswersSubmitted++;
    }
  });

  // Closest-wins map calculations
  const isClosestPin = currentQuestion?.type === 'closest_pin';
  const targetLat = currentQuestion?.lat !== undefined ? Number(currentQuestion.lat) : 48.8584;
  const targetLng = currentQuestion?.lng !== undefined ? Number(currentQuestion.lng) : 2.2945;
  const unit = currentQuestion?.unit || 'km';

  const mapPlayersList = players.map((p) => {
    const ans = p.answers?.[currentQIndex];
    return {
      id: p.id,
      name: p.name,
      lat: ans?.lat !== undefined ? Number(ans.lat) : undefined,
      lng: ans?.lng !== undefined ? Number(ans.lng) : undefined,
      guessLat: ans?.lat,
      guessLng: ans?.lng,
      color: '#38bdf8'
    };
  });

  const rankedMapPlayers = findClosestPlayers(targetLat, targetLng, mapPlayersList, unit);
  const winnerFocusBounds = calculateFocusBounds(targetLat, targetLng, rankedMapPlayers);
  const guessesBounds = calculateGuessesBounds(rankedMapPlayers);
  const targetAndGuessesBounds = calculateTargetAndGuessesBounds(targetLat, targetLng, rankedMapPlayers);
  const winnerPlayer = rankedMapPlayers.find((p) => p.isWinner);
  const revealStage = roomData?.revealStage || 1;

  // Smart regional camera zoom:
  // Step 1: null (Pristine full world map)
  // Step 2: guessesBounds (Zoom in enough so all guesses are visible without seeing whole world)
  // Step 3: targetAndGuessesBounds (Framing all guesses and the actual landmark star)
  // Step 4: winnerFocusBounds (Tight cinematic zoom on target & closest winner)
  let activeFocusBounds = null;
  if (revealStage === 2) {
    activeFocusBounds = guessesBounds;
  } else if (revealStage === 3) {
    activeFocusBounds = targetAndGuessesBounds || guessesBounds;
  } else if (revealStage >= 4) {
    activeFocusBounds = winnerFocusBounds;
  }

  // På Spåret calculations
  const isPaSparet = currentQuestion?.type === 'pa_sparet';

  let activeTier = 10;
  let nextDropSec = 20 - (elapsedSeconds % 20);
  if (elapsedSeconds >= 80) {
    activeTier = 2;
    nextDropSec = 0;
  } else if (elapsedSeconds >= 60) {
    activeTier = 4;
    nextDropSec = 80 - elapsedSeconds;
  } else if (elapsedSeconds >= 40) {
    activeTier = 6;
    nextDropSec = 60 - elapsedSeconds;
  } else if (elapsedSeconds >= 20) {
    activeTier = 8;
    nextDropSec = 40 - elapsedSeconds;
  } else {
    activeTier = 10;
    nextDropSec = 20 - elapsedSeconds;
  }

  const paSparetSubmissions = [];
  players.forEach((p) => {
    const ans = p.answers?.[currentQIndex];
    if (ans !== undefined && ans.textAnswer !== undefined && isPaSparet) {
      paSparetSubmissions.push({
        playerId: p.id,
        playerName: p.name,
        text: ans.textAnswer,
        isCorrect: ans.isCorrect,
        pointsAwarded: ans.pointsAwarded || 0,
        lockedTier: ans.lockedTier || 2
      });
    }
  });

  const allSlides = roomData?.questions || [];
  const totalQuestions = allSlides.filter(q => q.type !== 'splash' && q.type !== 'end').length;
  const questionsPassed = allSlides.slice(0, currentQIndex + 1).filter(q => q.type !== 'splash' && q.type !== 'end').length;

  // ----------------------------------------------------
  // 1. LOBBY VIEW
  // ----------------------------------------------------
  if (!roomData || roomData.status === 'lobby') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 font-sans overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <SparklesIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">QuizPulse LIVE</h1>
              <p className="text-xs uppercase tracking-widest text-purple-400 font-bold">Room Display</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-900 border border-slate-800 text-slate-200">
              <UsersIcon className="w-5 h-5 text-purple-400" />
              <span className="text-lg font-bold">
                {players.length} {players.length === 1 ? 'Player' : 'Players'} Joined
              </span>
            </div>

            <button
              type="button"
              onClick={handleSwitchRoom}
              className="text-xs text-slate-400 hover:text-white transition-colors px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer font-semibold"
            >
              Switch Room / Change PIN
            </button>
          </div>
        </header>

        <main className="my-auto text-center flex flex-col items-center">
          <p className="text-lg sm:text-2xl font-bold uppercase tracking-widest text-purple-400 mb-3">
            Join on your phone with Game PIN
          </p>

          <div className="py-6 px-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
            <span className="text-7xl sm:text-9xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 drop-shadow-[0_15px_30px_rgba(168,85,247,0.4)]">
              {activeCode}
            </span>
          </div>

          <div className="w-full max-w-5xl mt-12">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Players in the Lobby
            </h2>

            {players.length === 0 ? (
              <p className="text-slate-500 text-lg animate-pulse">Waiting for players to enter PIN...</p>
            ) : (
              <div className="flex flex-wrap justify-center gap-3 max-h-56 overflow-y-auto p-2">
                {players.map((player, idx) => (
                  <div
                    key={player.id || idx}
                    className="px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-base font-bold text-slate-100 shadow-lg animate-in zoom-in-95 duration-200 flex items-center gap-2"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <span>{player.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <footer className="text-center text-slate-500 text-sm">
          Quiz Master will start the game shortly
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. SPLASH SCREEN VIEW (Intermission / Round Announcement)
  // ----------------------------------------------------
  if (roomData.status === 'splash') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 font-sans relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Round Announcement
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Slide {currentQIndex + 1} of {roomData.questions?.length || 1}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold">
              <UsersIcon className="w-4 h-4 text-purple-400" />
              <span>{players.length} Players Connected</span>
            </div>

            <button
              type="button"
              onClick={handleSwitchRoom}
              className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer"
            >
              Switch Room
            </button>
          </div>
        </header>

        {/* Main Splash Centerstage */}
        <main className="my-auto w-full max-w-4xl mx-auto flex flex-col items-center text-center relative z-10 py-6">
          <div className="inline-block mb-4">
            <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest shadow-lg">
              Next Up
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-purple-200 drop-shadow-[0_10px_35px_rgba(245,158,11,0.25)] mb-4 leading-tight">
            {currentQuestion?.title || 'Now the Music Round!'}
          </h1>

          {currentQuestion?.subtitle && (
            <p className="text-lg sm:text-2xl text-slate-300 font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
              {currentQuestion.subtitle}
            </p>
          )}

          {currentQuestion?.imageUrl && (
            <div className="relative max-w-xl w-full mx-auto rounded-3xl overflow-hidden border-2 border-purple-500/40 shadow-2xl shadow-purple-900/50 bg-slate-900/80 my-2">
              <img
                src={currentQuestion.imageUrl}
                alt={currentQuestion.title || 'Splash banner'}
                className="w-full max-h-[380px] sm:max-h-[440px] object-cover object-center"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </main>

        {/* Bottom Banner */}
        <footer className="text-center text-slate-400 text-xs relative z-10 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span>Quiz Master will begin the round shortly...</span>
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // 3. QUESTION & REVEAL VIEW
  // ----------------------------------------------------
  if (roomData.status === 'question' || roomData.status === 'reveal') {
    const isReveal = roomData.status === 'reveal';
    const isFreeInput = currentQuestion?.type === 'free_input';

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 font-sans">
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-purple-900/60 border border-purple-700 text-purple-200 text-sm font-bold flex items-center gap-1.5">
              {isClosestPin && <MapPinIcon className="w-4 h-4 text-emerald-400" />}
              {isFreeInput && <KeyboardIcon className="w-4 h-4 text-cyan-400" />}
              {isPaSparet && <TrainIcon className="w-4 h-4 text-amber-400" />}
              <span>{isClosestPin ? 'Closest-Wins Question' : isFreeInput ? 'Free-Text Question' : isPaSparet ? 'På Spåret Train Journey' : 'Question'} {questionsPassed} of {totalQuestions}</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
              {isPaSparet ? 'Max 10 pts' : `${currentQuestion?.points !== undefined && currentQuestion.points !== '' ? currentQuestion.points : 1} ${Number(currentQuestion?.points ?? 1) === 1 ? 'pt' : 'pts'}`}
            </span>
          </div>

          {!isReveal ? (
            <div className={`w-16 h-16 rounded-full bg-slate-900 border-2 flex items-center justify-center shadow-lg ${
              isPaSparet ? 'border-amber-500 shadow-amber-500/20' : 'border-purple-500 shadow-purple-500/20'
            }`}>
              <span className={`text-2xl font-black ${timeLeft <= 5 ? 'text-rose-400 animate-ping' : isPaSparet ? 'text-amber-300' : 'text-purple-300'}`}>
                {timeLeft}
              </span>
            </div>
          ) : (
            <div className="px-5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20">
              ✓ Answers Revealed
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">{isPaSparet ? 'Brakes Pulled' : 'Answers'}</p>
              <p className="text-xl font-black text-slate-100">{isPaSparet ? paSparetSubmissions.length : totalAnswersSubmitted} / {players.length}</p>
            </div>

            <button
              type="button"
              onClick={handleSwitchRoom}
              className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer"
            >
              Switch Room
            </button>
          </div>
        </header>

        <main className={`my-auto w-full mx-auto flex flex-col items-center transition-all duration-300 ${
          isClosestPin || isPaSparet ? 'max-w-7xl 2xl:max-w-[95vw] px-2 sm:px-6' : 'max-w-5xl'
        }`}>
          {!(isPaSparet && isReveal) && (
            <div className={`w-full bg-slate-900/90 border border-slate-800 rounded-3xl text-center shadow-2xl transition-all ${
              isClosestPin && isReveal
                ? 'py-2 px-4 mb-3'
                : isPaSparet
                  ? 'py-3.5 px-6 mb-4'
                  : 'p-6 sm:p-8 mb-6'
            }`}>
              <h2 className={`${(isClosestPin && isReveal) ? 'text-base sm:text-lg font-bold' : isPaSparet ? 'text-xl sm:text-2xl font-bold' : 'text-2xl sm:text-4xl font-black'} tracking-tight text-white leading-snug`}>
                {currentQuestion?.question || (isPaSparet ? 'Vart är vi på väg? / Where are we heading?' : 'Question')}
              </h2>
            </div>
          )}

          {/* Conditional Rendering: Closest Wins vs Free-Text vs Multiple-Choice */}
          {isClosestPin ? (
            !isReveal ? (
              /* Active Closest-Wins Question View */
              <div className="w-full bg-slate-900/90 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
                {currentQuestion?.imageUrl ? (
                  <div className="relative max-w-4xl 2xl:max-w-5xl w-full rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/60 mb-6 bg-slate-950">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Mystery Landmark"
                      className="w-full h-[45vh] min-h-[320px] max-h-[580px] 2xl:h-[55vh] 2xl:max-h-[750px] object-cover object-center"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow">
                      <MapPinIcon className="w-3.5 h-3.5 text-emerald-400" />
                      Mystery Location Photo
                    </div>
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700 text-slate-300 text-xs font-mono font-bold">
                      Closest Pin Wins • Measured in {currentQuestion?.unit || 'km'}
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6">
                    <MapPinIcon className="w-10 h-10 animate-bounce" />
                  </div>
                )}

                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  Where in the world was this photo taken?
                </h3>
                <p className="text-sm text-emerald-300/90 font-medium max-w-xl mx-auto mb-6">
                  Look at this screen, then explore the borderless map on your phone to pan, zoom, and lock in your pin!
                </p>

                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-sm font-bold text-slate-200">
                    {totalAnswersSubmitted} of {players.length} players have placed their pin
                  </span>
                </div>
              </div>
            ) : (
              /* Revealed Closest-Wins World Map View */
              <div className="w-full">
                {revealStage >= 4 ? (
                  /* Stage 4: Map & Winner Side-by-Side dynamically scaled to viewport height */
                  <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch h-[68vh] min-h-[440px] max-h-[82vh]">
                    {/* Left Column: Zoomed Map */}
                    <div className="lg:col-span-7 xl:col-span-8 h-full rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl relative">
                      <WorldMap
                        targetPin={{
                          lat: targetLat,
                          lng: targetLng,
                          label: `${currentQuestion?.landmarkName || 'Target'}${currentQuestion?.locationName ? ` (${currentQuestion.locationName})` : ''}`
                        }}
                        playerPins={rankedMapPlayers}
                        showTarget={true}
                        showPlayerPins={true}
                        showDistanceLines={true}
                        focusBounds={activeFocusBounds}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Right Column: Winner Showcase & Rankings Card */}
                    <div className="lg:col-span-5 xl:col-span-4 h-full bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in fade-in zoom-in-95 duration-500 space-y-4">
                      <div>
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit mb-2.5">
                          <TrophyIcon className="w-4 h-4 text-amber-400" /> Closest Guess Winner
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                          {winnerPlayer ? `👑 ${winnerPlayer.name}` : 'No Guesses Placed'}
                        </h3>
                        {winnerPlayer && (
                          <p className="text-sm font-semibold text-amber-300 mt-1.5">
                            Only <span className="font-mono font-black text-amber-200 text-base">{winnerPlayer.distanceFormatted}</span> away!
                          </p>
                        )}
                      </div>

                      {/* Landmark Mini Thumbnail */}
                      {currentQuestion?.imageUrl && (
                        <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
                          <img
                            src={currentQuestion.imageUrl}
                            alt={currentQuestion.landmarkName || 'Landmark'}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover object-center shrink-0"
                          />
                          <div className="pr-2 text-left min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-white truncate">{currentQuestion.landmarkName || 'Target Location'}</p>
                            <p className="text-[11px] text-slate-400 truncate">{currentQuestion.locationName || ''}</p>
                            <p className="text-[10px] font-mono text-emerald-400 mt-1">
                              {targetLat.toFixed(2)}°, {targetLng.toFixed(2)}°
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Ranked Players Leaderboard Table */}
                      {rankedMapPlayers.filter((p) => p.hasGuessed).length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Closest Guesses:
                          </span>
                          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                            {rankedMapPlayers.filter((p) => p.hasGuessed).slice(0, 6).map((player, idx) => (
                              <div
                                key={player.id}
                                className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border font-bold shadow ${
                                  player.isWinner
                                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 ring-1 ring-amber-400/30'
                                    : 'bg-slate-950 border-slate-800 text-slate-300'
                                }`}
                              >
                                <span className="font-mono text-slate-500 text-[10px]">#{idx + 1}</span>
                                <span className="font-bold truncate max-w-[90px]">{player.isWinner ? `👑 ${player.name}` : player.name}</span>
                                <span className="font-mono text-amber-300 text-[11px]">({player.distanceFormatted})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Secret Note / Host Trivia Explanation */}
                      {currentQuestion?.secretNote && (
                        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                          <SparklesIcon className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2"><strong className="text-white">Trivia:</strong> {currentQuestion.secretNote}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Stages 1, 2, 3: Full Width Expansive World Map */
                  <div className="w-full h-[68vh] min-h-[440px] max-h-[82vh] rounded-3xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl relative">
                    <WorldMap
                      targetPin={{
                        lat: targetLat,
                        lng: targetLng,
                        label: `${currentQuestion?.landmarkName || 'Target'}${currentQuestion?.locationName ? ` (${currentQuestion.locationName})` : ''}`
                      }}
                      playerPins={rankedMapPlayers}
                      showTarget={revealStage >= 3}
                      showPlayerPins={revealStage >= 2}
                      showDistanceLines={revealStage >= 3}
                      focusBounds={activeFocusBounds}
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>
            )
          ) : isFreeInput ? (
            !isReveal ? (
              /* Active Free-Text Question Stage */
              <div className="w-full bg-gradient-to-b from-slate-900 via-cyan-950/20 to-slate-900 border-2 border-cyan-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 mb-4 shadow-lg shadow-cyan-500/20">
                  <KeyboardIcon className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  Type Your Answer on Your Phone!
                </h3>
                <p className="text-sm text-cyan-300/90 font-medium max-w-lg mx-auto mb-6">
                  Free-text question: Punctuation and common typo buffers are active!
                </p>

                {/* Real-time incoming submissions status */}
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-sm font-bold text-slate-200">
                    {totalAnswersSubmitted} of {players.length} players have submitted
                  </span>
                </div>
              </div>
            ) : (
              /* Revealed Free-Text Question Stage */
              <div className="w-full space-y-6">
                {/* Correct Answer Hero Card */}
                <div className="w-full bg-gradient-to-b from-emerald-950/50 to-slate-900 border-2 border-emerald-500 rounded-3xl p-8 sm:p-10 text-center shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider mb-3">
                    <span>Correct Answer</span>
                  </div>
                  <h3 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-100 to-emerald-300 tracking-tight">
                    {currentQuestion.correctAnswer || 'Answer'}
                  </h3>
                  {currentQuestion.acceptedAnswers && (
                    <p className="text-xs text-emerald-400/80 mt-2 font-medium">
                      Also accepted:{' '}
                      {Array.isArray(currentQuestion.acceptedAnswers)
                        ? currentQuestion.acceptedAnswers.join(', ')
                        : currentQuestion.acceptedAnswers}
                    </p>
                  )}
                </div>

                {/* Player Submissions Cloud */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Player Answers ({freeTextSubmissions.filter((s) => s.isCorrect).length} of {freeTextSubmissions.length} Correct)
                    </span>
                    <span className="text-xs font-mono text-purple-400">
                      Typo & Punctuation Buffer Applied
                    </span>
                  </div>

                  {freeTextSubmissions.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-4">No answers were submitted for this question.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2.5 justify-center">
                      {freeTextSubmissions.map((sub, idx) => (
                        <div
                          key={idx}
                          className={`px-4 py-2 rounded-xl text-xs flex items-center gap-2 border font-bold shadow transition-all ${
                            sub.isCorrect
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                              : 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                          }`}
                        >
                          <span className="font-bold opacity-90">{sub.playerName}:</span>
                          <span className="font-mono">"{sub.text}"</span>
                          <span className="text-xs">{sub.isCorrect ? '✓' : '✗'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          ) : isPaSparet ? (
            !isReveal ? (
              /* Active På Spåret Train Journey Stage: Video & Clues ONLY */
              <div className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left Column: Train Video (7 cols) */}
                  <div className="lg:col-span-7 flex flex-col justify-center">
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl">
                      {extractYouTubeId(currentQuestion?.youtubeUrl) ? (
                        <iframe
                          className="w-full h-full object-cover"
                          src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(currentQuestion.youtubeUrl)}?autoplay=1&mute=0&start=${Number(currentQuestion?.videoStartTime || 0)}&controls=1&rel=0&modestbranding=1`}
                          title="På Spåret Train Journey"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-slate-950">
                          <TrainIcon className="w-16 h-16 text-amber-400 mb-3 opacity-80" />
                          <h4 className="text-xl font-bold text-white mb-1">Train In Transit</h4>
                          <p className="text-sm text-slate-400 max-w-sm">
                            Scenic rail route underway
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Progressive Clues ONLY (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                    {(currentQuestion?.clues || []).map((clue, idx) => {
                      const isUnlocked = elapsedSeconds >= clue.timeSec;
                      const isCurrentTier = activeTier === clue.tier;

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                            isCurrentTier
                              ? 'bg-amber-950/60 border-amber-400/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
                              : isUnlocked
                                ? 'bg-slate-900/90 border-slate-700/80'
                                : 'bg-slate-950/60 border-slate-800/60 opacity-40'
                          }`}
                        >
                          <span
                            className={`px-3 py-1.5 rounded-xl font-mono text-sm font-black tracking-wider shrink-0 ${
                              isCurrentTier
                                ? 'bg-amber-400 text-slate-950 shadow'
                                : isUnlocked
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700/60'
                            }`}
                          >
                            {clue.tier}p
                          </span>

                          <div className="flex-1 min-w-0">
                            {isUnlocked ? (
                              <p className="text-base sm:text-lg font-semibold text-white leading-snug">
                                {clue.text}
                              </p>
                            ) : (
                              <span className="text-sm font-mono text-slate-600 tracking-wider">
                                • • •
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Revealed På Spåret Stage: Destination Answer ONLY */
              <div className="w-full my-auto flex flex-col items-center justify-center py-12 sm:py-24 text-center animate-in zoom-in-95 duration-300">
                <span className="text-sm sm:text-base font-mono uppercase tracking-[0.3em] text-amber-400/90 font-bold mb-4">
                  Destination
                </span>
                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-yellow-300 tracking-tight drop-shadow-[0_15px_35px_rgba(245,158,11,0.25)] leading-tight">
                  {currentQuestion.destination || currentQuestion.correctAnswer || 'Destination'}
                </h1>
                {currentQuestion.acceptedAnswers && (
                  <p className="text-sm sm:text-base text-slate-400 mt-5 font-medium max-w-xl mx-auto">
                    Also accepted:{' '}
                    <span className="text-amber-200/90 font-semibold">
                      {Array.isArray(currentQuestion.acceptedAnswers)
                        ? currentQuestion.acceptedAnswers.join(', ')
                        : currentQuestion.acceptedAnswers}
                    </span>
                  </p>
                )}
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {currentQuestion?.options?.map((option, idx) => {
                const shape = shapes[idx % shapes.length];
                const isCorrectAnswer = isReveal && idx === currentQuestion.correctIndex;
                const votes = choiceTally[idx] || 0;

                return (
                  <div
                    key={idx}
                    className={`p-6 sm:p-8 rounded-2xl flex items-center justify-between gap-4 transition-all duration-300 border-2 ${shape.border} ${shape.bg} ${shape.glow} ${
                      isReveal
                        ? isCorrectAnswer
                          ? 'scale-[1.03] ring-4 ring-emerald-400 shadow-2xl opacity-100'
                          : 'opacity-40 grayscale-[40%]'
                        : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="w-10 h-10 rounded-xl bg-black/25 flex items-center justify-center text-xl font-black text-white shrink-0">
                        {shape.symbol}
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-white text-left">
                        {option}
                      </span>
                    </div>

                    {/* Reveal Badges & Vote Counts */}
                    {isReveal && (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-3 py-1 rounded-xl bg-black/30 backdrop-blur text-white text-xs font-mono font-bold">
                          {votes} {votes === 1 ? 'vote' : 'votes'}
                        </span>
                        {isCorrectAnswer && (
                          <span className="px-3 py-1 rounded-xl bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow">
                            Correct ✓
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <footer className="text-center text-slate-500 text-xs">
          QuizPulse Live Room Projection
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // 3. LEADERBOARD VIEW
  // ----------------------------------------------------
  if (roomData.status === 'leaderboard') {
    const rankedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 font-sans">
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <TrophyIcon className="w-8 h-8 text-amber-400" />
            <div>
              <h1 className="text-2xl font-black text-white">Current Leaderboard</h1>
              <p className="text-xs text-slate-400">
                Question <span className="text-amber-400 font-bold">{questionsPassed}</span> of{' '}
                <span className="text-white font-bold">{totalQuestions}</span> Standings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Questions Passed Counter Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-950/80 border border-purple-700/60 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-purple-200">
                {questionsPassed} / {totalQuestions} Questions Passed
              </span>
            </div>
            <span className="text-sm font-mono text-purple-400">Room {activeCode}</span>
            <button
              type="button"
              onClick={handleSwitchRoom}
              className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer"
            >
              Switch Room
            </button>
          </div>
        </header>

        {/* Progress Bar of Questions Passed */}
        <div className="max-w-3xl mx-auto w-full pt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">{questionsPassed}</span> of{' '}
              <span className="text-white font-bold">{totalQuestions}</span> questions completed
            </span>
            <span className="text-slate-500 font-mono">
              {totalQuestions - questionsPassed > 0
                ? `${totalQuestions - questionsPassed} remaining`
                : 'All questions completed'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-amber-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${totalQuestions > 0 ? (questionsPassed / totalQuestions) * 100 : 0}%` }}
            />
          </div>
        </div>

        <main className="my-auto max-w-3xl mx-auto w-full space-y-3">
          {rankedPlayers.slice(0, 5).map((player, index) => {
            const podiumMedal =
              index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
                  index === 0
                    ? 'bg-gradient-to-r from-amber-500/20 to-purple-600/20 border-amber-500/50 scale-[1.02] shadow-xl'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold w-10 text-center">{podiumMedal}</span>
                  <span className="text-lg sm:text-xl font-bold text-slate-100">{player.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-purple-400">{player.score}</span>
                  <span className="text-xs text-slate-500 ml-1">pts</span>
                </div>
              </div>
            );
          })}
        </main>

        <footer className="text-center text-slate-500 text-xs">
          Waiting for host to advance to the next round...
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // 4. FINISHED / OLYMPIC PODIUM VIEW
  // ----------------------------------------------------
  if (roomData.status === 'finished') {
    const endScreenItem = allSlides.find((q) => q.type === 'end') || {};
    const podiumTitle = endScreenItem.title || "Final Winner Podium!";
    const podiumSubtitle = endScreenItem.subtitle || "Quiz Completed";
    const showFullLeaderboard = endScreenItem.showFullLeaderboard !== false;
    const enableConfetti = endScreenItem.enableConfetti !== false;

    const rankedPlayers = [...players].sort((a, b) => b.score - a.score);
    const first = rankedPlayers[0];
    const second = rankedPlayers[1];
    const third = rankedPlayers[2];
    const allRunnersUp = rankedPlayers.slice(3);

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 font-sans relative overflow-hidden">
        {/* Celebration Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Victory Confetti Shower */}
        {enableConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {Array.from({ length: 45 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2.5 h-2.5 rounded-sm animate-pulse opacity-85"
                style={{
                  top: `${(i * 7) % 95}%`,
                  left: `${(i * 13) % 98}%`,
                  backgroundColor: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6', '#ef4444', '#eab308'][i % 7],
                  transform: `rotate(${i * 35}deg) scale(${0.8 + (i % 4) * 0.25})`,
                  animationDuration: `${1.2 + (i % 4) * 0.6}s`
                }}
              />
            ))}
          </div>
        )}

        <header className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <TrophyIcon className="w-8 h-8 text-amber-400" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
                {podiumTitle}
              </h1>
              <p className="text-xs text-slate-300 font-medium">{podiumSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSwitchRoom}
            className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
          >
            Switch Room
          </button>
        </header>

        {/* Podium Stage */}
        <main className="my-auto max-w-4xl mx-auto w-full relative z-10 py-6">
          <div className="flex items-end justify-center gap-4 sm:gap-6 mb-8">
            
            {/* 2nd Place (Silver - Left) */}
            {second && (
              <div className="flex flex-col items-center flex-1 max-w-[200px]">
                <div className="mb-2 text-center">
                  <span className="text-2xl sm:text-3xl">🥈</span>
                  <p className="font-black text-slate-200 text-sm sm:text-base truncate max-w-[150px]">{second.name}</p>
                  <p className="text-xs font-mono font-bold text-slate-400">{second.score} pts</p>
                </div>
                <div className="w-full h-36 sm:h-44 rounded-t-2xl bg-gradient-to-t from-slate-800 to-slate-700 border-t-2 border-slate-400 shadow-xl flex items-center justify-center">
                  <span className="text-3xl sm:text-5xl font-black text-slate-400">2</span>
                </div>
              </div>
            )}

            {/* 1st Place (Gold - Center) */}
            {first && (
              <div className="flex flex-col items-center flex-1 max-w-[220px]">
                <div className="mb-2 text-center">
                  <CrownIcon className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                  <p className="font-black text-amber-300 text-base sm:text-xl truncate max-w-[180px]">{first.name}</p>
                  <p className="text-xs sm:text-sm font-mono font-black text-amber-400">{first.score} pts</p>
                </div>
                <div className="w-full h-48 sm:h-60 rounded-t-2xl bg-gradient-to-t from-amber-700 via-amber-600 to-yellow-500 border-t-4 border-yellow-300 shadow-2xl shadow-amber-500/30 flex items-center justify-center">
                  <span className="text-4xl sm:text-7xl font-black text-slate-950">1</span>
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze - Right) */}
            {third && (
              <div className="flex flex-col items-center flex-1 max-w-[200px]">
                <div className="mb-2 text-center">
                  <span className="text-2xl sm:text-3xl">🥉</span>
                  <p className="font-black text-amber-200 text-sm sm:text-base truncate max-w-[150px]">{third.name}</p>
                  <p className="text-xs font-mono font-bold text-amber-300/80">{third.score} pts</p>
                </div>
                <div className="w-full h-28 sm:h-32 rounded-t-2xl bg-gradient-to-t from-amber-900 to-amber-800 border-t-2 border-amber-600 shadow-xl flex items-center justify-center">
                  <span className="text-2xl sm:text-4xl font-black text-amber-600">3</span>
                </div>
              </div>
            )}
          </div>

          {/* Full Final Scoreboard & Rankings */}
          {showFullLeaderboard && allRunnersUp.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 max-w-2xl mx-auto shadow-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center mb-3">
                Final Leaderboard Standings
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {allRunnersUp.map((p, idx) => (
                  <div key={p.id} className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono font-bold">#{idx + 4}</span>
                      <span className="font-bold text-slate-200 truncate max-w-[140px]">{p.name}</span>
                    </div>
                    <span className="text-purple-400 font-mono font-black">{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="text-center text-slate-500 text-xs relative z-10">
          Quiz complete! Host can restart or start a new quiz anytime.
        </footer>
      </div>
    );
  }

  return null;
}
