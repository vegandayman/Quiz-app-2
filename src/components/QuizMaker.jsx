import React, { useState, useRef } from 'react';
import { checkFreeInputAnswer } from '../utils/answerMatcher.js';
import { LANDMARK_PRESETS } from '../utils/geoDistance.js';
import { PA_SPARET_PRESETS, extractYouTubeId } from '../data/paSparetPresets.js';
import { DEFAULT_INTRO_RULES_SPLASH, DEFAULT_RULES_LIST } from '../data/introSplashDefaults.js';
import WorldMap from './WorldMap.jsx';
import ShareQuizModal from './ShareQuizModal.jsx';

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

const TrainIcon = ({ className = 'w-4 h-4' }) => (
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

const MapPinIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
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

const PlusIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const DownloadIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const UploadIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CheckIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AwardIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const ImageIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const ChevronUpIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const ChevronDownIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SparklesIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3Z" />
  </svg>
);

const TrophyIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const shapes = [
  { symbol: '▲', label: 'Red Triangle', bg: 'bg-red-600', ring: 'ring-red-500' },
  { symbol: '◆', label: 'Blue Diamond', bg: 'bg-blue-600', ring: 'ring-blue-500' },
  { symbol: '●', label: 'Yellow Circle', bg: 'bg-amber-500', ring: 'ring-amber-500' },
  { symbol: '■', label: 'Green Square', bg: 'bg-emerald-600', ring: 'ring-emerald-500' }
];

// Curated themes & presets for fast splash creation
const splashPresets = [
  {
    name: '👋 Welcome Intro',
    badge: 'Welcome',
    title: 'Welcome to QuizPulse Live!',
    subtitle: 'Grab a drink, get comfortable, and get ready to play!',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: '🎵 Music Round',
    title: 'Now the Music Round!',
    subtitle: 'Listen closely and name these iconic tunes and artists.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: '🎬 Movies & TV',
    title: 'Movie & Pop Culture Round',
    subtitle: 'Put your cinematic memory and quote mastery to the test!',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: '🔬 Science & Nature',
    title: 'Science & Discovery Round',
    subtitle: 'From microscopic wonders to the distant reaches of space.',
    imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: '⚽ Sports & Games',
    title: 'Sports & Athletics Round',
    subtitle: 'Legendary moments, champions, and athletic trivia.',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: '🍺 Half-time Break',
    title: 'Intermission & Drink Break!',
    subtitle: 'Stretch your legs and grab a refill — round two begins shortly!',
    imageUrl: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: '🏆 Grand Finale',
    title: 'The Final Lightning Round!',
    subtitle: 'Highest stakes! This round decides who takes the gold podium.',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80'
  }
];

/**
 * QuizMaker Component
 * 
 * - Full quiz & slide builder supporting Questions and Splash Screens
 * - Add splash screens between questions (with uploaded image or URL)
 * - Configurable score points per question (arbitrary numerical input, default 1)
 * - Move questions / splash screens up and down to arrange rounds
 * - Exports quiz as JSON file (.json)
 * - Imports previously saved JSON files
 * - Saves directly to the live Firebase room
 */
const DEFAULT_END_SCREEN = {
  id: 'final-end-screen',
  type: 'end',
  title: "Final Scoreboard & Winners' Podium",
  subtitle: 'Congratulations to our champions and thank you for playing!',
  showFullLeaderboard: true,
  enableConfetti: true,
  isPermanent: true
};

export default function QuizMaker({ initialQuestions = [], initialShowScoreboardAfterQuestion = false, onSaveQuiz, onClose }) {
  const [quizTitle, setQuizTitle] = useState('My Custom Quiz');
  const [showScoreboardAfterQuestion, setShowScoreboardAfterQuestion] = useState(() => initialShowScoreboardAfterQuestion);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [questions, setQuestions] = useState(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      const parsed = JSON.parse(JSON.stringify(initialQuestions)).map((q) => {
        if (q.type === 'end') {
          return {
            ...DEFAULT_END_SCREEN,
            ...q,
            id: q.id || 'final-end-screen',
            type: 'end',
            title: q.title || DEFAULT_END_SCREEN.title,
            subtitle: q.subtitle || DEFAULT_END_SCREEN.subtitle,
            showFullLeaderboard: q.showFullLeaderboard !== undefined ? Boolean(q.showFullLeaderboard) : true,
            enableConfetti: q.enableConfetti !== undefined ? Boolean(q.enableConfetti) : true,
            isPermanent: true
          };
        }
        if (q.type === 'splash') {
          const isIntroSplash = q.id === 'intro-rules-splash';
          return {
            id: q.id || Date.now(),
            type: 'splash',
            badge: q.badge || (isIntroSplash ? 'Welcome' : (q.rules?.length ? 'Quiz Intro & Rules' : 'Round Announcement')),
            title: q.title || (isIntroSplash ? 'Welcome to QuizPulse Live!' : 'Now the Music Round!'),
            subtitle: q.subtitle !== undefined ? q.subtitle : (isIntroSplash ? 'Grab a drink, get comfortable, and get ready to play!' : ''),
            imageUrl: q.imageUrl || (isIntroSplash ? DEFAULT_INTRO_RULES_SPLASH.imageUrl : ''),
            rules: isIntroSplash ? undefined : (Array.isArray(q.rules) && q.rules.length > 0 ? q.rules : undefined)
          };
        }
        if (q.type === 'closest_pin') {
          return {
            ...q,
            type: 'closest_pin',
            question: q.question || 'Where in the world was this photo taken?',
            landmarkName: q.landmarkName || 'Eiffel Tower',
            locationName: q.locationName || 'Paris, France',
            lat: q.lat !== undefined && !isNaN(Number(q.lat)) ? Number(q.lat) : 48.8584,
            lng: q.lng !== undefined && !isNaN(Number(q.lng)) ? Number(q.lng) : 2.2945,
            unit: q.unit === 'mi' || q.unit === 'miles' ? 'mi' : 'km',
            imageUrl: q.imageUrl !== undefined ? q.imageUrl : 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
            points: q.points !== undefined && q.points !== '' && !isNaN(Number(q.points)) ? Number(q.points) : 1,
            secretNote: q.secretNote !== undefined ? q.secretNote : '',
            timeLimit: q.timeLimit || 60,
            showScoreboardAfterQuestion: q.showScoreboardAfterQuestion !== undefined ? Boolean(q.showScoreboardAfterQuestion) : initialShowScoreboardAfterQuestion
          };
        }
        if (q.type === 'free_input') {
          return {
            ...q,
            type: 'free_input',
            correctAnswer: q.correctAnswer || '',
            acceptedAnswers: q.acceptedAnswers || '',
            points: q.points !== undefined && q.points !== '' ? Number(q.points) : 1,
            timeLimit: q.timeLimit || 60,
            showScoreboardAfterQuestion: q.showScoreboardAfterQuestion !== undefined ? Boolean(q.showScoreboardAfterQuestion) : initialShowScoreboardAfterQuestion
          };
        }
        if (q.type === 'pa_sparet') {
          const defaultPreset = PA_SPARET_PRESETS[0];
          return {
            ...q,
            type: 'pa_sparet',
            question: q.question || 'Where are we heading? / Vart är vi på väg?',
            destination: q.destination || q.correctAnswer || defaultPreset.destination,
            acceptedAnswers: q.acceptedAnswers || defaultPreset.acceptedAnswers,
            youtubeUrl: q.youtubeUrl || defaultPreset.youtubeUrl,
            videoStartTime: q.videoStartTime !== undefined && !isNaN(Number(q.videoStartTime)) ? Number(q.videoStartTime) : defaultPreset.videoStartTime,
            duration: q.duration && !isNaN(Number(q.duration)) ? Number(q.duration) : 90,
            clues: Array.isArray(q.clues) && q.clues.length === 5 ? q.clues : JSON.parse(JSON.stringify(defaultPreset.clues)),
            points: 10,
            secretNote: q.secretNote !== undefined ? q.secretNote : defaultPreset.secretNote,
            timeLimit: q.timeLimit || q.duration || 90,
            showScoreboardAfterQuestion: q.showScoreboardAfterQuestion !== undefined ? Boolean(q.showScoreboardAfterQuestion) : initialShowScoreboardAfterQuestion
          };
        }
        return {
          ...q,
          type: 'question',
          points: q.points !== undefined && q.points !== '' ? Number(q.points) : 1,
          timeLimit: q.timeLimit || 60,
          showScoreboardAfterQuestion: q.showScoreboardAfterQuestion !== undefined ? Boolean(q.showScoreboardAfterQuestion) : initialShowScoreboardAfterQuestion
        };
      });

      // Ensure the non-removable end screen is always placed at the end
      const nonEndSlides = parsed.filter((q) => q.type !== 'end');
      const existingEnd = parsed.find((q) => q.type === 'end') || DEFAULT_END_SCREEN;
      return [...nonEndSlides, existingEnd];
    }

    return [
      DEFAULT_INTRO_RULES_SPLASH,
      {
        id: 1,
        type: 'question',
        question: 'Which planet in our solar system has the most moons?',
        options: ['Jupiter', 'Saturn', 'Neptune', 'Mars'],
        correctIndex: 1,
        points: 1,
        secretNote: 'Saturn has 146 confirmed moons.',
        timeLimit: 60,
        showScoreboardAfterQuestion: false
      },
      {
        id: 2,
        type: 'splash',
        title: 'Now the Music Round!',
        subtitle: 'Listen closely to the audio clues and name the artist or track.',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 3,
        type: 'question',
        question: 'What was the first music video played on MTV in 1981?',
        options: ['Thriller', 'Video Killed the Radio Star', 'Bohemian Rhapsody', 'Take On Me'],
        correctIndex: 1,
        points: 1,
        secretNote: 'The Buggles released the single in 1979.',
        timeLimit: 60,
        showScoreboardAfterQuestion: false
      },
      {
        id: 4,
        type: 'closest_pin',
        question: 'Where in the world was this photo taken?',
        landmarkName: 'Eiffel Tower',
        locationName: 'Paris, France',
        lat: 48.8584,
        lng: 2.2945,
        unit: 'km',
        imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
        points: 1,
        secretNote: 'Completed in 1889, standing 330 meters tall on the Champ de Mars.',
        timeLimit: 60,
        showScoreboardAfterQuestion: false
      },
      {
        id: 5,
        type: 'free_input',
        question: 'What is the superhero secret identity of Peter Parker?',
        correctAnswer: 'Spider-Man',
        acceptedAnswers: 'Spider-Man, Spiderman, Spyderman, Peter Parker',
        points: 1,
        secretNote: 'Spider-Man made his first appearance in Amazing Fantasy #15 in 1962.',
        timeLimit: 60,
        showScoreboardAfterQuestion: false
      },
      {
        ...DEFAULT_END_SCREEN
      }
    ];
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const [notification, setNotification] = useState('');
  const [testBufferInput, setTestBufferInput] = useState('');
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url'
  const fileInputRef = useRef(null);
  const imageUploadRef = useRef(null);

  const activeQ = questions[activeIdx] || questions[0];

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Toggle global scoreboard after question setting
  const handleToggleGlobalScoreboard = () => {
    const nextVal = !showScoreboardAfterQuestion;
    setShowScoreboardAfterQuestion(nextVal);
    // Also synchronize questions so all existing questions update
    const updated = questions.map((q) => {
      if (q.type === 'splash') return q;
      return {
        ...q,
        showScoreboardAfterQuestion: nextVal
      };
    });
    setQuestions(updated);
    showNotification(
      nextVal
        ? 'Scoreboard enabled: Leaderboard will show after questions'
        : 'Scoreboard disabled: Ending questions will go directly to the next question'
    );
  };

  // Toggle scoreboard for active question
  const handleToggleQuestionScoreboard = () => {
    const currentVal = activeQ.showScoreboardAfterQuestion !== false;
    const nextVal = !currentVal;
    handleUpdateActiveQuestion('showScoreboardAfterQuestion', nextVal);
    showNotification(
      nextVal
        ? `Scoreboard enabled after Question #${activeIdx + 1}`
        : `Scoreboard disabled after Question #${activeIdx + 1} (direct to next question)`
    );
  };

  // Add new question slide (inserted after currently selected slide, before the end screen)
  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'question',
      question: 'New Multiple-Choice Question',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctIndex: 0,
      points: 1,
      secretNote: '',
      timeLimit: 60,
      showScoreboardAfterQuestion: showScoreboardAfterQuestion
    };
    const endScreenIndex = questions.findIndex((q) => q.type === 'end');
    const maxInsertIndex = endScreenIndex !== -1 ? endScreenIndex : questions.length;
    const insertIndex = activeIdx >= 0 && activeIdx < maxInsertIndex ? activeIdx + 1 : maxInsertIndex;
    const updated = [...questions];
    updated.splice(insertIndex, 0, newQuestion);
    setQuestions(updated);
    setActiveIdx(insertIndex);
    showNotification(`New Question added after slide #${activeIdx + 1}!`);
  };

  // Add new free-input question slide (inserted after currently selected slide, before the end screen)
  const handleAddFreeInput = () => {
    const newFreeInput = {
      id: Date.now(),
      type: 'free_input',
      question: 'What is the superhero secret identity of Peter Parker?',
      correctAnswer: 'Spider-Man',
      acceptedAnswers: 'Spider-Man, Spiderman, Spyderman, Peter Parker',
      points: 1,
      secretNote: 'Spider-Man made his first appearance in Amazing Fantasy #15 in 1962.',
      timeLimit: 60,
      showScoreboardAfterQuestion: showScoreboardAfterQuestion
    };
    const endScreenIndex = questions.findIndex((q) => q.type === 'end');
    const maxInsertIndex = endScreenIndex !== -1 ? endScreenIndex : questions.length;
    const insertIndex = activeIdx >= 0 && activeIdx < maxInsertIndex ? activeIdx + 1 : maxInsertIndex;
    const updated = [...questions];
    updated.splice(insertIndex, 0, newFreeInput);
    setQuestions(updated);
    setActiveIdx(insertIndex);
    showNotification(`New Free-Input Question added after slide #${activeIdx + 1}!`);
  };

  // Add new closest-wins map question slide (inserted after currently selected slide, before the end screen)
  const handleAddClosestPin = () => {
    const defaultLandmark = LANDMARK_PRESETS[0];
    const newClosestPin = {
      id: Date.now(),
      type: 'closest_pin',
      question: 'Where in the world was this photo taken?',
      landmarkName: defaultLandmark.name,
      locationName: defaultLandmark.location,
      lat: defaultLandmark.lat,
      lng: defaultLandmark.lng,
      unit: 'km',
      imageUrl: defaultLandmark.imageUrl,
      points: 1,
      secretNote: defaultLandmark.hint,
      timeLimit: 60,
      showScoreboardAfterQuestion: showScoreboardAfterQuestion
    };
    const endScreenIndex = questions.findIndex((q) => q.type === 'end');
    const maxInsertIndex = endScreenIndex !== -1 ? endScreenIndex : questions.length;
    const insertIndex = activeIdx >= 0 && activeIdx < maxInsertIndex ? activeIdx + 1 : maxInsertIndex;
    const updated = [...questions];
    updated.splice(insertIndex, 0, newClosestPin);
    setQuestions(updated);
    setActiveIdx(insertIndex);
    showNotification(`New Closest-Wins Question added after slide #${activeIdx + 1}!`);
  };

  // Add new På Spåret train journey question slide
  const handleAddPaSparet = (preset = PA_SPARET_PRESETS[0]) => {
    const newPaSparet = {
      id: Date.now(),
      type: 'pa_sparet',
      question: 'Where are we heading? / Vart är vi på väg?',
      destination: preset.destination,
      acceptedAnswers: preset.acceptedAnswers,
      youtubeUrl: preset.youtubeUrl,
      videoStartTime: preset.videoStartTime !== undefined ? preset.videoStartTime : 20,
      duration: preset.duration || 90,
      clues: JSON.parse(JSON.stringify(preset.clues)),
      points: 10,
      secretNote: preset.secretNote,
      timeLimit: preset.duration || 90,
      showScoreboardAfterQuestion: showScoreboardAfterQuestion
    };
    const endScreenIndex = questions.findIndex((q) => q.type === 'end');
    const maxInsertIndex = endScreenIndex !== -1 ? endScreenIndex : questions.length;
    const insertIndex = activeIdx >= 0 && activeIdx < maxInsertIndex ? activeIdx + 1 : maxInsertIndex;
    const updated = [...questions];
    updated.splice(insertIndex, 0, newPaSparet);
    setQuestions(updated);
    setActiveIdx(insertIndex);
    showNotification(`New På Spåret Question added after slide #${activeIdx + 1}!`);
  };

  // Switch active slide question type (between Multiple Choice, Free Input, Closest Wins, and På Spåret)
  const handleSwitchQuestionType = (newType) => {
    if (!activeQ || activeQ.type === 'splash' || activeQ.type === 'end' || activeQ.type === newType) return;
    const updated = [...questions];
    if (newType === 'closest_pin') {
      const defaultLandmark = LANDMARK_PRESETS[0];
      updated[activeIdx] = {
        ...activeQ,
        type: 'closest_pin',
        question: activeQ.question && !activeQ.question.startsWith('New ') ? activeQ.question : 'Where in the world was this photo taken?',
        landmarkName: activeQ.landmarkName || defaultLandmark.name,
        locationName: activeQ.locationName || defaultLandmark.location,
        lat: activeQ.lat !== undefined ? Number(activeQ.lat) : defaultLandmark.lat,
        lng: activeQ.lng !== undefined ? Number(activeQ.lng) : defaultLandmark.lng,
        unit: activeQ.unit || 'km',
        imageUrl: activeQ.imageUrl || defaultLandmark.imageUrl,
        secretNote: activeQ.secretNote || defaultLandmark.hint
      };
      showNotification('Converted to Closest-Wins Geography Question (World Map pin)');
    } else if (newType === 'free_input') {
      const defaultCorrectText = activeQ.options?.[activeQ.correctIndex] || activeQ.destination || activeQ.landmarkName || '';
      updated[activeIdx] = {
        ...activeQ,
        type: 'free_input',
        correctAnswer: activeQ.correctAnswer || defaultCorrectText || 'Spider-Man',
        acceptedAnswers: activeQ.acceptedAnswers || ''
      };
      showNotification('Converted to Free-Input Question (players type their answer)');
    } else if (newType === 'pa_sparet') {
      const preset = PA_SPARET_PRESETS[0];
      updated[activeIdx] = {
        ...activeQ,
        type: 'pa_sparet',
        question: 'Where are we heading? / Vart är vi på väg?',
        destination: activeQ.destination || activeQ.correctAnswer || activeQ.landmarkName || preset.destination,
        acceptedAnswers: activeQ.acceptedAnswers || preset.acceptedAnswers,
        youtubeUrl: activeQ.youtubeUrl || preset.youtubeUrl,
        videoStartTime: activeQ.videoStartTime !== undefined ? Number(activeQ.videoStartTime) : preset.videoStartTime,
        duration: activeQ.duration || 90,
        clues: Array.isArray(activeQ.clues) && activeQ.clues.length === 5 ? activeQ.clues : JSON.parse(JSON.stringify(preset.clues)),
        points: 10,
        timeLimit: 90
      };
      showNotification('Converted to På Spåret progressive train clues (10-8-6-4-2 pts)');
    } else {
      updated[activeIdx] = {
        ...activeQ,
        type: 'question',
        options: activeQ.options && activeQ.options.length === 4
          ? activeQ.options
          : [activeQ.correctAnswer || activeQ.landmarkName || 'Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctIndex: activeQ.correctIndex !== undefined ? activeQ.correctIndex : 0
      };
      showNotification('Converted to 4-Choice Multiple Question');
    }
    setQuestions(updated);
  };

  // Add new splash screen slide (inserted after currently selected slide, before the end screen)
  const handleAddSplash = () => {
    const newSplash = {
      id: Date.now(),
      type: 'splash',
      title: 'Now the Music Round!',
      subtitle: 'Get ready for round two! Listen closely to the clues.',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
    };
    const endScreenIndex = questions.findIndex((q) => q.type === 'end');
    const maxInsertIndex = endScreenIndex !== -1 ? endScreenIndex : questions.length;
    const insertIndex = activeIdx >= 0 && activeIdx < maxInsertIndex ? activeIdx + 1 : maxInsertIndex;
    const updated = [...questions];
    updated.splice(insertIndex, 0, newSplash);
    setQuestions(updated);
    setActiveIdx(insertIndex);
    showNotification(`New Splash Screen added after slide #${activeIdx + 1}!`);
  };

  // Delete slide (end screen cannot be deleted)
  const handleDeleteItem = (indexToDelete) => {
    if (questions[indexToDelete]?.type === 'end') {
      showNotification('The Final Scoreboard & Podium end screen is permanent and non-removable.');
      return;
    }
    const nonEndQuestions = questions.filter((q) => q.type !== 'end');
    if (nonEndQuestions.length <= 1) {
      alert('A quiz must have at least one question or slide before the final podium screen.');
      return;
    }
    const updated = questions.filter((_, idx) => idx !== indexToDelete);
    setQuestions(updated);
    setActiveIdx(Math.max(0, indexToDelete - 1));
  };

  // Reorder slide: move up (-1) or down (+1) (end screen stays pinned at the bottom)
  const handleMoveItem = (index, direction) => {
    if (questions[index]?.type === 'end') {
      showNotification('The Final Scoreboard & Podium screen must always remain the final screen.');
      return;
    }
    const targetIndex = index + direction;
    const endScreenIndex = questions.findIndex((q) => q.type === 'end');
    const maxIndex = endScreenIndex !== -1 ? endScreenIndex - 1 : questions.length - 1;
    if (targetIndex < 0 || targetIndex > maxIndex) return;

    const updated = [...questions];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setQuestions(updated);
    if (activeIdx === index) {
      setActiveIdx(targetIndex);
    } else if (activeIdx === targetIndex) {
      setActiveIdx(index);
    }
  };

  // Update current item field
  const handleUpdateActiveQuestion = (field, value) => {
    const updated = [...questions];
    updated[activeIdx] = {
      ...updated[activeIdx],
      [field]: value
    };
    setQuestions(updated);
  };

  // Update option text
  const handleOptionChange = (optionIdx, text) => {
    const updated = [...questions];
    const newOptions = [...updated[activeIdx].options];
    newOptions[optionIdx] = text;
    updated[activeIdx].options = newOptions;
    setQuestions(updated);
  };

  // Upload local image file as Data URL
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is large (>5MB). For best performance, use images under 5MB.');
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result;
      handleUpdateActiveQuestion('imageUrl', dataUrl);
      showNotification('Image uploaded successfully!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Apply splash preset
  const handleApplyPreset = (preset) => {
    const updated = [...questions];
    updated[activeIdx] = {
      ...updated[activeIdx],
      badge: preset.badge || (preset.rules?.length ? 'Quiz Intro & Rules' : 'Round Announcement'),
      title: preset.title,
      subtitle: preset.subtitle,
      imageUrl: preset.imageUrl,
      rules: preset.rules ? JSON.parse(JSON.stringify(preset.rules)) : undefined
    };
    setQuestions(updated);
    showNotification(`Applied preset "${preset.name}"!`);
  };

  // Rules Explainer Helpers for Splash Slides
  const handleEnableRules = () => {
    const updated = [...questions];
    updated[activeIdx] = {
      ...updated[activeIdx],
      badge: updated[activeIdx].badge || 'Quiz Intro & Rules',
      rules: JSON.parse(JSON.stringify(DEFAULT_RULES_LIST))
    };
    setQuestions(updated);
    showNotification('Rules explainer cards enabled for this splash screen!');
  };

  const handleDisableRules = () => {
    const updated = [...questions];
    const item = { ...updated[activeIdx] };
    delete item.rules;
    updated[activeIdx] = item;
    setQuestions(updated);
    showNotification('Rules explainer cards removed.');
  };

  const handleUpdateRule = (ruleIndex, field, value) => {
    const updated = [...questions];
    const rules = Array.isArray(updated[activeIdx].rules) ? [...updated[activeIdx].rules] : [];
    if (!rules[ruleIndex]) return;
    rules[ruleIndex] = {
      ...rules[ruleIndex],
      [field]: value
    };
    updated[activeIdx] = {
      ...updated[activeIdx],
      rules
    };
    setQuestions(updated);
  };

  const handleAddRuleItem = () => {
    const updated = [...questions];
    const rules = Array.isArray(updated[activeIdx].rules) ? [...updated[activeIdx].rules] : [];
    if (rules.length >= 6) {
      showNotification('Maximum of 6 rule cards recommended for display layout.');
      return;
    }
    rules.push({
      icon: '💡',
      title: 'Bonus Rule',
      highlight: 'Tip',
      description: 'Write your custom rule explanation here!'
    });
    updated[activeIdx] = {
      ...updated[activeIdx],
      rules
    };
    setQuestions(updated);
  };

  const handleDeleteRuleItem = (ruleIndex) => {
    const updated = [...questions];
    const rules = Array.isArray(updated[activeIdx].rules) ? [...updated[activeIdx].rules] : [];
    rules.splice(ruleIndex, 1);
    updated[activeIdx] = {
      ...updated[activeIdx],
      rules: rules.length > 0 ? rules : undefined
    };
    setQuestions(updated);
  };

  const handleResetToDefaultRules = () => {
    const updated = [...questions];
    updated[activeIdx] = {
      ...updated[activeIdx],
      rules: JSON.parse(JSON.stringify(DEFAULT_RULES_LIST))
    };
    setQuestions(updated);
    showNotification('Reset to standard QuizPulse rules.');
  };

  // Export Quiz as JSON (including closest pin, free input, splash screens, points & scoreboard toggle)
  const handleExportJSON = () => {
    const exportData = {
      title: quizTitle,
      showScoreboardAfterQuestion: showScoreboardAfterQuestion,
      version: '1.4',
      exportedAt: new Date().toISOString(),
      questions: questions.map((q, idx) => {
        if (q.type === 'end') {
          return {
            id: q.id || 'final-end-screen',
            type: 'end',
            title: q.title || DEFAULT_END_SCREEN.title,
            subtitle: q.subtitle || DEFAULT_END_SCREEN.subtitle,
            showFullLeaderboard: q.showFullLeaderboard !== undefined ? Boolean(q.showFullLeaderboard) : true,
            enableConfetti: q.enableConfetti !== undefined ? Boolean(q.enableConfetti) : true,
            isPermanent: true
          };
        }

        if (q.type === 'splash') {
          return {
            id: q.id || idx + 1,
            type: 'splash',
            badge: q.badge || (q.rules?.length ? 'Quiz Intro & Rules' : 'Round Announcement'),
            title: q.title || 'Splash Announcement',
            subtitle: q.subtitle || '',
            imageUrl: q.imageUrl || '',
            rules: Array.isArray(q.rules) ? q.rules : undefined
          };
        }

        if (q.type === 'closest_pin') {
          return {
            id: q.id || idx + 1,
            type: 'closest_pin',
            question: q.question || 'Where in the world was this photo taken?',
            landmarkName: q.landmarkName || '',
            locationName: q.locationName || '',
            lat: q.lat !== undefined && !isNaN(Number(q.lat)) ? Number(q.lat) : 48.8584,
            lng: q.lng !== undefined && !isNaN(Number(q.lng)) ? Number(q.lng) : 2.2945,
            unit: q.unit === 'mi' || q.unit === 'miles' ? 'mi' : 'km',
            imageUrl: q.imageUrl || '',
            points: typeof q.points === 'number' && !isNaN(q.points)
              ? q.points
              : (q.points !== undefined && q.points !== '' && !isNaN(Number(q.points)) ? Number(q.points) : 1),
            secretNote: q.secretNote || '',
            timeLimit: q.timeLimit ? Number(q.timeLimit) : 60,
            showScoreboardAfterQuestion: q.showScoreboardAfterQuestion !== undefined
              ? Boolean(q.showScoreboardAfterQuestion)
              : Boolean(showScoreboardAfterQuestion)
          };
        }

        if (q.type === 'free_input') {
          return {
            id: q.id || idx + 1,
            type: 'free_input',
            question: q.question || `Question ${idx + 1}`,
            correctAnswer: q.correctAnswer || '',
            acceptedAnswers: q.acceptedAnswers || '',
            imageUrl: q.imageUrl || '',
            points: typeof q.points === 'number' && !isNaN(q.points)
              ? q.points
              : (q.points !== undefined && q.points !== '' && !isNaN(Number(q.points)) ? Number(q.points) : 1),
            secretNote: q.secretNote || '',
            timeLimit: q.timeLimit ? Number(q.timeLimit) : 60,
            showScoreboardAfterQuestion: q.showScoreboardAfterQuestion !== undefined
              ? Boolean(q.showScoreboardAfterQuestion)
              : Boolean(showScoreboardAfterQuestion)
          };
        }

        if (q.type === 'pa_sparet') {
          return {
            id: q.id || idx + 1,
            type: 'pa_sparet',
            question: q.question || 'Where are we heading? / Vart är vi på väg?',
            destination: q.destination || '',
            acceptedAnswers: q.acceptedAnswers || '',
            youtubeUrl: q.youtubeUrl || '',
            videoStartTime: q.videoStartTime !== undefined && !isNaN(Number(q.videoStartTime)) ? Number(q.videoStartTime) : 0,
            duration: q.duration ? Number(q.duration) : 90,
            clues: Array.isArray(q.clues) ? q.clues : [],
            imageUrl: q.imageUrl || '',
            points: 10,
            secretNote: q.secretNote || '',
            timeLimit: q.timeLimit ? Number(q.timeLimit) : 90,
            showScoreboardAfterQuestion: q.showScoreboardAfterQuestion !== undefined
              ? Boolean(q.showScoreboardAfterQuestion)
              : Boolean(showScoreboardAfterQuestion)
          };
        }

        return {
          id: q.id || idx + 1,
          type: 'question',
          question: q.question || `Question ${idx + 1}`,
          options: Array.isArray(q.options) && q.options.length >= 2 ? q.options.slice(0, 4) : ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < 4 ? q.correctIndex : 0,
          imageUrl: q.imageUrl || '',
          points: typeof q.points === 'number' && !isNaN(q.points)
            ? q.points
            : (q.points !== undefined && q.points !== '' && !isNaN(Number(q.points)) ? Number(q.points) : 1),
          secretNote: q.secretNote || '',
          timeLimit: q.timeLimit ? Number(q.timeLimit) : 60,
          showScoreboardAfterQuestion: q.showScoreboardAfterQuestion !== undefined
            ? Boolean(q.showScoreboardAfterQuestion)
            : Boolean(showScoreboardAfterQuestion)
        };
      })
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `${quizTitle.toLowerCase().replace(/[^a-z0-9]/gi, '_') || 'quiz'}.json`;

    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showNotification(`Exported as "${filename}"!`);
  };

  // Import Quiz from JSON (with closest pin, free input, splash screens, points & scoreboard toggle compatibility)
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);

        let loadedQuestions = [];
        if (Array.isArray(parsed)) {
          loadedQuestions = parsed;
        } else if (parsed && Array.isArray(parsed.questions)) {
          loadedQuestions = parsed.questions;
          if (parsed.title) setQuizTitle(parsed.title);
          if (parsed.showScoreboardAfterQuestion !== undefined) {
            setShowScoreboardAfterQuestion(Boolean(parsed.showScoreboardAfterQuestion));
          }
        } else {
          alert('Invalid quiz JSON format: expected an array of questions or an object with a "questions" array.');
          return;
        }

        const defaultScoreboardVal = parsed.showScoreboardAfterQuestion !== undefined
          ? Boolean(parsed.showScoreboardAfterQuestion)
          : showScoreboardAfterQuestion;

        const validated = loadedQuestions.map((q, idx) => {
          if (q.type === 'end') {
            return {
              ...DEFAULT_END_SCREEN,
              ...q,
              id: q.id || 'final-end-screen',
              type: 'end',
              title: q.title || DEFAULT_END_SCREEN.title,
              subtitle: q.subtitle || DEFAULT_END_SCREEN.subtitle,
              showFullLeaderboard: q.showFullLeaderboard !== undefined ? Boolean(q.showFullLeaderboard) : true,
              enableConfetti: q.enableConfetti !== undefined ? Boolean(q.enableConfetti) : true,
              isPermanent: true
            };
          }

          if (q.type === 'splash') {
            return {
              ...q,
              id: q.id || idx + 1,
              type: 'splash',
              badge: q.badge || (q.rules?.length ? 'Quiz Intro & Rules' : 'Round Announcement'),
              title: q.title || 'Splash Announcement',
              subtitle: q.subtitle || '',
              imageUrl: q.imageUrl || '',
              rules: Array.isArray(q.rules) ? q.rules : undefined
            };
          }

          if (q.type === 'closest_pin') {
            return {
              ...q,
              id: q.id || idx + 1,
              type: 'closest_pin',
              question: q.question || 'Where in the world was this photo taken?',
              landmarkName: q.landmarkName || 'Mystery Landmark',
              locationName: q.locationName || '',
              lat: q.lat !== undefined && !isNaN(Number(q.lat)) ? Number(q.lat) : 48.8584,
              lng: q.lng !== undefined && !isNaN(Number(q.lng)) ? Number(q.lng) : 2.2945,
              unit: q.unit === 'mi' || q.unit === 'miles' ? 'mi' : 'km',
              imageUrl: q.imageUrl || '',
              points: typeof q.points === 'number' && !isNaN(q.points)
                ? Math.max(0, Math.min(100000, q.points))
                : (q.points !== undefined && q.points !== '' && !isNaN(Number(q.points)) ? Number(q.points) : 1),
              secretNote: q.secretNote || '',
              timeLimit: q.timeLimit ? Number(q.timeLimit) : 60,
              showScoreboardAfterQuestion: q.showScoreboardAfterQuestion !== undefined
                ? Boolean(q.showScoreboardAfterQuestion)
                : defaultScoreboardVal
            };
          }

          if (q.type === 'free_input') {
            return {
              ...q,
              id: q.id || idx + 1,
              type: 'free_input',
              question: q.question || `Question ${idx + 1}`,
              correctAnswer: q.correctAnswer || 'Spider-Man',
              acceptedAnswers: q.acceptedAnswers || '',
              imageUrl: q.imageUrl || '',
              points: typeof q.points === 'number' && !isNaN(q.points)
                ? Math.max(0, Math.min(100000, q.points))
                : (q.points !== undefined && q.points !== '' && !isNaN(Number(q.points)) ? Number(q.points) : 1),
              secretNote: q.secretNote || '',
              timeLimit: q.timeLimit ? Number(q.timeLimit) : 60,
              showScoreboardAfterQuestion: q.showScoreboardAfterQuestion !== undefined
                ? Boolean(q.showScoreboardAfterQuestion)
                : defaultScoreboardVal
            };
          }

          if (q.type === 'pa_sparet') {
            const fallbackPreset = PA_SPARET_PRESETS[0];
            return {
              ...q,
              id: q.id || idx + 1,
              type: 'pa_sparet',
              question: q.question || 'Where are we heading? / Vart är vi på väg?',
              destination: q.destination || q.correctAnswer || fallbackPreset.destination,
              acceptedAnswers: q.acceptedAnswers || fallbackPreset.acceptedAnswers,
              youtubeUrl: q.youtubeUrl || fallbackPreset.youtubeUrl,
              videoStartTime: q.videoStartTime !== undefined && !isNaN(Number(q.videoStartTime)) ? Number(q.videoStartTime) : fallbackPreset.videoStartTime,
              duration: q.duration && !isNaN(Number(q.duration)) ? Number(q.duration) : 90,
              clues: Array.isArray(q.clues) && q.clues.length === 5 ? q.clues : fallbackPreset.clues,
              imageUrl: q.imageUrl || '',
              points: 10,
              secretNote: q.secretNote || '',
              timeLimit: q.timeLimit ? Number(q.timeLimit) : 90,
              showScoreboardAfterQuestion: q.showScoreboardAfterQuestion !== undefined
                ? Boolean(q.showScoreboardAfterQuestion)
                : defaultScoreboardVal
            };
          }

          return {
            ...q,
            id: q.id || idx + 1,
            type: 'question',
            question: q.question || `Question ${idx + 1}`,
            imageUrl: q.imageUrl || '',
            options: Array.isArray(q.options) && q.options.length >= 2 ? q.options.slice(0, 4) : ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < 4 ? q.correctIndex : 0,
            points: typeof q.points === 'number' && !isNaN(q.points)
              ? Math.max(0, Math.min(100000, q.points))
              : (q.points !== undefined && q.points !== '' && !isNaN(Number(q.points)) ? Number(q.points) : 1),
            secretNote: q.secretNote || '',
            timeLimit: q.timeLimit ? Number(q.timeLimit) : 60,
            showScoreboardAfterQuestion: q.showScoreboardAfterQuestion !== undefined
              ? Boolean(q.showScoreboardAfterQuestion)
              : defaultScoreboardVal
          };
        });

        // Ensure the non-removable end screen is always placed at the end
        const nonEndSlides = validated.filter((q) => q.type !== 'end');
        const existingEnd = validated.find((q) => q.type === 'end') || DEFAULT_END_SCREEN;
        const finalSlides = [...nonEndSlides, existingEnd];

        setQuestions(finalSlides);
        setActiveIdx(0);
        showNotification(`Successfully loaded ${finalSlides.length} slides from JSON!`);
      } catch (err) {
        console.error('Failed to parse quiz JSON:', err);
        alert('Could not parse JSON file. Please ensure it is valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Save to live game
  const handleSaveToGame = () => {
    if (onSaveQuiz) {
      onSaveQuiz(questions, quizTitle, showScoreboardAfterQuestion);
    }
    showNotification('Quiz and settings applied to live room!');
    if (onClose) {
      onClose();
    }
  };

  const questionCount = questions.filter(q => q.type !== 'splash' && q.type !== 'end').length;
  const freeInputCount = questions.filter(q => q.type === 'free_input').length;
  const splashCount = questions.filter(q => q.type === 'splash').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col font-sans text-white">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="text-lg sm:text-xl font-black bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-1.5 outline-none text-white min-w-[200px]"
            placeholder="Quiz Title..."
          />
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/80 text-purple-300 font-bold">
              {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
            </span>
            {freeInputCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 font-bold flex items-center gap-1">
                <KeyboardIcon className="w-3 h-3" />
                {freeInputCount} Free-Text
              </span>
            )}
            {splashCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/80 text-amber-300 font-bold flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {splashCount} {splashCount === 1 ? 'Splash Screen' : 'Splash Screens'}
              </span>
            )}
          </div>

          {/* Show scoreboard after question toggle (Global Quiz Setting) */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
            <TrophyIcon className={`w-3.5 h-3.5 ${showScoreboardAfterQuestion ? 'text-amber-400' : 'text-slate-500'}`} />
            <button
              type="button"
              onClick={handleToggleGlobalScoreboard}
              className="text-xs text-slate-300 font-semibold cursor-pointer select-none hidden md:inline hover:text-white"
            >
              Show scoreboard after question:
            </button>
            <button
              type="button"
              onClick={handleToggleGlobalScoreboard}
              className="text-xs text-slate-300 font-semibold cursor-pointer select-none md:hidden hover:text-white"
            >
              Scoreboard:
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={showScoreboardAfterQuestion}
              onClick={handleToggleGlobalScoreboard}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                showScoreboardAfterQuestion ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  showScoreboardAfterQuestion ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-[11px] font-bold ${showScoreboardAfterQuestion ? 'text-amber-300' : 'text-slate-400'}`}>
              {showScoreboardAfterQuestion ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Action Buttons: Import, Export, Apply, Close */}
        <div className="flex items-center gap-2">
          {/* Hidden File Input for JSON Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-all"
            title="Import quiz from a JSON file"
          >
            <UploadIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Import JSON</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-all"
            title="Export quiz as a JSON file"
          >
            <DownloadIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer transition-all"
            title="Save and create a 1-click link for a friend to host this quiz"
          >
            <ShareIcon className="w-3.5 h-3.5 text-indigo-200" />
            <span>Share Host Link</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToGame}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 cursor-pointer transition-all"
          >
            <CheckIcon className="w-3.5 h-3.5" />
            <span>Apply to Live Room</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer ml-1"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-2 rounded-xl text-xs font-bold shadow-xl animate-in fade-in duration-200">
          {notification}
        </div>
      )}

      {/* Main Workspace: Left Questions List + Right Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Questions & Splash Screens Sequence */}
        <aside className="w-64 sm:w-72 bg-slate-900/70 border-r border-slate-800 flex flex-col justify-between overflow-y-auto p-4 shrink-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sequence</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-2 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-[10px] font-bold cursor-pointer transition-all"
                  title="Add Multiple-Choice Question"
                >
                  + Choice
                </button>
                <button
                  type="button"
                  onClick={handleAddFreeInput}
                  className="px-2 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-0.5"
                  title="Add Free Text Input Question"
                >
                  <KeyboardIcon className="w-2.5 h-2.5" />
                  + Text
                </button>
                <button
                  type="button"
                  onClick={handleAddClosestPin}
                  className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-0.5"
                  title="Add Closest-Wins World Map Question"
                >
                  <MapPinIcon className="w-2.5 h-2.5" />
                  + Pin
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPaSparet()}
                  className="px-2 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-0.5"
                  title="Add På Spåret Train Journey Question"
                >
                  <TrainIcon className="w-2.5 h-2.5" />
                  + Spåret
                </button>
                <button
                  type="button"
                  onClick={handleAddSplash}
                  className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 text-[10px] font-bold cursor-pointer transition-all"
                  title="Add Splash Screen between questions"
                >
                  + Splash
                </button>
              </div>
            </div>

            {/* List of items */}
            <div className="space-y-2 pt-1">
              {questions.map((item, idx) => {
                const isSplash = item.type === 'splash';
                const isFreeInput = item.type === 'free_input';
                const isClosestPin = item.type === 'closest_pin';
                const isPaSparet = item.type === 'pa_sparet';
                const isEnd = item.type === 'end';
                const isSelected = activeIdx === idx;

                return (
                  <div
                    key={item.id || idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all border ${
                      isSelected
                        ? isEnd
                          ? 'bg-gradient-to-r from-amber-950/80 via-yellow-950/80 to-purple-950/80 border-amber-400 text-amber-200 font-bold shadow-lg shadow-amber-500/20'
                          : isSplash
                          ? 'bg-amber-950/70 border-amber-500 text-amber-100 shadow-lg shadow-amber-500/20'
                          : isClosestPin
                          ? 'bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border-emerald-400 text-white font-bold shadow-md shadow-emerald-600/25'
                          : isFreeInput
                          ? 'bg-gradient-to-r from-cyan-900/80 to-purple-900/80 border-cyan-400 text-white font-bold shadow-md shadow-cyan-600/25'
                          : isPaSparet
                          ? 'bg-gradient-to-r from-amber-900/80 to-yellow-900/80 border-amber-400 text-white font-bold shadow-md shadow-amber-600/25'
                          : 'bg-purple-600 border-purple-400 text-white font-bold shadow-md shadow-purple-600/25'
                        : isEnd
                        ? 'bg-amber-950/20 border-amber-800/40 text-amber-200 hover:border-amber-700/60'
                        : isSplash
                        ? 'bg-amber-950/20 border-amber-800/40 text-amber-200 hover:border-amber-700/60'
                        : isClosestPin
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200 hover:border-emerald-700/60'
                        : isFreeInput
                        ? 'bg-cyan-950/20 border-cyan-800/40 text-cyan-200 hover:border-cyan-700/60'
                        : isPaSparet
                        ? 'bg-amber-950/20 border-amber-800/40 text-amber-200 hover:border-amber-700/60'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate flex-1 pr-2 flex items-center gap-1.5">
                      {isEnd ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                            <TrophyIcon className="w-2.5 h-2.5" /> FINALE
                          </span>
                        </div>
                      ) : isSplash ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                            SPLASH
                          </span>
                        </div>
                      ) : isClosestPin ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`font-mono font-bold ${isSelected ? 'text-emerald-200' : 'text-emerald-400'}`}>
                            {idx + 1}.
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-black text-[8px] uppercase tracking-wider flex items-center gap-0.5">
                            <MapPinIcon className="w-2.5 h-2.5" /> PIN
                          </span>
                        </div>
                      ) : isFreeInput ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`font-mono font-bold ${isSelected ? 'text-cyan-200' : 'text-cyan-400'}`}>
                            {idx + 1}.
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 font-black text-[8px] uppercase tracking-wider flex items-center gap-0.5">
                            <KeyboardIcon className="w-2.5 h-2.5" /> TEXT
                          </span>
                        </div>
                      ) : isPaSparet ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`font-mono font-bold ${isSelected ? 'text-amber-200' : 'text-amber-400'}`}>
                            {idx + 1}.
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/30 border border-amber-400/40 text-amber-200 font-black text-[8px] uppercase tracking-wider flex items-center gap-0.5">
                            <TrainIcon className="w-2.5 h-2.5" /> SPÅRET
                          </span>
                        </div>
                      ) : (
                        <span className={`font-mono font-bold shrink-0 ${isSelected ? 'text-purple-200' : 'text-purple-400'}`}>
                          {idx + 1}.
                        </span>
                      )}

                      <span className="truncate font-semibold">
                        {isEnd ? (item.title || "Final Scoreboard & Podium") : isSplash ? (item.title || 'Now the Music Round!') : isClosestPin ? (item.landmarkName ? `${item.landmarkName} (${item.locationName || 'Map'})` : item.question || 'Closest Wins') : isPaSparet ? (item.destination ? `På Spåret: ${item.destination}` : 'På Spåret') : (item.question || 'Untitled Question')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isEnd ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900/90 border border-amber-600/50 text-amber-300 font-bold" title="Non-removable default end screen">
                          Permanent
                        </span>
                      ) : (
                        <>
                          {!isSplash && (
                            <>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 text-amber-300">
                                {isPaSparet ? '10 pts' : `${item.points !== undefined && item.points !== '' ? item.points : 1} ${Number(item.points ?? 1) === 1 ? 'pt' : 'pts'}`}
                              </span>
                              {item.showScoreboardAfterQuestion === false && (
                                <span
                                  title="Scoreboard off: Ending goes directly to next question"
                                  className="text-[9px] px-1 py-0.5 rounded bg-slate-900/90 border border-purple-800 text-purple-300 font-bold"
                                >
                                  direct
                                </span>
                              )}
                            </>
                          )}

                          {/* Reorder Up/Down buttons */}
                          <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveItem(idx, -1);
                              }}
                              className={`p-0.5 rounded hover:bg-slate-800 ${idx === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white cursor-pointer'}`}
                              title="Move Up"
                            >
                              <ChevronUpIcon />
                            </button>
                            <button
                              type="button"
                              disabled={idx >= questions.length - 2}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveItem(idx, 1);
                              }}
                              className={`p-0.5 rounded hover:bg-slate-800 ${idx >= questions.length - 2 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white cursor-pointer'}`}
                              title="Move Down"
                            >
                              <ChevronDownIcon />
                            </button>
                          </div>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(idx);
                            }}
                            className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-1 cursor-pointer transition-opacity text-slate-400"
                            title="Delete Slide"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Add Buttons */}
          <div className="grid grid-cols-2 gap-1.5 mt-4 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="py-2 px-1.5 rounded-xl border border-dashed border-purple-500/50 hover:bg-purple-950/30 text-purple-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              title={`Insert Choice Question after slide #${activeIdx + 1}`}
            >
              <PlusIcon className="w-3 h-3" />
              <span>+ Choice</span>
            </button>

            <button
              type="button"
              onClick={handleAddFreeInput}
              className="py-2 px-1.5 rounded-xl border border-dashed border-cyan-500/50 hover:bg-cyan-950/30 text-cyan-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              title={`Insert Free Text Question after slide #${activeIdx + 1}`}
            >
              <KeyboardIcon className="w-3 h-3" />
              <span>+ Text</span>
            </button>

            <button
              type="button"
              onClick={handleAddClosestPin}
              className="py-2 px-1.5 rounded-xl border border-dashed border-emerald-500/50 hover:bg-emerald-950/30 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              title={`Insert Closest-Wins Map Question after slide #${activeIdx + 1}`}
            >
              <MapPinIcon className="w-3 h-3" />
              <span>+ Map Pin</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddPaSparet()}
              className="py-2 px-1.5 rounded-xl border border-dashed border-amber-500/50 hover:bg-amber-950/30 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              title={`Insert På Spåret Train Journey Question after slide #${activeIdx + 1}`}
            >
              <TrainIcon className="w-3 h-3" />
              <span>+ Spåret</span>
            </button>

            <button
              type="button"
              onClick={handleAddSplash}
              className="py-2 px-1.5 rounded-xl border border-dashed border-amber-500/50 hover:bg-amber-950/30 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              title={`Insert Splash Screen after slide #${activeIdx + 1}`}
            >
              <ImageIcon className="w-3 h-3" />
              <span>+ Splash</span>
            </button>
          </div>
        </aside>

        {/* Right Editor Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full space-y-6">
          
          {/* ======================================================== */}
          {/* END-SCREEN / FINAL PODIUM & SCOREBOARD EDITOR */}
          {/* ======================================================== */}
          {activeQ.type === 'end' ? (
            <div className="space-y-6">
              {/* Header card */}
              <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-purple-950/40 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20">
                      <TrophyIcon className="w-4 h-4" /> Final Screen
                    </span>
                    <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
                      Winner Podium & Final Scoreboard
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                    <span>🔒 Default & Non-Removable Screen</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                  <SparklesIcon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    This screen automatically concludes the quiz. When reached, it triggers the Olympic-style 1st, 2nd, and 3rd place winners' podium with celebratory confetti on big screen displays, and delivers personalized victory cards to each player's device.
                  </span>
                </div>

                {/* Podium Title Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Podium Screen Title
                  </label>
                  <input
                    type="text"
                    value={activeQ.title || ''}
                    onChange={(e) => handleUpdateActiveQuestion('title', e.target.value)}
                    placeholder="Final Scoreboard & Winners' Podium"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-black text-amber-200 outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {/* Subtitle / Host Closing Remarks */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Host Closing Remarks / Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={activeQ.subtitle || ''}
                    onChange={(e) => handleUpdateActiveQuestion('subtitle', e.target.value)}
                    placeholder="Congratulations to our champions and thank you for playing!"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-amber-400 transition-colors resize-none"
                  />
                </div>

                {/* Screen Features & Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-xs font-bold text-slate-200 block">Show Complete Rankings</span>
                      <span className="text-[11px] text-slate-400 block">Display all competitors (#4+) below the podium</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdateActiveQuestion('showFullLeaderboard', activeQ.showFullLeaderboard === false)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        activeQ.showFullLeaderboard !== false ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          activeQ.showFullLeaderboard !== false ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-xs font-bold text-slate-200 block">Victory Confetti</span>
                      <span className="text-[11px] text-slate-400 block">Shower celebratory confetti across screen</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdateActiveQuestion('enableConfetti', activeQ.enableConfetti === false)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        activeQ.enableConfetti !== false ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          activeQ.enableConfetti !== false ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Interactive Podium Preview Stage */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <AwardIcon className="w-4 h-4 text-amber-400" />
                    Live Podium Visual Preview
                  </span>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    (Olympic 3D Stage)
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Podium pedestals */}
                  <div className="flex items-end justify-center gap-3 sm:gap-6 w-full max-w-md pt-8 pb-4 relative z-10">
                    {/* 2nd Place Silver */}
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-2xl mb-1">🥈</span>
                      <span className="text-xs font-bold text-slate-200">2nd Place</span>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold mb-1">Silver Medal</span>
                      <div className="w-full h-24 sm:h-28 rounded-t-xl bg-gradient-to-t from-slate-800 to-slate-700 border-t-2 border-slate-400 flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-black text-slate-400">2</span>
                      </div>
                    </div>

                    {/* 1st Place Gold */}
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-3xl mb-1 animate-bounce">👑</span>
                      <span className="text-sm font-black text-amber-300">1st Champion</span>
                      <span className="text-xs font-mono text-amber-400 font-bold mb-1">Gold Trophy</span>
                      <div className="w-full h-32 sm:h-40 rounded-t-xl bg-gradient-to-t from-amber-700 via-amber-600 to-yellow-500 border-t-4 border-yellow-300 flex items-center justify-center shadow-2xl shadow-amber-500/30">
                        <span className="text-4xl font-black text-slate-950">1</span>
                      </div>
                    </div>

                    {/* 3rd Place Bronze */}
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-2xl mb-1">🥉</span>
                      <span className="text-xs font-bold text-amber-200">3rd Place</span>
                      <span className="text-[10px] font-mono text-amber-300/80 font-semibold mb-1">Bronze Medal</span>
                      <div className="w-full h-18 sm:h-20 rounded-t-xl bg-gradient-to-t from-amber-900 to-amber-800 border-t-2 border-amber-600 flex items-center justify-center shadow-md">
                        <span className="text-2xl font-black text-amber-600">3</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 font-medium pt-2">
                    Automatically ranks real scores, correct answer counts, and player times
                  </span>
                </div>
              </div>
            </div>
          ) : activeQ.type === 'splash' ? (
            <div className="space-y-6">
              {/* Header card */}
              <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-mono font-black text-xs uppercase tracking-wider">
                      Splash Screen #{activeIdx + 1}
                    </span>
                    <span className="text-xs text-amber-400 font-semibold">
                      Intermission / Round Announcement
                    </span>
                  </div>

                  <span className="text-xs text-slate-400">
                    Shown on the live big screen & player phones between question rounds
                  </span>
                </div>

                {/* Badge / Pill */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Badge / Category Pill
                  </label>
                  <input
                    type="text"
                    value={activeQ.badge || ''}
                    onChange={(e) => handleUpdateActiveQuestion('badge', e.target.value)}
                    placeholder="e.g. Quiz Intro & Rules or Round Announcement"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-sm outline-none transition-all"
                  />
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Splash Title / Announcement Banner
                  </label>
                  <input
                    type="text"
                    value={activeQ.title || ''}
                    onChange={(e) => handleUpdateActiveQuestion('title', e.target.value)}
                    placeholder="e.g. Now the Music Round! or Welcome to QuizPulse Live!"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-lg sm:text-xl font-bold outline-none transition-all"
                  />
                </div>

                {/* Subtitle / Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Subtitle / Instructions for Players
                  </label>
                  <input
                    type="text"
                    value={activeQ.subtitle || ''}
                    onChange={(e) => handleUpdateActiveQuestion('subtitle', e.target.value)}
                    placeholder="e.g. Listen carefully to each track. Answer fast for maximum points!"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-sm outline-none transition-all"
                  />
                </div>

                {/* Image Section: Upload file or URL */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-400" />
                      Splash Image (Upload from device or provide web URL)
                    </label>

                    {/* Image Mode Tabs */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setImageTab('upload')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${imageTab === 'upload' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                      >
                        Upload Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageTab('url')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${imageTab === 'url' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                      >
                        Image URL
                      </button>
                    </div>
                  </div>

                  {/* Hidden file input for upload */}
                  <input
                    type="file"
                    ref={imageUploadRef}
                    onChange={handleImageFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {imageTab === 'upload' ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="button"
                        onClick={() => imageUploadRef.current?.click()}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                      >
                        <UploadIcon className="w-4 h-4" />
                        <span>Choose Image File to Upload</span>
                      </button>
                      <span className="text-xs text-slate-500">
                        PNG, JPG, WEBP, GIF, SVG (embedded directly into quiz)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={activeQ.imageUrl || ''}
                        onChange={(e) => handleUpdateActiveQuestion('imageUrl', e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs outline-none font-mono"
                      />
                    </div>
                  )}

                  {/* Quick Preset Theme Pills */}
                  <div className="pt-2">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-2">
                      Or select a quick round preset:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {splashPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-xs font-semibold text-slate-300 hover:text-amber-300 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rules Explainer Cards Section */}
              <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📜</span>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                      Quiz Rules & Scoring Explainer
                    </span>
                    {Array.isArray(activeQ.rules) && activeQ.rules.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-300 font-bold">
                        {activeQ.rules.length} Rules Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {Array.isArray(activeQ.rules) && activeQ.rules.length > 0 ? (
                      <>
                        <button
                          type="button"
                          onClick={handleResetToDefaultRules}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white font-semibold transition-all cursor-pointer"
                        >
                          Reset to Standard Rules
                        </button>
                        <button
                          type="button"
                          onClick={handleDisableRules}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs text-rose-300 font-semibold transition-all cursor-pointer"
                        >
                          Remove Rules
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEnableRules}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                      >
                        <span>+ Enable Rules Explainer Cards</span>
                      </button>
                    )}
                  </div>
                </div>

                {Array.isArray(activeQ.rules) && activeQ.rules.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                      These rule cards are displayed prominently on the live TV display and on player mobile devices during this intro screen.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {activeQ.rules.map((rule, rIdx) => {
                        const isTieBreak = rule.highlight === 'Tie-Breaker Only' || rule.title?.toLowerCase().includes('speed');
                        return (
                          <div
                            key={rIdx}
                            className={`p-4 rounded-2xl border space-y-3 relative ${
                              isTieBreak
                                ? 'bg-amber-950/20 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                                : 'bg-slate-950/70 border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={rule.icon || ''}
                                  onChange={(e) => handleUpdateRule(rIdx, 'icon', e.target.value)}
                                  placeholder="🎯"
                                  className="w-10 text-center py-1 rounded-lg bg-slate-900 border border-slate-700 text-base"
                                  title="Emoji icon"
                                />
                                <input
                                  type="text"
                                  value={rule.title || ''}
                                  onChange={(e) => handleUpdateRule(rIdx, 'title', e.target.value)}
                                  placeholder="Rule Title"
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-xs"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteRuleItem(rIdx)}
                                className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Delete this rule"
                              >
                                <XIcon className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Pill Tag / Highlight</span>
                                {isTieBreak && (
                                  <span className="text-[10px] text-amber-400 font-mono font-semibold">Speed Tie-Breaker</span>
                                )}
                              </div>
                              <input
                                type="text"
                                value={rule.highlight || ''}
                                onChange={(e) => handleUpdateRule(rIdx, 'highlight', e.target.value)}
                                placeholder="e.g. Tie-Breaker Only, Earn Points, Video Clue"
                                className="w-full px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono"
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Description / Explainer</span>
                              <textarea
                                value={rule.description || ''}
                                onChange={(e) => handleUpdateRule(rIdx, 'description', e.target.value)}
                                placeholder="Explanation text shown to players..."
                                rows={2}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs resize-none"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {activeQ.rules.length < 6 && (
                      <button
                        type="button"
                        onClick={handleAddRuleItem}
                        className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-xs text-amber-300 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>+ Add Another Rule Card</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2">
                    <p className="text-xs text-slate-400">
                      Want to explain how your quiz works at the beginning?
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Enable rules cards to explain that speed acts as the tie-breaker, how points work, and game formats.
                    </p>
                  </div>
                )}
              </div>

              {/* Big Screen Live Preview Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-amber-400" />
                    Audience Display Preview (How this splash screen will look live)
                  </span>

                  {activeQ.imageUrl && (
                    <button
                      type="button"
                      onClick={() => handleUpdateActiveQuestion('imageUrl', '')}
                      className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer font-semibold"
                    >
                      Remove Image
                    </button>
                  )}
                </div>

                {/* Simulated live screen presentation */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950 border border-slate-800 p-6 sm:p-10 text-center min-h-[300px] flex flex-col justify-center items-center shadow-2xl">
                  <div className="mb-3">
                    <span className="px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                      {activeQ.badge || (activeQ.rules?.length ? 'Quiz Intro & Rules' : 'Round Announcement')}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-200 to-purple-200 tracking-tight leading-tight max-w-2xl mb-2">
                    {activeQ.title || 'Welcome to QuizPulse Live!'}
                  </h3>

                  {activeQ.subtitle && (
                    <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mb-5 leading-relaxed">
                      {activeQ.subtitle}
                    </p>
                  )}

                  {/* Rules grid in preview */}
                  {Array.isArray(activeQ.rules) && activeQ.rules.length > 0 ? (
                    <div className="w-full max-w-3xl space-y-4 my-2 text-left">
                      {activeQ.imageUrl && (
                        <div className="relative max-w-sm w-full mx-auto rounded-2xl overflow-hidden border border-purple-500/30 shadow-lg bg-slate-950 mb-3">
                          <img
                            src={activeQ.imageUrl}
                            alt="Splash banner"
                            className="w-full h-36 object-cover object-center"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeQ.rules.map((rule, idx) => {
                          const isTieBreak = rule.highlight === 'Tie-Breaker Only' || rule.title?.toLowerCase().includes('speed');
                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl border text-xs ${
                                isTieBreak
                                  ? 'bg-amber-950/30 border-amber-500/50 text-amber-100 shadow'
                                  : 'bg-slate-950/80 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-base">{rule.icon}</span>
                                <span className={`font-bold ${isTieBreak ? 'text-amber-300' : 'text-white'}`}>
                                  {rule.title}
                                </span>
                                {rule.highlight && (
                                  <span className="ml-auto text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    {rule.highlight}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 pl-6 line-clamp-2">
                                {rule.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : activeQ.imageUrl ? (
                    <div className="relative max-w-md w-full mx-auto rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-900/40 bg-slate-950">
                      <img
                        src={activeQ.imageUrl}
                        alt="Splash screen illustration"
                        className="w-full h-56 sm:h-64 object-cover object-center"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs max-w-md w-full">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <span>No image set yet. Text banner will display on a starry ambient backdrop.</span>
                    </div>
                  )}

                  <div className="mt-6 text-xs text-purple-400 font-medium">
                    {activeQ.rules?.length ? 'Quiz Master will begin Question 1 shortly...' : 'Quiz master will start next question shortly...'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* QUESTION SLIDE EDITOR */
            /* ======================================================== */
            <div className="space-y-6">
              {/* Question Text, Type Switcher, Points & Time Limit Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold uppercase text-purple-400">
                      Question #{activeIdx + 1}
                    </span>

                    {/* Question Type Toggle Pill */}
                    <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => handleSwitchQuestionType('question')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          activeQ.type === 'question'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>▲ Multiple Choice</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchQuestionType('free_input')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          activeQ.type === 'free_input'
                            ? 'bg-cyan-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <KeyboardIcon className="w-3.5 h-3.5" />
                        <span>Free-Text Input</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchQuestionType('closest_pin')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          activeQ.type === 'closest_pin'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <MapPinIcon className="w-3.5 h-3.5" />
                        <span>Closest Wins (Pin)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchQuestionType('pa_sparet')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          activeQ.type === 'pa_sparet'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <TrainIcon className="w-3.5 h-3.5" />
                        <span>På Spåret</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-4">
                    {/* Score / Points Numerical Input */}
                    <div className="flex items-center gap-2">
                      <AwardIcon className="w-4 h-4 text-amber-400" />
                      <label htmlFor="question-points-input" className="text-xs text-slate-300 font-semibold">Points:</label>
                      {activeQ.type === 'pa_sparet' ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
                          10 → 8 → 6 → 4 → 2 pts
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <input
                            id="question-points-input"
                            type="number"
                            min={0}
                            max={100000}
                            step={1}
                            value={activeQ.points !== undefined ? activeQ.points : 1}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === '') {
                                handleUpdateActiveQuestion('points', '');
                              } else {
                                const num = Math.min(100000, Math.max(0, parseInt(raw, 10) || 0));
                                handleUpdateActiveQuestion('points', num);
                              }
                            }}
                            onBlur={() => {
                              if (activeQ.points === '' || activeQ.points === undefined || isNaN(Number(activeQ.points))) {
                                handleUpdateActiveQuestion('points', 1);
                              }
                            }}
                            className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-400 outline-none focus:border-purple-500 font-mono text-center"
                            placeholder="1"
                          />
                          <span className="text-xs text-slate-400 font-semibold font-mono">
                            {Number(activeQ.points ?? 1) === 1 ? 'pt' : 'pts'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Time limit picker */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-400 font-semibold">Time limit:</label>
                      <select
                        value={activeQ.timeLimit || (activeQ.type === 'pa_sparet' ? 90 : 60)}
                        onChange={(e) => handleUpdateActiveQuestion('timeLimit', Number(e.target.value))}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-white outline-none focus:border-purple-500 cursor-pointer"
                      >
                        <option value={15}>15 seconds</option>
                        <option value={30}>30 seconds</option>
                        <option value={60}>60 seconds</option>
                        <option value={90}>90 seconds</option>
                        <option value={120}>120 seconds</option>
                      </select>
                    </div>

                    {/* Show scoreboard after question toggle */}
                    <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                      <TrophyIcon className={`w-3.5 h-3.5 ${activeQ.showScoreboardAfterQuestion !== false ? 'text-amber-400' : 'text-slate-500'}`} />
                      <button
                        type="button"
                        onClick={handleToggleQuestionScoreboard}
                        className="text-xs text-slate-300 font-semibold cursor-pointer select-none hover:text-white"
                      >
                        Show scoreboard after question:
                      </button>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={activeQ.showScoreboardAfterQuestion !== false}
                        onClick={handleToggleQuestionScoreboard}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          activeQ.showScoreboardAfterQuestion !== false ? 'bg-amber-500' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            activeQ.showScoreboardAfterQuestion !== false ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className={`text-[11px] font-bold ${activeQ.showScoreboardAfterQuestion !== false ? 'text-amber-300' : 'text-slate-400'}`}>
                        {activeQ.showScoreboardAfterQuestion !== false ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={activeQ.question || ''}
                  onChange={(e) => handleUpdateActiveQuestion('question', e.target.value)}
                  placeholder={
                    activeQ.type === 'closest_pin'
                      ? "Enter your geography prompt (e.g. Where in the world was this photo taken?)"
                      : activeQ.type === 'free_input'
                      ? "Enter your free-text question here (e.g. What superhero's secret identity is Peter Parker?)"
                      : activeQ.type === 'pa_sparet'
                      ? "Enter your train prompt (e.g. Where are we heading? / Vart är vi på väg?)"
                      : "Enter your question here (e.g. Which planet is closest to the Sun?)"
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white text-lg sm:text-xl font-bold outline-none resize-none transition-all"
                />
              </div>

              {/* Conditional Answer Editor: Closest-Wins Map vs Free Text vs Multiple Choice */}
              {activeQ.type === 'closest_pin' ? (
                /* Closest-Wins Geography Landmark & Coordinates Editor */
                <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-xl space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Closest Wins — Mystery Location & Landmark Pin Settings
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-400/90 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg font-mono font-semibold">
                      Players zoom & pin on a borderless world map
                    </span>
                  </div>

                  {/* Landmark Preset Dropdown */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <SparklesIcon className="w-4 h-4 text-emerald-400" />
                        Choose from World Landmark Presets (or customize below)
                      </label>
                      <span className="text-[11px] text-slate-500">Auto-fills photo, coordinates & trivia hint</span>
                    </div>
                    <select
                      onChange={(e) => {
                        const selected = LANDMARK_PRESETS.find(p => p.name === e.target.value);
                        if (selected) {
                          handleUpdateActiveQuestion('landmarkName', selected.name);
                          handleUpdateActiveQuestion('locationName', selected.location);
                          handleUpdateActiveQuestion('lat', selected.lat);
                          handleUpdateActiveQuestion('lng', selected.lng);
                          handleUpdateActiveQuestion('imageUrl', selected.imageUrl);
                          handleUpdateActiveQuestion('secretNote', selected.hint);
                          showNotification(`Applied preset: ${selected.name} (${selected.location})`);
                        }
                      }}
                      value={LANDMARK_PRESETS.some(p => p.name === activeQ.landmarkName) ? activeQ.landmarkName : ''}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="" disabled>Select a landmark preset...</option>
                      {LANDMARK_PRESETS.map((landmark) => (
                        <option key={landmark.name} value={landmark.name}>
                          📍 {landmark.name} — {landmark.location} ({landmark.lat}°, {landmark.lng}°)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Landmark Name, Location, and Distance Unit (KM by default, configurable) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Landmark / Place Name <span className="text-emerald-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={activeQ.landmarkName || ''}
                        onChange={(e) => handleUpdateActiveQuestion('landmarkName', e.target.value)}
                        placeholder="e.g. Eiffel Tower"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white font-bold text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        City, Region or Country
                      </label>
                      <input
                        type="text"
                        value={activeQ.locationName || ''}
                        onChange={(e) => handleUpdateActiveQuestion('locationName', e.target.value)}
                        placeholder="e.g. Paris, France"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm outline-none"
                      />
                    </div>

                    {/* Distance Measurement Unit: Km by default but configurable in question admin */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Distance Unit <span className="text-slate-500 font-normal">(Default: km)</span>
                      </label>
                      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleUpdateActiveQuestion('unit', 'km')}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                            (activeQ.unit || 'km') === 'km'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Kilometers (km)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateActiveQuestion('unit', 'mi')}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                            activeQ.unit === 'mi'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Miles (mi)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mystery Photo URL & Preview */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Mystery Photo Image (Displayed on Live Display) <span className="text-emerald-400">*</span>
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={activeQ.imageUrl || ''}
                        onChange={(e) => handleUpdateActiveQuestion('imageUrl', e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs outline-none font-mono"
                      />
                    </div>
                    {activeQ.imageUrl && (
                      <div className="relative w-full max-h-48 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 mt-2">
                        <img
                          src={activeQ.imageUrl}
                          alt="Landmark preview"
                          className="w-full h-48 object-cover object-center"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur text-[11px] font-bold text-white">
                          Photo Preview (Mystery image shown to audience)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interactive Target Location Map & Coordinate Inputs */}
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <MapPinIcon className="w-4 h-4 text-emerald-400" />
                        Target Location Pin (Click anywhere on the map below to place star)
                      </label>
                      <span className="text-[11px] text-emerald-400/90 font-mono">
                        Target: {Number(activeQ.lat || 0).toFixed(4)}° N, {Number(activeQ.lng || 0).toFixed(4)}° E
                      </span>
                    </div>

                    {/* Interactive World Map Picker */}
                    <div className="h-96 sm:h-[420px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
                      <WorldMap
                        interactive={true}
                        showTarget={true}
                        targetPin={{
                          lat: activeQ.lat !== undefined ? Number(activeQ.lat) : 48.8584,
                          lng: activeQ.lng !== undefined ? Number(activeQ.lng) : 2.2945,
                          label: activeQ.landmarkName || 'Target'
                        }}
                        onPinSelect={(lat, lng) => {
                          handleUpdateActiveQuestion('lat', lat);
                          handleUpdateActiveQuestion('lng', lng);
                          showNotification(`Target coordinates set to ${lat}°, ${lng}°`);
                        }}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Direct Latitude & Longitude Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">
                          Latitude (-90 to +90)
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          min="-90"
                          max="90"
                          value={activeQ.lat !== undefined ? activeQ.lat : 48.8584}
                          onChange={(e) => handleUpdateActiveQuestion('lat', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white font-mono text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">
                          Longitude (-180 to +180)
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          min="-180"
                          max="180"
                          value={activeQ.lng !== undefined ? activeQ.lng : 2.2945}
                          onChange={(e) => handleUpdateActiveQuestion('lng', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white font-mono text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeQ.type === 'free_input' ? (
                /* Free-Input Target Answer & Typo Buffer Configuration */
                <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-xl space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                        Free-Input Answer & Typo Buffer Settings
                      </span>
                    </div>
                    <span className="text-[11px] text-cyan-400/90 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded-lg font-mono font-semibold">
                      Smart Buffer: Forgives typos, punctuation & spacing
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Primary Correct Answer */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Primary Correct Answer <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={activeQ.correctAnswer || ''}
                        onChange={(e) => handleUpdateActiveQuestion('correctAnswer', e.target.value)}
                        placeholder="e.g. Spider-Man"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-white font-bold text-base outline-none transition-all font-sans"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Shown to the audience when answers are revealed.
                      </p>
                    </div>

                    {/* Alternative Accepted Answers */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Alternative Accepted Answers <span className="text-slate-500 font-normal">(optional, comma-separated)</span>
                      </label>
                      <input
                        type="text"
                        value={activeQ.acceptedAnswers || ''}
                        onChange={(e) => handleUpdateActiveQuestion('acceptedAnswers', e.target.value)}
                        placeholder="e.g. Spiderman, Peter Parker, Spidey"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-white font-semibold text-sm outline-none transition-all font-sans"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Other synonyms, acronyms, or variants to accept.
                      </p>
                    </div>
                  </div>

                  {/* Smart Buffer Explainer & Live Interactive Typo Tester */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
                        <SparklesIcon className="w-3.5 h-3.5 text-cyan-400" />
                        Test Typo Buffer in Real-Time
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Buffer tolerates spelling typos & punctuation
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      Players don't have to worry about exact hyphens or small spelling mistakes! For example, if the answer is{' '}
                      <strong className="text-white">"{activeQ.correctAnswer || 'Spider-Man'}"</strong>, the scoring engine will also automatically accept{' '}
                      <span className="text-cyan-300 font-mono font-bold">"spiderman"</span>,{' '}
                      <span className="text-cyan-300 font-mono font-bold">"spyderman"</span>, or{' '}
                      <span className="text-cyan-300 font-mono font-bold">"spider-man!"</span>!
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                      <input
                        type="text"
                        value={testBufferInput}
                        onChange={(e) => setTestBufferInput(e.target.value)}
                        placeholder="Type any test input here (e.g. spyderman)..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-white text-xs font-mono outline-none"
                      />

                      {testBufferInput.trim() ? (
                        (() => {
                          const testResult = checkFreeInputAnswer(
                            testBufferInput,
                            activeQ.correctAnswer || '',
                            activeQ.acceptedAnswers || ''
                          );
                          return (
                            <div
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                                testResult.isCorrect
                                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                              }`}
                            >
                              <span>{testResult.isCorrect ? '✓ ACCEPTED' : '✗ NOT ACCEPTED'}</span>
                              <span className="text-[10px] font-mono opacity-80 font-normal">
                                ({testResult.reason})
                              </span>
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-[11px] text-slate-500 italic py-2 sm:py-0">
                          Try typing a spelling variant above to test
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : activeQ.type === 'pa_sparet' ? (
                /* På Spåret Train Journey & 5 Progressive Clues Configuration */
                <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-xl space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <TrainIcon className="w-4 h-4 text-amber-400" />
                        På Spåret — Train Journey & 5 Progressive Clues Settings
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-400/90 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-lg font-mono font-semibold">
                      5 Clue Drops: 10p (0s) → 8p (20s) → 6p (40s) → 4p (60s) → 2p (80s)
                    </span>
                  </div>

                  {/* Preset Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <SparklesIcon className="w-4 h-4 text-amber-400" />
                        Choose from Curated Train Route Presets (or customize below)
                      </label>
                      <span className="text-[11px] text-slate-500">Auto-fills video, destination & all 5 clues</span>
                    </div>
                    <select
                      onChange={(e) => {
                        const selected = PA_SPARET_PRESETS.find(p => p.id === e.target.value);
                        if (selected) {
                          handleUpdateActiveQuestion('destination', selected.destination);
                          handleUpdateActiveQuestion('acceptedAnswers', selected.acceptedAnswers);
                          handleUpdateActiveQuestion('youtubeUrl', selected.youtubeUrl);
                          handleUpdateActiveQuestion('videoStartTime', selected.videoStartTime);
                          handleUpdateActiveQuestion('duration', selected.duration || 90);
                          handleUpdateActiveQuestion('clues', JSON.parse(JSON.stringify(selected.clues)));
                          handleUpdateActiveQuestion('secretNote', selected.secretNote);
                          showNotification(`Applied preset: ${selected.routeTitle} → ${selected.destination}`);
                        }
                      }}
                      value={PA_SPARET_PRESETS.some(p => p.destination === activeQ.destination) ? PA_SPARET_PRESETS.find(p => p.destination === activeQ.destination)?.id : ''}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="" disabled>Select a train journey preset...</option>
                      {PA_SPARET_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.routeTitle} (Destination: {p.destination})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination & Synonyms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Destination City <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={activeQ.destination || ''}
                        onChange={(e) => handleUpdateActiveQuestion('destination', e.target.value)}
                        placeholder="e.g. Gothenburg"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white font-bold text-base outline-none transition-all"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        The mystery destination players are trying to guess.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Alternative Accepted Spellings <span className="text-slate-500 font-normal">(comma-separated)</span>
                      </label>
                      <input
                        type="text"
                        value={activeQ.acceptedAnswers || ''}
                        onChange={(e) => handleUpdateActiveQuestion('acceptedAnswers', e.target.value)}
                        placeholder="e.g. Gothenburg, Göteborg, Goteborg"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white font-semibold text-sm outline-none transition-all"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Swedish spellings, transliterations, or local variants.
                      </p>
                    </div>
                  </div>

                  {/* YouTube Video URL and Start Offset */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        YouTube Train Cab-View Video URL
                      </label>
                      <input
                        type="url"
                        value={activeQ.youtubeUrl || ''}
                        onChange={(e) => handleUpdateActiveQuestion('youtubeUrl', e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white font-mono text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Video Start Offset (sec)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={7200}
                        value={activeQ.videoStartTime !== undefined ? activeQ.videoStartTime : 0}
                        onChange={(e) => handleUpdateActiveQuestion('videoStartTime', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white font-mono text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* 5 Progressive Clues Timeline Editor */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <span>5 Progressive Clues Timeline</span>
                      </label>
                      <span className="text-[11px] text-slate-500">
                        10p is cryptic/wordplay; 2p is straightforward
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {(activeQ.clues || []).map((clue, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-xs font-black">
                              {clue.tier} PTS
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              (at {clue.timeSec}s)
                            </span>
                          </div>

                          <input
                            type="text"
                            value={clue.text || ''}
                            onChange={(e) => {
                              const updatedClues = [...(activeQ.clues || [])];
                              updatedClues[idx] = { ...clue, text: e.target.value };
                              handleUpdateActiveQuestion('clues', updatedClues);
                            }}
                            placeholder={`Clue for ${clue.tier} points...`}
                            className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Real-time Typo Buffer Tester */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
                        <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
                        Test Destination Guess Matching in Real-Time
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Buffer tolerates typos, accents & casing
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                      <input
                        type="text"
                        value={testBufferInput}
                        onChange={(e) => setTestBufferInput(e.target.value)}
                        placeholder="Type player guess to test (e.g. goteborg, gothenberg)..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-white text-xs font-mono outline-none"
                      />

                      {testBufferInput.trim() ? (
                        (() => {
                          const testResult = checkFreeInputAnswer(
                            testBufferInput,
                            activeQ.destination || '',
                            activeQ.acceptedAnswers || ''
                          );
                          return (
                            <div
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                                testResult.isCorrect
                                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                              }`}
                            >
                              <span>{testResult.isCorrect ? '✓ ACCEPTED' : '✗ NOT ACCEPTED'}</span>
                              <span className="text-[10px] font-mono opacity-80 font-normal">
                                ({testResult.reason})
                              </span>
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-[11px] text-slate-500 italic py-2 sm:py-0">
                          Try typing a spelling variant above to test
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* 4 Multiple Choice Answer Cards */
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Answer Options (Select the checkmark for the correct answer)
                    </label>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckIcon className="w-3.5 h-3.5" /> Correct: {shapes[activeQ.correctIndex]?.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(activeQ.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4']).map((optionText, optIdx) => {
                      const shape = shapes[optIdx];
                      const isCorrect = optIdx === activeQ.correctIndex;

                      return (
                        <div
                          key={optIdx}
                          className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 relative ${
                            isCorrect
                              ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Shape Icon */}
                          <div className={`w-9 h-9 rounded-xl ${shape.bg} flex items-center justify-center font-black text-white shrink-0 text-lg shadow`}>
                            {shape.symbol}
                          </div>

                          {/* Option Text Input */}
                          <input
                            type="text"
                            value={optionText}
                            onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                            placeholder={`Answer ${optIdx + 1}...`}
                            className="flex-1 bg-transparent border-none text-white font-semibold text-sm outline-none px-1"
                          />

                          {/* Correct Toggle Radio Button */}
                          <button
                            type="button"
                            onClick={() => handleUpdateActiveQuestion('correctIndex', optIdx)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                              isCorrect
                                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                                : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-white'
                            }`}
                            title={isCorrect ? 'Correct Answer' : 'Set as Correct Answer'}
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Secret Host Trivia Note & Explanation */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-700/60 text-purple-200 text-[10px] font-black uppercase">
                    Host Confidential
                  </span>
                  <label className="text-xs font-bold text-slate-300">
                    Secret Trivia Fact / Host Explanation
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">
                  This note is displayed only on the Host Console screen to share interesting trivia when revealing answers.
                </p>
                <input
                  type="text"
                  value={activeQ.secretNote || ''}
                  onChange={(e) => handleUpdateActiveQuestion('secretNote', e.target.value)}
                  placeholder="e.g. Mercury orbits the Sun in just 88 days!"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white text-xs outline-none"
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 1-Click Host Share Link & Saved Quizzes Modal */}
      <ShareQuizModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        currentQuiz={{
          title: quizTitle,
          questions,
          showScoreboardAfterQuestion
        }}
        onLoadQuiz={(loaded) => {
          if (loaded.title) setQuizTitle(loaded.title);
          if (loaded.showScoreboardAfterQuestion !== undefined) {
            setShowScoreboardAfterQuestion(Boolean(loaded.showScoreboardAfterQuestion));
          }
          if (Array.isArray(loaded.questions)) {
            setQuestions(loaded.questions);
            setActiveIdx(0);
          }
          showNotification(`Loaded "${loaded.title || 'Quiz'}"!`);
        }}
      />
    </div>
  );
}

