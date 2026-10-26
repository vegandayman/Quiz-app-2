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
  // Determine which role this specific tab is responsible for rendering
  // Default is 'player' (Kahoot model: players land directly on join screen)
  const getInitialRole = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
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

  const [activeRole, setActiveRole] = useState(getInitialRole);
  const [activePin, setActivePin] = useState(getInitialPin);
  const [isHostAuthed, setIsHostAuthed] = useState(() => isHostAuthenticated());

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
