/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import HostConsole from './components/HostConsole.jsx';
import LiveDisplay from './components/LiveDisplay.jsx';
import PlayerJoin from './components/PlayerJoin.jsx';
import HostLockScreen, {
  isHostAuthenticated,
  clearHostAuthentication
} from './components/HostLockScreen.jsx';
import { ensureAuth } from './firebase.js';

export default function App() {
  const getInitialQuizId = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('quizId') || params.get('quiz') || '';
    }
    return '';
  };

  const getInitialQuizData = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('quizData') || params.get('data') || '';
    }
    return '';
  };

  // Determine which role this specific tab is responsible for rendering
  // Default is 'player' (Kahoot model: players land directly on join screen)
  const getInitialRole = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('quizId') || params.get('quiz') || params.get('quizData') || params.get('data')) {
        return 'host';
      }
      const urlRole = params.get('role');
      if (urlRole === 'display' || urlRole === 'player' || urlRole === 'host') {
        return urlRole;
      }
    }
    return 'player';
  };

  const getInitialPin = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('pin') || '';
    }
    return '';
  };

  const initialQuizId = getInitialQuizId();
  const initialQuizData = getInitialQuizData();

  const [activeRole, setActiveRole] = useState(getInitialRole);
  const [activePin, setActivePin] = useState(getInitialPin);
  const [activeQuizId, setActiveQuizId] = useState(initialQuizId);
  const [activeQuizData, setActiveQuizData] = useState(initialQuizData);
  // If user arrives via a shared quiz link, grant instant host access
  const [isHostAuthed, setIsHostAuthed] = useState(() => Boolean(initialQuizId || initialQuizData) || isHostAuthenticated());

  // Silently initialize Firebase auth on mount
  useEffect(() => {
    ensureAuth();
  }, []);


  // Listen to browser navigation / popstate
  useEffect(() => {
    const handlePopState = () => {
      setActiveRole(getInitialRole());
      setActivePin(getInitialPin());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToRole = (role: string, pin?: string) => {
    const params = new URLSearchParams();
    if (role !== 'player') {
      params.set('role', role);
    }
    const currentPin = pin || activePin;
    if (currentPin) {
      params.set('pin', currentPin);
    }
    const newQuery = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.pushState({}, '', newQuery);
    setActiveRole(role);
    if (pin) setActivePin(pin);
  };

  // Helper to construct URL for launching Live Display or sharing Player link in new window
  const getRoleUrl = (role: string, pin?: string) => {
    if (typeof window === 'undefined') return `?role=${role}`;
    const base = `${window.location.origin}${window.location.pathname}`;
    const targetPin = pin || activePin;
    const params = new URLSearchParams();
    if (role !== 'player') {
      params.set('role', role);
    }
    if (targetPin) {
      params.set('pin', targetPin);
    }
    return params.toString() ? `${base}?${params.toString()}` : base;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* 1. Host Console (Guarded by Host Master Passcode) */}
      {activeRole === 'host' && (
        !isHostAuthed ? (
          <HostLockScreen
            onAuthenticated={() => setIsHostAuthed(true)}
            onBackToPlayer={() => navigateToRole('player')}
          />
        ) : (
          <HostConsole
            initialQuizId={activeQuizId}
            initialQuizData={activeQuizData}
            onRoomCodeReady={(pin: string) => setActivePin(pin)}
            onOpenDisplay={(pin: string) => {
              setActivePin(pin);
              window.open(getRoleUrl('display', pin), '_blank');
            }}
            onLockConsole={() => {
              clearHostAuthentication();
              setIsHostAuthed(false);
            }}
            onSwitchToPlayer={() => navigateToRole('player')}
          />
        )
      )}

      {/* 2. Shared Big Screen / TV Live Display */}
      {activeRole === 'display' && (
        <LiveDisplay
          roomCode={activePin}
          onSwitchToHost={() => navigateToRole('host')}
        />
      )}

      {/* 3. Player Phone Screen (Default Landing) */}
      {activeRole === 'player' && (
        <PlayerJoin
          initialRoomCode={activePin}
          onOpenHost={() => navigateToRole('host')}
        />
      )}
    </div>
  );
}
