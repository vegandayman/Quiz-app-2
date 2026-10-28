import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../firebase.js';
import QuizMaker from './QuizMaker.jsx';
import ShareQuizModal from './ShareQuizModal.jsx';
import { loadQuizFromCloud } from '../utils/quizSharing.js';
import { findClosestPlayers } from '../utils/geoDistance.js';
import { getStoredMasterPasscode, setStoredMasterPasscode } from './HostLockScreen.jsx';
import { rankPlayersWithTieBreak, detectTopTie } from '../utils/tieBreaker.js';
import { DEFAULT_INTRO_RULES_SPLASH } from '../data/introSplashDefaults.js';

// Clean inline SVGs (zero external dependencies)
const ShareIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
  </svg>
);

const LockIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CopyIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const MapPinIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const EyeIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TrainIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="16" rx="2" />
    <path d="M4 11h16" />
    <path d="M12 3v8" />
    <path d="m8 19-2 3" />
    <path d="m16 19 2 3" />
    <circle cx="8" cy="15" r="1" />
    <circle cx="16" cy="15" r="1" />
  </svg>
);

const EditIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const RefreshCwIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const ExternalLinkIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

const CheckIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlayIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

const TrophyIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const KeyboardIcon = ({ className = 'w-4 h-4' }) => (
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

const ArrowRightIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const SparklesIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3Z" />
  </svg>
);

const UsersIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ClockIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const AwardIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const shapes = [
  { symbol: '▲', label: 'Triangle', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40' },
  { symbol: '◆', label: 'Diamond', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/40' },
  { symbol: '●', label: 'Circle', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
  { symbol: '■', label: 'Square', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' }
];

const defaultQuestions = [
  DEFAULT_INTRO_RULES_SPLASH,
  {
    id: 1,
    type: 'question',
    question: 'Which planet in our solar system has the most moons?',
    options: ['Jupiter', 'Saturn', 'Neptune', 'Mars'],
    correctIndex: 1,
    points: 1,
    secretNote: 'Saturn has 146 confirmed moons, overtaking Jupiter (95 moons) in 2023!',
    timeLimit: 60
  },
  {
    id: 2,
    type: 'question',
    question: 'What was the first video game ever played in outer space?',
    options: ['Tetris', 'Pac-Man', 'Pong', 'Space Invaders'],
    correctIndex: 0,
    points: 1,
    secretNote: 'Russian cosmonaut Aleksandr Serebrov played Tetris on his Game Boy aboard the Mir Space Station in 1993.',
    timeLimit: 60
  },
  {
    id: 'splash-1',
    type: 'splash',
    title: 'Now the Music Round!',
    subtitle: 'Get your listening ears ready — test your knowledge of iconic hits and artists.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    type: 'question',
    question: 'How many hearts does an octopus have?',
    options: ['One', 'Two', 'Three', 'Four'],
    correctIndex: 2,
    points: 1,
    secretNote: 'Two hearts pump blood to the gills, while the third circulates it to the rest of the body.',
    timeLimit: 60
  },
  {
    id: 4,
    type: 'question',
    question: 'Which programming language was created in only 10 days in May 1995?',
    options: ['Python', 'JavaScript', 'Java', 'PHP'],
    correctIndex: 1,
    points: 1,
    secretNote: 'Brendan Eich designed Mocha (which became JavaScript) in 10 days for Netscape Navigator.',
    timeLimit: 60
  },
  {
    id: 5,
    type: 'free_input',
    question: 'What is the secret superhero identity of Peter Parker?',
    correctAnswer: 'Spider-Man',
    acceptedAnswers: 'Spider-Man, Spiderman, Spyderman, Peter Parker',
    points: 1,
    secretNote: 'Spider-Man made his first appearance in Marvel Comics Amazing Fantasy #15 in August 1962.',
    timeLimit: 60
  },
  {
    id: 'closest-pin-eiffel',
    type: 'closest_pin',
    question: 'Where in the world was this photo taken?',
    landmarkName: 'Eiffel Tower',
    locationName: 'Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
    lat: 48.8584,
    lng: 2.2945,
    unit: 'km',
    points: 1,
    secretNote: 'Gustave Eiffel built this tower for the 1889 World Fair. It stands on the Champ de Mars by the Seine River!',
    timeLimit: 60
  },
  {
    id: 'pa-sparet-gothenburg',
    type: 'pa_sparet',
    question: 'Where are we heading? / Vart är vi på väg?',
    destination: 'Gothenburg',
    acceptedAnswers: 'Gothenburg, Göteborg, Goteborg',
    youtubeUrl: 'https://www.youtube.com/watch?v=q6E2XgS_c_o',
    videoStartTime: 20,
    duration: 90,
    clues: [
      { tier: 10, timeSec: 0, text: 'We depart towards a city founded on granite and salt water, where 17th-century Dutch canal planners left their geometric mark.' },
      { tier: 8, timeSec: 20, text: 'In this coastal powerhouse, the largest port in the Nordic region welcomes giant freighters beneath the Älvsborg suspension bridge.' },
      { tier: 6, timeSec: 40, text: 'Safety first! The three-point seatbelt and iconic boxy station wagons were born here, alongside Scandinavia’s grandest amusement park.' },
      { tier: 4, timeSec: 60, text: 'Sweden’s second city on the Kattegat sea, where blue-and-white trams glide past the Fish Church and Ullevi stadium.' },
      { tier: 2, timeSec: 80, text: 'Starts with G! From Avenyn to Poseidon’s fountain, welcome to Göteborg!' }
    ],
    points: 10,
    secretNote: 'Founded in 1621 by King Gustavus Adolphus ("Here the city shall lie!"). Home of Volvo, Hasselblad cameras, and Europe’s iconic Liseberg amusement park.',
    timeLimit: 90
  },
  {
    id: 'final-end-screen',
    type: 'end',
    title: "Final Scoreboard & Winners' Podium",
    subtitle: 'Congratulations to our champions and all participants!',
    showFullLeaderboard: true,
    enableConfetti: true,
    isPermanent: true
  }
];

/**
 * HostConsole Component
 * 
 * Master Controller for running Kahoot-style multiplayer quizzes:
 * - Starts quiz and launches questions
 * - Shows incoming player names and their selected answers in real time
 * - Displays secret answers and host trivia facts
 * - Reveals answers on the big screen
 * - Shows live leaderboards and advances rounds
 */
export default function HostConsole({ onOpenDisplay, onRoomCodeReady, onLockConsole, onSwitchToPlayer, initialQuizId = '' }) {
  const [roomCode, setRoomCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [roomData, setRoomData] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState(defaultQuestions);
  const [showScoreboardAfterQuestion, setShowScoreboardAfterQuestion] = useState(false);
  const [quizTitle, setQuizTitle] = useState('My Custom Quiz');
  const [isQuizMakerOpen, setIsQuizMakerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [quizBanner, setQuizBanner] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [newPasscodeVal, setNewPasscodeVal] = useState('');
  const [passcodeSuccessMsg, setPasscodeSuccessMsg] = useState('');

  // Automatically load shared quiz if friend arrived via 1-click host invite link
  useEffect(() => {
    if (!initialQuizId) return;
    let isMounted = true;
    loadQuizFromCloud(initialQuizId)
      .then((data) => {
        if (!isMounted) return;
        if (data.title) setQuizTitle(data.title);
        if (data.showScoreboardAfterQuestion !== undefined) {
          setShowScoreboardAfterQuestion(Boolean(data.showScoreboardAfterQuestion));
        }
        if (data.questions && Array.isArray(data.questions)) {
          setActiveQuestions(data.questions);
          setCurrentQIndex(0);
          if (roomCode) {
            update(ref(db, `rooms/${roomCode}`), {
              questions: data.questions,
              showScoreboardAfterQuestion: Boolean(data.showScoreboardAfterQuestion),
              currentQuestionIndex: 0
            }).catch(console.error);
          }
        }
        setQuizBanner({
          title: data.title || 'Shared Quiz',
          count: data.questions?.filter((q) => q.type !== 'splash' && q.type !== 'end').length || 0
        });
      })
      .catch((err) => {
        console.warn('Could not load shared quiz from URL:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [initialQuizId, roomCode]);


  // Notify parent of room code
  useEffect(() => {
    if (roomCode && onRoomCodeReady) {
      onRoomCodeReady(roomCode);
    }
  }, [roomCode, onRoomCodeReady]);

  // Initialize room in Firebase Realtime Database
  useEffect(() => {
    if (!roomCode) return;

    const roomRef = ref(db, `rooms/${roomCode}`);

    // Ensure default intro splash screen is stripped of any legacy rules cards
    const sanitizedInitQuestions = activeQuestions.map((q) => {
      if (q.id === 'intro-rules-splash' && q.rules) {
        const copy = { ...q };
        delete copy.rules;
        return copy;
      }
      return q;
    });

    update(roomRef, {
      roomCode,
      status: 'lobby',
      currentQuestionIndex: 0,
      questions: sanitizedInitQuestions,
      showScoreboardAfterQuestion: false,
      createdAt: Date.now()
    }).catch((err) => console.error('Error initializing room:', err));

    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomData(data);
        if (data.currentQuestionIndex !== undefined) {
          setCurrentQIndex(data.currentQuestionIndex);
        }
        if (data.questions && Array.isArray(data.questions)) {
          setActiveQuestions(data.questions);
        }
        if (data.showScoreboardAfterQuestion !== undefined) {
          setShowScoreboardAfterQuestion(Boolean(data.showScoreboardAfterQuestion));
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Host Countdown Timer synchronization
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

  // Save custom quiz from QuizMaker
  const handleSaveQuiz = async (newQuestions, title, showScoreboard) => {
    const scoreboardSetting = showScoreboard !== undefined ? showScoreboard : showScoreboardAfterQuestion;
    setActiveQuestions(newQuestions);
    setShowScoreboardAfterQuestion(scoreboardSetting);
    if (title) setQuizTitle(title);
    setCurrentQIndex(0);

    if (roomCode) {
      const roomRef = ref(db, `rooms/${roomCode}`);
      await update(roomRef, {
        questions: newQuestions,
        showScoreboardAfterQuestion: scoreboardSetting,
        currentQuestionIndex: 0,
        status: 'lobby'
      });
    }
  };

  // Toggle scoreboard setting on the fly
  const handleToggleScoreboardSetting = async () => {
    const nextVal = !showScoreboardAfterQuestion;
    setShowScoreboardAfterQuestion(nextVal);
    if (roomCode) {
      const roomRef = ref(db, `rooms/${roomCode}`);
      await update(roomRef, {
        showScoreboardAfterQuestion: nextVal
      });
    }
  };

  // Reset Room PIN
  const handleResetRoomNumber = async () => {
    if (confirm('Generate a new Room PIN? Current players will be notified to join the new room.')) {
      if (roomCode) {
        try {
          await update(ref(db, `rooms/${roomCode}`), { status: 'closed' });
        } catch (e) {
          console.error(e);
        }
      }

      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      setRoomCode(newCode);
      setCurrentQIndex(0);
      if (onRoomCodeReady) {
        onRoomCodeReady(newCode);
      }
    }
  };

  // Extract players array
  const rawPlayers = roomData?.players || {};
  const players = Object.entries(rawPlayers).map(([id, p]) => ({
    id,
    name: typeof p === 'object' ? p.name : p,
    score: typeof p === 'object' ? p.score || 0 : 0,
    answers: typeof p === 'object' ? p.answers || {} : {}
  }));

  // Sort players for leaderboard (with speed tie-breaker)
  const rankedPlayers = rankPlayersWithTieBreak(players);
  const topTie = detectTopTie(rankedPlayers);

  const activeQuestion = activeQuestions[currentQIndex] || activeQuestions[0];
  const nextQuestion = activeQuestions[currentQIndex + 1] || null;
  const status = roomData?.status || 'lobby';
  const isSplashCurrent = activeQuestion?.type === 'splash';
  const shouldShowScoreboard = !isSplashCurrent && (
    activeQuestion?.showScoreboardAfterQuestion !== undefined
      ? Boolean(activeQuestion.showScoreboardAfterQuestion)
      : (roomData?.showScoreboardAfterQuestion !== undefined
          ? Boolean(roomData.showScoreboardAfterQuestion)
          : showScoreboardAfterQuestion)
  );

  // Questions counts (excluding splash and end screens)
  const totalQuestions = activeQuestions.filter((q) => q.type !== 'splash' && q.type !== 'end').length;
  const questionsPassed = activeQuestions.slice(0, currentQIndex + 1).filter((q) => q.type !== 'splash' && q.type !== 'end').length;

  // Count choices and group players by choice or free text for the current question
  const choiceTally = [0, 0, 0, 0];
  const choicePlayers = [[], [], [], []];
  const freeTextAnswers = [];
  const pinAnswers = [];
  let totalSubmitted = 0;

  players.forEach((p) => {
    const answer = p.answers?.[currentQIndex];
    if (answer !== undefined) {
      if (answer.choiceIndex !== undefined) {
        choiceTally[answer.choiceIndex] = (choiceTally[answer.choiceIndex] || 0) + 1;
        choicePlayers[answer.choiceIndex].push({
          id: p.id,
          name: p.name,
          isCorrect: answer.isCorrect,
          pointsAwarded: answer.pointsAwarded,
          answeredAt: answer.answeredAt
        });
      }
      if (answer.textAnswer !== undefined) {
        freeTextAnswers.push({
          id: p.id,
          name: p.name,
          textAnswer: answer.textAnswer,
          isCorrect: answer.isCorrect,
          pointsAwarded: answer.pointsAwarded,
          timeElapsedSec: answer.timeElapsedSec,
          reason: answer.reason,
          answeredAt: answer.answeredAt
        });
      }
      if (answer.lat !== undefined && answer.lng !== undefined) {
        pinAnswers.push({
          id: p.id,
          name: p.name,
          score: p.score || 0,
          lat: Number(answer.lat),
          lng: Number(answer.lng),
          guessLat: answer.lat,
          guessLng: answer.lng,
          timeElapsedSec: answer.timeElapsedSec,
          answeredAt: answer.answeredAt,
          isWinner: answer.isWinner,
          distance: answer.distance,
          distanceFormatted: answer.distanceFormatted,
          pointsAwarded: answer.pointsAwarded
        });
      }
      totalSubmitted++;
    }
  });

  const isClosestPin = activeQuestion?.type === 'closest_pin';
  const targetLat = activeQuestion?.lat !== undefined ? Number(activeQuestion.lat) : 48.8584;
  const targetLng = activeQuestion?.lng !== undefined ? Number(activeQuestion.lng) : 2.2945;
  const unit = activeQuestion?.unit || 'km';

  // Compute live closest player rankings for closest_pin
  const mapPlayersList = players.map((p) => {
    const ans = p.answers?.[currentQIndex];
    return {
      id: p.id,
      name: p.name,
      score: p.score || 0,
      lat: ans?.lat !== undefined ? Number(ans.lat) : undefined,
      lng: ans?.lng !== undefined ? Number(ans.lng) : undefined,
      guessLat: ans?.lat,
      guessLng: ans?.lng
    };
  });
  const rankedMapPlayers = isClosestPin ? findClosestPlayers(targetLat, targetLng, mapPlayersList, unit) : [];
  const revealStage = roomData?.revealStage || 1;

  const isPaSparet = activeQuestion?.type === 'pa_sparet';
  const paSparetBrakesList = players.map((p) => {
    const ans = p.answers?.[currentQIndex];
    return {
      id: p.id,
      name: p.name,
      score: p.score || 0,
      hasBraked: ans?.textAnswer !== undefined,
      textAnswer: ans?.textAnswer || '',
      lockedTier: ans?.lockedTier || 0,
      isCorrect: Boolean(ans?.isCorrect),
      pointsAwarded: ans?.pointsAwarded || 0,
      timeElapsedSec: ans?.timeElapsedSec || 0
    };
  }).filter((p) => p.hasBraked);

  const allPlayersAnswered = players.length > 0 && totalSubmitted === players.length;

  // ----------------------------------------------------
  // GAME LIFECYCLE CONTROLLERS
  // ----------------------------------------------------

  // 1. START QUIZ (Lobby -> Question 1 or Splash 1)
  const handleStartQuiz = async () => {
    const roomRef = ref(db, `rooms/${roomCode}`);

    const resetPlayersUpdates = {};
    if (roomData?.players) {
      Object.keys(roomData.players).forEach((playerId) => {
        resetPlayersUpdates[`players/${playerId}/score`] = 0;
        resetPlayersUpdates[`players/${playerId}/answers`] = {};
      });
    }

    const firstItem = activeQuestions[0];
    const isSplash = firstItem?.type === 'splash';

    await update(roomRef, {
      ...resetPlayersUpdates,
      status: isSplash ? 'splash' : 'question',
      currentQuestionIndex: 0,
      revealStage: 1,
      questionStartTime: Date.now(),
      timeLimit: firstItem?.timeLimit || 60
    });
  };

  // 2. REVEAL ANSWER (Question -> Reveal)
  const handleRevealAnswer = async () => {
    const roomRef = ref(db, `rooms/${roomCode}`);

    // If active question is closest_pin, calculate winners and award points according to Option A
    if (activeQuestion?.type === 'closest_pin') {
      const pts = activeQuestion.points !== undefined && activeQuestion.points !== '' ? Math.max(0, Number(activeQuestion.points)) : 1;
      const updates = {
        status: 'reveal',
        revealStage: 1
      };

      rankedMapPlayers.forEach((p) => {
        if (p.hasGuessed) {
          updates[`players/${p.id}/answers/${currentQIndex}/distance`] = p.distance;
          updates[`players/${p.id}/answers/${currentQIndex}/distanceFormatted`] = p.distanceFormatted;
          updates[`players/${p.id}/answers/${currentQIndex}/isWinner`] = Boolean(p.isWinner);
          updates[`players/${p.id}/answers/${currentQIndex}/pointsAwarded`] = p.isWinner ? pts : 0;
          if (p.isWinner) {
            updates[`players/${p.id}/score`] = (p.score || 0) + pts;
          }
        }
      });

      await update(roomRef, updates);
      return;
    }

    await update(roomRef, {
      status: 'reveal',
      revealStage: 1
    });
  };

  // Closest-Wins 4-Stage Stepper Controllers
  const handleSetRevealStage = async (stage) => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, { revealStage: stage });
  };

  const handleNextRevealStage = async () => {
    const current = roomData?.revealStage || 1;
    if (current < 4) {
      await handleSetRevealStage(current + 1);
    }
  };

  // 3. SHOW LEADERBOARD (Reveal -> Leaderboard)
  const handleShowLeaderboard = async () => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, {
      status: 'leaderboard'
    });
  };

  // 4. NEXT SLIDE (Leaderboard / Splash -> Next Question / Splash OR Final Podium)
  const handleNextQuestion = async () => {
    const nextIndex = currentQIndex + 1;
    const roomRef = ref(db, `rooms/${roomCode}`);

    if (nextIndex < activeQuestions.length) {
      const nextItem = activeQuestions[nextIndex];
      const isSplash = nextItem?.type === 'splash';
      const isEnd = nextItem?.type === 'end';

      if (isEnd) {
        await update(roomRef, {
          status: 'finished',
          currentQuestionIndex: nextIndex,
          revealStage: 1,
          tieBreakRevealed: false
        });
        return;
      }

      await update(roomRef, {
        status: isSplash ? 'splash' : 'question',
        currentQuestionIndex: nextIndex,
        revealStage: 1,
        questionStartTime: Date.now(),
        timeLimit: nextItem?.timeLimit || 60
      });
    } else {
      await update(roomRef, {
        status: 'finished',
        revealStage: 1,
        tieBreakRevealed: false
      });
    }
  };

  // RESET TO LOBBY
  const handleResetQuiz = async () => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    const resetPlayersUpdates = {};
    if (roomData?.players) {
      Object.keys(roomData.players).forEach((playerId) => {
        resetPlayersUpdates[`players/${playerId}/score`] = 0;
        resetPlayersUpdates[`players/${playerId}/answers`] = {};
      });
    }

    await update(roomRef, {
      ...resetPlayersUpdates,
      status: 'lobby',
      currentQuestionIndex: 0,
      tieBreakRevealed: false
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">Quiz Master Console</h1>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                Private Host Screen
              </span>
            </div>
            <p className="text-xs text-slate-400">Controls live game & monitors real-time player answers</p>
          </div>
        </div>

        {/* Toolbar: Quiz Maker, Scoreboard, PIN, New PIN, Copy Invite, Open Display, Lock */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsQuizMakerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 cursor-pointer transition-all"
          >
            <EditIcon className="w-3.5 h-3.5" />
            <span>Quiz Maker</span>
          </button>

          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-xs font-semibold cursor-pointer transition-all"
            title="Share a 1-click host link with a friend or load a saved quiz"
          >
            <ShareIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Share / Load Quiz</span>
          </button>

          <button
            type="button"
            onClick={handleToggleScoreboardSetting}
            title={showScoreboardAfterQuestion ? 'Scoreboard enabled after questions. Click to toggle OFF.' : 'Scoreboard disabled (ending questions goes directly to next question). Click to toggle ON.'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
              showScoreboardAfterQuestion
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/40'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <TrophyIcon className={`w-3.5 h-3.5 ${showScoreboardAfterQuestion ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>Scoreboard: <strong className={showScoreboardAfterQuestion ? 'text-amber-300' : 'text-slate-400'}>{showScoreboardAfterQuestion ? 'ON' : 'OFF'}</strong></span>
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            PIN: <span className="text-purple-400 font-bold">{roomCode}</span>
          </div>

          <button
            type="button"
            onClick={handleResetRoomNumber}
            title="Generate a new Room PIN"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold cursor-pointer transition-all"
          >
            <RefreshCwIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>New PIN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const inviteUrl = `${window.location.origin}${window.location.pathname}?pin=${roomCode}`;
                navigator.clipboard.writeText(inviteUrl);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }
            }}
            title="Copy player invite link with PIN"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold cursor-pointer transition-all"
          >
            {copiedLink ? (
              <>
                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <CopyIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>Copy Invite</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onOpenDisplay && onOpenDisplay(roomCode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold cursor-pointer transition-all"
          >
            <ExternalLinkIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Open Display</span>
          </button>

          {onLockConsole && (
            <button
              type="button"
              onClick={onLockConsole}
              title="Lock Host Console"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-800/60 text-xs font-semibold cursor-pointer transition-all"
            >
              <LockIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Lock</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Control Dashboard */}
      <main className="max-w-5xl mx-auto w-full flex-1 my-6 space-y-6">
        {quizBanner && (
          <div className="bg-gradient-to-r from-emerald-950/60 via-teal-900/40 to-slate-900 border border-emerald-500/50 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold shrink-0">
                ✨
              </div>
              <div>
                <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Shared Quiz Loaded</p>
                <p className="text-sm font-bold text-white">{quizBanner.title}</p>
                <p className="text-xs text-slate-300">
                  {quizBanner.count} questions mounted &middot; Room PIN is <strong className="font-mono text-purple-300">{roomCode}</strong>. Ready to host!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setQuizBanner(null)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {/* ======================================================== */}
        {/* PRIMARY QUIZ FLOW CONTROLLER BANNER */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border-2 border-purple-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Stepper Status Indicators */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-400">Current Phase:</span>
              <span className="px-3 py-1 rounded-xl bg-purple-600 text-white font-mono font-black text-xs uppercase tracking-wider shadow">
                {status.toUpperCase()}
              </span>
            </div>

            {/* Stage Progress Pills */}
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <span className={`px-2.5 py-1 rounded-lg ${status === 'lobby' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                1. Lobby
              </span>
              <span className="text-slate-600">→</span>
              <span className={`px-2.5 py-1 rounded-lg ${status === 'splash' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-500'}`}>
                Splash
              </span>
              <span className="text-slate-600">→</span>
              <span className={`px-2.5 py-1 rounded-lg ${status === 'question' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                2. Question
              </span>
              <span className="text-slate-600">→</span>
              <span className={`px-2.5 py-1 rounded-lg ${status === 'reveal' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                3. Reveal
              </span>
              {shouldShowScoreboard ? (
                <>
                  <span className="text-slate-600">→</span>
                  <span className={`px-2.5 py-1 rounded-lg ${status === 'leaderboard' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    4. Leaderboard
                  </span>
                </>
              ) : (
                <>
                  <span className="text-slate-600">→</span>
                  <span className={`px-2.5 py-1 rounded-lg ${status === 'question' || status === 'splash' || status === 'finished' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    4. Direct Next
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Dynamic Big Control Action for the Active Phase */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              {status === 'lobby' && (
                <>
                  <h2 className="text-2xl font-black text-white">Lobby is Open</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {players.length} {players.length === 1 ? 'player has' : 'players have'} joined Room PIN <strong className="text-purple-400 font-mono text-sm">{roomCode}</strong>. Ready when you are!
                  </p>
                </>
              )}

              {status === 'splash' && (
                <>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
                      Splash Announcement
                    </span>
                    <h2 className="text-2xl font-black text-amber-200">
                      {activeQuestion.title || 'Round Announcement'}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">
                    {activeQuestion.subtitle || 'Active on the live big screen display and player devices.'} Take your time to introduce the round!
                  </p>
                </>
              )}

              {status === 'question' && (
                <>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-white">
                      Question {currentQIndex + 1} of {activeQuestions.length} is Live!
                    </h2>
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold flex items-center gap-1.5">
                      <ClockIcon className="w-3.5 h-3.5 text-purple-400" />
                      <span>{timeLeft}s</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                      {activeQuestion.points !== undefined && activeQuestion.points !== '' ? activeQuestion.points : 1} {Number(activeQuestion.points ?? 1) === 1 ? 'pt' : 'pts'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${allPlayersAnswered ? 'bg-emerald-400' : 'bg-purple-400 animate-pulse'}`} />
                    <span>
                      Players answering: <strong className="text-emerald-400 font-mono text-sm">{totalSubmitted} / {players.length}</strong> submitted
                    </span>
                    {allPlayersAnswered && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold uppercase">
                        All Answered!
                      </span>
                    )}
                  </p>
                </>
              )}

              {status === 'reveal' && (
                isClosestPin ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5">
                        <MapPinIcon className="w-3.5 h-3.5" /> STAGE {revealStage} OF 4
                      </span>
                      <h2 className="text-2xl font-black text-emerald-400">
                        {revealStage === 1 && '1. The World Map'}
                        {revealStage === 2 && `2. Player Guesses (${rankedMapPlayers.filter((p) => p.hasGuessed).length} Pins)`}
                        {revealStage === 3 && `3. Actual Location: ${activeQuestion?.landmarkName || 'Landmark'}!`}
                        {revealStage >= 4 && '4. Closest Winners Zoom!'}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {revealStage === 1 && 'Clean borderless world map is displayed on the big screen. Click Stage 2 to reveal all player guess pins!'}
                      {revealStage === 2 && 'Player guess pins are shown on the world map. Click Stage 3 to reveal the actual golden star location!'}
                      {revealStage === 3 && `Golden star location revealed at ${activeQuestion?.landmarkName || 'the target'}! Click Stage 4 to zoom into winners!`}
                      {revealStage >= 4 && 'Camera zoomed in on the star and closest guesses with winner congratulations! Advance when ready.'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-emerald-400">Answer Revealed!</h2>
                      {!shouldShowScoreboard && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                          Scoreboard Off • Direct to Next
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {shouldShowScoreboard
                        ? 'Correct answer & vote stats are on the big screen. Discuss host notes below, then present the scoreboard!'
                        : 'Correct answer & vote stats are on the big screen. Ending the question goes directly to the next slide!'}
                    </p>
                  </>
                )
              )}

              {status === 'leaderboard' && (
                <>
                  <h2 className="text-2xl font-black text-amber-300">Live Leaderboard Active</h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Scores and rankings are displayed on the big screen. Advance to the next question when ready!
                  </p>
                </>
              )}

              {status === 'finished' && (
                topTie.hasTopTie ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-xs font-black uppercase tracking-wider animate-pulse">
                        ⚡ DEAD-HEAT TIE-BREAK
                      </span>
                      <h2 className="text-2xl font-black text-amber-300">Tied for 1st Place!</h2>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {topTie.tiedPlayers.map(p => p.name).join(' & ')} are tied at {topTie.topScore} pts!
                      {roomData?.tieBreakRevealed
                        ? ` Decided by speed: ${topTie.winner.name} won by ${topTie.timeDifference}s!`
                        : ` Click "Reveal Speed Tie-Break" to crown the champion on the big screen.`}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-black text-purple-300">🎉 Quiz Completed!</h2>
                    <p className="text-xs text-slate-300 mt-1">
                      Final Olympic podium is showing on the live display screen!
                    </p>
                  </>
                )
              )}
            </div>

            {/* Giant Primary Action Button */}
            <div className="shrink-0 w-full sm:w-auto">
              {status === 'lobby' && (
                <button
                  type="button"
                  onClick={handleStartQuiz}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <PlayIcon className="w-5 h-5 fill-current" />
                  <span>
                    {activeQuestions[0]?.type === 'splash'
                      ? `Start Quiz (Splash: "${activeQuestions[0]?.title || 'Announcement'}")`
                      : 'Start Quiz (Question 1)'}
                  </span>
                </button>
              )}

              {status === 'splash' && (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <span>
                    {currentQIndex + 1 < activeQuestions.length
                      ? activeQuestions[currentQIndex + 1]?.type === 'splash'
                        ? `Continue to: "${activeQuestions[currentQIndex + 1]?.title || 'Next Splash'}"`
                        : activeQuestions[currentQIndex + 1]?.type === 'end'
                          ? '🏆 Show Final Scoreboard & Podium'
                          : `Start Next Question (${activeQuestions.slice(0, currentQIndex + 2).filter((q) => q.type !== 'splash' && q.type !== 'end').length} of ${totalQuestions})`
                      : '🏆 Show Final Scoreboard & Podium'}
                  </span>
                  <ArrowRightIcon className="w-5 h-5 text-slate-950" />
                </button>
              )}

              {status === 'question' && (
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRevealAnswer}
                    className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer ${
                      allPlayersAnswered || timeLeft === 0
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/40 ring-4 ring-emerald-500/40 animate-pulse'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                    }`}
                  >
                    <EyeIcon className="w-5 h-5" />
                    <span>{isClosestPin ? 'Begin 4-Stage World Map Reveal' : 'Reveal Answer on Big Screen'}</span>
                  </button>

                  {!shouldShowScoreboard && (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      title="Directly end this question and advance to the next slide"
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                    >
                      <span>Skip to Next Slide</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {status === 'reveal' && (
                isClosestPin ? (
                  <div className="flex flex-col items-end gap-2.5">
                    {/* 4-Stage Stepper Pills */}
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => handleSetRevealStage(1)}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          revealStage === 1
                            ? 'bg-emerald-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        1. Map
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetRevealStage(2)}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          revealStage === 2
                            ? 'bg-emerald-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        2. Guesses
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetRevealStage(3)}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          revealStage === 3
                            ? 'bg-emerald-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        3. Star
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetRevealStage(4)}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          revealStage >= 4
                            ? 'bg-amber-500 text-slate-950 font-black shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        4. Zoom
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {revealStage < 4 ? (
                        <button
                          type="button"
                          onClick={handleNextRevealStage}
                          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/30 cursor-pointer transition-all active:scale-95"
                        >
                          <span>
                            {revealStage === 1 && 'Next Stage: Reveal Player Guesses →'}
                            {revealStage === 2 && 'Next Stage: Reveal Star Location →'}
                            {revealStage === 3 && 'Next Stage: Zoom to Winners 🎯'}
                          </span>
                          <ArrowRightIcon className="w-4 h-4" />
                        </button>
                      ) : shouldShowScoreboard ? (
                        <button
                          type="button"
                          onClick={handleShowLeaderboard}
                          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl shadow-amber-500/30 cursor-pointer transition-all active:scale-95"
                        >
                          <TrophyIcon className="w-4 h-4" />
                          <span>Present Scoreboard</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-purple-600/30 cursor-pointer transition-all active:scale-95"
                        >
                          <span>Next Slide</span>
                          <ArrowRightIcon className="w-4 h-4" />
                        </button>
                      )}

                      {revealStage < 4 && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (shouldShowScoreboard) {
                              await handleShowLeaderboard();
                            } else {
                              await handleNextQuestion();
                            }
                          }}
                          className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer border border-slate-700"
                        >
                          Skip Reveal
                        </button>
                      )}
                    </div>
                  </div>
                ) : shouldShowScoreboard ? (
                  <button
                    type="button"
                    onClick={handleShowLeaderboard}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  >
                    <TrophyIcon className="w-5 h-5" />
                    <span>Present Scoreboard</span>
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                      <span>
                        {currentQIndex + 1 < activeQuestions.length
                          ? activeQuestions[currentQIndex + 1]?.type === 'splash'
                            ? `Continue to: "${activeQuestions[currentQIndex + 1]?.title || 'Splash Screen'}"`
                            : activeQuestions[currentQIndex + 1]?.type === 'end'
                              ? '🏆 Show Final Scoreboard & Podium'
                              : `Start Question ${activeQuestions.slice(0, currentQIndex + 2).filter((q) => q.type !== 'splash' && q.type !== 'end').length} of ${totalQuestions}`
                          : '🏆 Show Final Scoreboard & Podium'}
                      </span>
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleShowLeaderboard}
                      title="Scoreboard is disabled for this question, but you can still view it if desired"
                      className="w-full sm:w-auto px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                    >
                      <TrophyIcon className="w-4 h-4 text-amber-400" />
                      <span>Present Scoreboard Anyway</span>
                    </button>
                  </div>
                )
              )}

              {status === 'leaderboard' && (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <span>
                    {currentQIndex + 1 < activeQuestions.length
                      ? activeQuestions[currentQIndex + 1]?.type === 'splash'
                        ? `Continue to: "${activeQuestions[currentQIndex + 1]?.title || 'Splash Screen'}"`
                        : activeQuestions[currentQIndex + 1]?.type === 'end'
                          ? '🏆 Show Final Scoreboard & Podium'
                          : `Start Question ${currentQIndex + 2} of ${totalQuestions}`
                      : '🏆 Show Final Scoreboard & Podium'}
                  </span>
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              )}

              {status === 'finished' && (
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  {topTie.hasTopTie && (
                    <button
                      type="button"
                      onClick={async () => {
                        const roomRef = ref(db, `rooms/${roomCode}`);
                        await update(roomRef, {
                          tieBreakRevealed: !roomData?.tieBreakRevealed
                        });
                      }}
                      className={`w-full sm:w-auto px-6 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                        !roomData?.tieBreakRevealed
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 shadow-amber-500/40 animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <span>⚡ {!roomData?.tieBreakRevealed ? 'Reveal Speed Tie-Break on Big Screen' : 'Replay Tie-Break Reveal'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-base cursor-pointer shadow-lg transition-all"
                  >
                    Play Again / Reset Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* LEADERBOARD STANDINGS (SHOWN DURING LEADERBOARD & FINISHED) */}
        {/* ======================================================== */}
        {(status === 'leaderboard' || status === 'finished') && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <TrophyIcon className="w-4 h-4 text-amber-400" />
                Live Standings Overview (Shown on Big Screen)
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-300 font-mono text-xs font-bold">
                  {questionsPassed} of {totalQuestions} Questions Passed
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({totalQuestions - questionsPassed > 0 ? `${totalQuestions - questionsPassed} remaining` : 'Quiz round complete'}) • {players.length} Competitors
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rankedPlayers.slice(0, 6).map((player, idx) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-sm ${
                    idx === 0
                      ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-base w-6 text-center">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <span className="font-bold">{player.name}</span>
                    {player.wonOnTieBreak && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono font-bold">
                        ⚡ Speed Winner
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-purple-400">{player.score} pts</span>
                    <span className="block text-[10px] text-slate-400 font-mono">⏱️ {player.formattedTime}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Question Preview for Host */}
            {nextQuestion && status === 'leaderboard' && (
              <div className="mt-4 p-4 rounded-2xl bg-purple-950/30 border border-purple-800/50">
                <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider">
                  Upcoming: Slide #{currentQIndex + 2} Preview
                </span>
                {nextQuestion.type === 'splash' ? (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                      Splash Screen
                    </span>
                    <span className="font-bold text-white text-sm">{nextQuestion.title || 'Announcement'}</span>
                    {nextQuestion.subtitle && (
                      <span className="text-xs text-slate-400">({nextQuestion.subtitle})</span>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-white text-sm mt-1">{nextQuestion.question}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-emerald-400 font-semibold">
                        Correct Answer: {nextQuestion.options?.[nextQuestion.correctIndex]}
                      </span>
                      <span className="text-amber-400 font-mono">
                        ({nextQuestion.points !== undefined && nextQuestion.points !== '' ? nextQuestion.points : 1} {Number(nextQuestion.points ?? 1) === 1 ? 'pt' : 'pts'})
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* CONFIDENTIAL ANSWER KEY & REAL-TIME PLAYER SELECTIONS OR SPLASH PREVIEW */}
        {/* ======================================================== */}
        {activeQuestion && status !== 'finished' && (
          activeQuestion.type === 'splash' ? (
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
                    SLIDE {currentQIndex + 1} OF {activeQuestions.length} • SPLASH SCREEN
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  <EyeIcon className="w-4 h-4 text-amber-400" />
                  <span>ACTIVE ON LIVE BIG SCREEN & PLAYERS</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                {activeQuestion.imageUrl && (
                  <div className="w-full md:w-64 h-44 rounded-2xl overflow-hidden border border-purple-500/30 shadow-lg shrink-0 bg-slate-950">
                    <img
                      src={activeQuestion.imageUrl}
                      alt="Splash banner"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Round Title</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {activeQuestion.title || 'Now the Music Round!'}
                  </h2>
                  {activeQuestion.subtitle && (
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {activeQuestion.subtitle}
                    </p>
                  )}
                  <div className="pt-2 text-xs text-purple-300 flex items-center justify-center md:justify-start gap-1.5 font-medium">
                    <span>💡 Host guidance: Players have no choices to submit during splash screens. Use this time to introduce the round, announce rules, or play audio. Click the button above when ready to launch questions.</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold flex items-center gap-1.5">
                  {activeQuestion.type === 'closest_pin' && <MapPinIcon className="w-3.5 h-3.5 text-emerald-400" />}
                  {activeQuestion.type === 'free_input' && <KeyboardIcon className="w-3.5 h-3.5 text-cyan-400" />}
                  {activeQuestion.type === 'pa_sparet' && <TrainIcon className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{activeQuestion.type === 'closest_pin' ? 'CLOSEST-PIN' : activeQuestion.type === 'free_input' ? 'FREE-TEXT' : activeQuestion.type === 'pa_sparet' ? 'PÅ SPÅRET' : 'QUESTION'} {questionsPassed} OF {totalQuestions}</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1">
                  <AwardIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeQuestion.points !== undefined && activeQuestion.points !== '' ? activeQuestion.points : 1} {Number(activeQuestion.points ?? 1) === 1 ? 'pt' : 'pts'}</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                <EyeIcon className="w-4 h-4 text-amber-400" />
                <span>CONFIDENTIAL ANSWER KEY (ONLY HOST SEES THIS)</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              {activeQuestion.question}
            </h2>

            {/* Answer Display: Closest-Pin Target vs Free-Input Target vs Multiple Choice Options */}
            {activeQuestion.type === 'closest_pin' ? (
              <div className="p-5 rounded-2xl bg-emerald-950/30 border-2 border-emerald-500/50 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-900/40">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <MapPinIcon className="w-4 h-4 text-emerald-400" />
                    Target Mystery Landmark & Coordinates
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400/90 bg-emerald-950 border border-emerald-800/80 px-2 py-0.5 rounded">
                    Closest Guess Wins • Measured in {activeQuestion.unit || 'km'}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-5">
                  {activeQuestion.imageUrl && (
                    <div className="w-full md:w-56 h-36 rounded-xl overflow-hidden border border-emerald-500/40 shrink-0 bg-slate-950 shadow-md">
                      <img
                        src={activeQuestion.imageUrl}
                        alt="Mystery Landmark"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-2 text-left">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Target Landmark:</span>
                      <h3 className="text-xl font-black text-white">{activeQuestion.landmarkName || 'Landmark'}</h3>
                      {activeQuestion.locationName && (
                        <p className="text-xs text-slate-300">{activeQuestion.locationName}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-emerald-500/30 text-emerald-300">
                        Lat: {targetLat.toFixed(4)}°
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-emerald-500/30 text-emerald-300">
                        Lng: {targetLng.toFixed(4)}°
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        Unit: {activeQuestion.unit === 'miles' ? 'Miles (mi)' : 'Kilometers (km)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ranked Player Guesses */}
                {rankedMapPlayers.filter((p) => p.hasGuessed).length > 0 && (
                  <div className="pt-2 border-t border-emerald-900/40 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      Ranked Player Guesses ({rankedMapPlayers.filter((p) => p.hasGuessed).length} placed):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {rankedMapPlayers.filter((p) => p.hasGuessed).map((player, idx) => (
                        <div
                          key={player.id}
                          className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border font-bold ${
                            player.isWinner
                              ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-2 ring-amber-400/30'
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="text-slate-500 font-mono">#{idx + 1}</span>
                          <span>{player.isWinner ? `👑 ${player.name}` : player.name}</span>
                          <span className="font-mono text-emerald-400">({player.distanceFormatted})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : activeQuestion.type === 'free_input' ? (
              <div className="p-5 rounded-2xl bg-cyan-950/30 border-2 border-cyan-500/50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-cyan-900/40">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <KeyboardIcon className="w-4 h-4 text-cyan-400" />
                    Target Free-Text Answer (Audience types on phones)
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400/90 bg-cyan-950 border border-cyan-800/80 px-2 py-0.5 rounded">
                    Typo & Punctuation Buffer Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                      Primary Correct Answer:
                    </span>
                    <span className="text-xl font-black text-emerald-300 font-sans">
                      {activeQuestion.correctAnswer || 'Spider-Man'}
                    </span>
                  </div>

                  {activeQuestion.acceptedAnswers && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Alternative Accepted Variations:
                      </span>
                      <span className="text-sm font-semibold text-slate-200">
                        {Array.isArray(activeQuestion.acceptedAnswers)
                          ? activeQuestion.acceptedAnswers.join(', ')
                          : activeQuestion.acceptedAnswers}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed pt-1">
                  💡 <strong className="text-slate-300">Buffer explanation:</strong> Answers like{' '}
                  <span className="text-cyan-300 font-mono">"spiderman"</span>,{' '}
                  <span className="text-cyan-300 font-mono">"spyderman"</span>, or{' '}
                  <span className="text-cyan-300 font-mono">"spider-man!"</span> are automatically scored as correct!
                </p>
              </div>
            ) : activeQuestion.type === 'pa_sparet' ? (
              <div className="p-5 rounded-2xl bg-amber-950/30 border-2 border-amber-500/50 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-amber-900/40">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <TrainIcon className="w-4 h-4 text-amber-400" />
                    På Spåret Train Journey · Confidential Key & Clue Guide
                  </span>
                  <span className="text-[11px] font-mono text-amber-400/90 bg-amber-950 border border-amber-800/80 px-2 py-0.5 rounded">
                    5 Clue Drops (10 → 8 → 6 → 4 → 2 pts)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                      Destination City:
                    </span>
                    <span className="text-2xl font-black text-amber-300 font-sans tracking-wide">
                      {activeQuestion.destination || activeQuestion.correctAnswer || 'Unknown'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Alternative Accepted Spellings:
                    </span>
                    <span className="text-sm font-semibold text-slate-200">
                      {Array.isArray(activeQuestion.acceptedAnswers)
                        ? activeQuestion.acceptedAnswers.join(', ')
                        : (activeQuestion.acceptedAnswers || activeQuestion.destination || 'None')}
                    </span>
                  </div>
                </div>

                {/* 5-Tier Clues Breakdown for Host */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    5 Progressive Clues Timeline:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {(activeQuestion.clues || []).map((clue, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold shrink-0">
                          {clue.tier} PTS ({clue.timeSec}s)
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">{clue.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-time Brakes Pulled by Players */}
                {paSparetBrakesList.length > 0 && (
                  <div className="pt-2 border-t border-amber-900/40 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                      Emergency Brakes Pulled ({paSparetBrakesList.length} players locked in):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {paSparetBrakesList.map((entry) => (
                        <div
                          key={entry.id}
                          className="px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border font-bold bg-slate-950 border-amber-500/40 text-amber-200"
                        >
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          <span>{entry.name}</span>
                          <span className="font-mono text-xs text-amber-400">({entry.lockedTier} pts lock)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Answer Options with SECRET HIGHLIGHT + PLAYER NAMES WHO PICKED EACH */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeQuestion.options?.map((option, idx) => {
                  const isCorrect = idx === activeQuestion.correctIndex;
                  const votesCount = choiceTally[idx] || 0;
                  const voters = choicePlayers[idx] || [];
                  const shape = shapes[idx] || shapes[0];

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                        isCorrect
                          ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30 text-white shadow-lg'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-mono font-bold ${shape.color}`}>{shape.symbol} {shape.label}</span>
                          <span className="font-bold text-sm">{option}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCorrect && (
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                              CORRECT ✓
                            </span>
                          )}
                          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-mono text-slate-300">
                            {votesCount} {votesCount === 1 ? 'vote' : 'votes'}
                          </span>
                        </div>
                      </div>

                      {/* Real-time player badges under this option */}
                      {voters.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                            Chosen by:
                          </span>
                          {voters.map((v) => (
                            <span
                              key={v.id}
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                                isCorrect
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                                  : 'bg-rose-500/20 border-rose-500/40 text-rose-200'
                              }`}
                            >
                              {v.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Real-time Live Incoming Answers Feed */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-950/90 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Incoming Answers Feed ({totalSubmitted} of {players.length} answered)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Real-time Firebase update</span>
              </div>

              {players.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No players in the room yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                  {players.map((p) => {
                    const ans = p.answers?.[currentQIndex];
                    const hasAnswered = ans !== undefined && (ans.choiceIndex !== undefined || ans.textAnswer !== undefined || (ans.lat !== undefined && ans.lng !== undefined));
                    const isPin = hasAnswered && ans.lat !== undefined && ans.lng !== undefined;
                    const isTextAnswer = hasAnswered && ans.textAnswer !== undefined;
                    const choiceShape = hasAnswered && !isTextAnswer && !isPin ? shapes[ans.choiceIndex] : null;
                    const choiceText = hasAnswered && !isTextAnswer && !isPin ? activeQuestion.options?.[ans.choiceIndex] : '';
                    const isCorrect = hasAnswered && (isPin ? Boolean(ans.isWinner) : Boolean(ans.isCorrect));

                    return (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                          hasAnswered
                            ? isCorrect
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                              : isPin
                                ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                                : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
                            : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${hasAnswered ? (isCorrect ? 'bg-emerald-400' : isPin ? 'bg-emerald-400' : 'bg-rose-400') : 'bg-amber-400 animate-ping'}`} />
                          <span className="font-bold text-white truncate">{p.name}</span>
                        </div>

                        {hasAnswered ? (
                          isPin ? (
                            <div className="flex items-center gap-1.5 shrink-0 font-mono font-bold">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 text-[11px] flex items-center gap-1">
                                <MapPinIcon className="w-3 h-3 text-emerald-400" />
                                {status === 'reveal'
                                  ? (ans.distanceFormatted || 'Pin placed')
                                  : `${Number(ans.lat).toFixed(1)}°, ${Number(ans.lng).toFixed(1)}°`}
                              </span>
                              {status === 'reveal' && ans.isWinner && (
                                <span className="text-amber-400" title="Closest Guess Winner!">👑</span>
                              )}
                            </div>
                          ) : isTextAnswer ? (
                            <div className="flex items-center gap-1.5 shrink-0 font-mono font-bold">
                              <span className="truncate max-w-[90px] px-2 py-0.5 rounded bg-slate-800 text-cyan-200 text-xs" title={ans.textAnswer}>
                                "{ans.textAnswer}"
                              </span>
                              {activeQuestion.type === 'pa_sparet' && ans.lockedTier !== undefined && (
                                <span className="text-[10px] text-amber-300 font-mono bg-amber-950/80 px-1 rounded">
                                  {ans.lockedTier}p
                                </span>
                              )}
                              <span className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                                {isCorrect ? '✓' : '✗'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 shrink-0 font-mono font-bold">
                              <span className={`px-1.5 py-0.5 rounded ${choiceShape?.bg} ${choiceShape?.color} border ${choiceShape?.border}`}>
                                {choiceShape?.symbol}
                              </span>
                              <span className="truncate max-w-[80px]" title={choiceText}>
                                {choiceText}
                              </span>
                              <span className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                                {isCorrect ? '✓' : '✗'}
                              </span>
                            </div>
                          )
                        ) : (
                          <span className="text-[10px] text-amber-400/80 font-medium italic shrink-0">
                            Thinking...
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECRET HOST TRIVIA FACT */}
            {activeQuestion.secretNote && (
              <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/80 text-purple-200 text-xs flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-purple-700 text-white text-[10px] font-black uppercase shrink-0">
                  Host Trivia Fact
                </span>
                <p className="leading-relaxed text-purple-100">{activeQuestion.secretNote}</p>
              </div>
            )}
          </div>
          )
        )}

        {/* ======================================================== */}
        {/* PLAYERS IN ROOM TRACKER */}
        {/* ======================================================== */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <UsersIcon className="w-4 h-4 text-purple-400" />
              Players in Room ({players.length})
            </span>
            <span className="text-slate-500 font-mono">Live Firebase sync</span>
          </div>

          {players.length === 0 ? (
            <p className="text-slate-500 italic">No players have joined yet. Tell players to enter PIN {roomCode}.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {players.map((p) => {
                const hasAnswered = p.answers && p.answers[currentQIndex] !== undefined;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      hasAnswered
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${hasAnswered ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    <span className="font-bold">{p.name}</span>
                    <span className="text-slate-500 text-[10px]">({p.score} pts)</span>
                    {hasAnswered && <span className="text-[10px] text-emerald-400 font-bold">✓ answered</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer Utility Bar */}
      <footer className="max-w-5xl mx-auto w-full pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Room Code: <code className="text-purple-400 font-mono font-bold">/rooms/{roomCode}</code>
        </div>
        <div className="flex items-center flex-wrap gap-3">
          <button
            type="button"
            onClick={handleResetQuiz}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Reset to Lobby
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setIsQuizMakerOpen(true)}
            className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer font-semibold"
          >
            Edit Questions in Quiz Maker
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              setNewPasscodeVal(getStoredMasterPasscode());
              setPasscodeSuccessMsg('');
              setShowPasscodeModal(true);
            }}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            Change Passcode
          </button>
          {onSwitchToPlayer && (
            <>
              <span>•</span>
              <button
                type="button"
                onClick={onSwitchToPlayer}
                className="text-slate-400 hover:text-purple-400 transition-colors cursor-pointer"
              >
                Player Join Screen →
              </button>
            </>
          )}
        </div>
      </footer>

      {/* QUIZ MAKER MODAL */}
      {isQuizMakerOpen && (
        <QuizMaker
          initialQuestions={activeQuestions}
          initialShowScoreboardAfterQuestion={showScoreboardAfterQuestion}
          onSaveQuiz={handleSaveQuiz}
          onClose={() => setIsQuizMakerOpen(false)}
        />
      )}

      {/* MASTER PASSCODE SETTINGS MODAL */}
      {showPasscodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LockIcon className="w-4 h-4 text-purple-400" />
                <span>Host Master Passcode Settings</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPasscodeModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Only hosts with this passcode can access the Host Console. Change it to secure your game sessions.
            </p>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                New Host Passcode
              </label>
              <input
                type="text"
                value={newPasscodeVal}
                onChange={(e) => setNewPasscodeVal(e.target.value)}
                placeholder="Enter new master passcode"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono outline-none focus:border-purple-500"
              />
            </div>

            {passcodeSuccessMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-emerald-400" />
                <span>{passcodeSuccessMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setStoredMasterPasscode('quizmaster2026');
                  setNewPasscodeVal('quizmaster2026');
                  setPasscodeSuccessMsg('Reset to default passcode (quizmaster2026)!');
                  setTimeout(() => setPasscodeSuccessMsg(''), 3000);
                }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                Reset to Default
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasscodeModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newPasscodeVal.trim()) {
                      setStoredMasterPasscode(newPasscodeVal.trim());
                      setPasscodeSuccessMsg('Master passcode updated successfully!');
                      setTimeout(() => {
                        setPasscodeSuccessMsg('');
                        setShowPasscodeModal(false);
                      }, 1200);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow cursor-pointer transition-all"
                >
                  Save Passcode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share / Load Quiz Modal */}
      <ShareQuizModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        currentQuestions={questions}
        quizTitle={quizTitle}
        showScoreboardAfterQuestion={showScoreboardAfterQuestion}
        onLoadQuiz={(loaded) => {
          handleSaveQuiz(loaded.questions, loaded.title, loaded.showScoreboardAfterQuestion);
          setQuizBanner({
            title: loaded.title,
            count: loaded.questions.length,
          });
        }}
      />
    </div>
  );
}
