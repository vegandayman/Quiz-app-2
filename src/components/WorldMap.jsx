import React, { useState, useRef, useEffect, useCallback } from 'react';
import { coordsToPoint, pointToCoords } from '../utils/geoDistance.js';
import { WORLD_PATH } from '../data/worldCoastlines.js';

/**
 * WorldMap Component
 * - High-detail Natural Earth vector world map (slate grey land `#334155` on deep navy water `#090d16`)
 * - Zero country borders, zero text labels
 * - Sub-pixel precision touch mapping with native SVG matrix transforms (fixes 1cm offset)
 * - Isolated pan & zoom controls (tapping +/- never drops a pin)
 * - Drag-to-adjust pin placement
 * - Smooth camera transitions to target and closest guesses
 */
export default function WorldMap({
  targetPin = null, // { lat, lng }
  playerPins = [],  // Array of { id, name, lat, lng, color, isWinner }
  showTarget = true,
  showPlayerPins = true,
  showDistanceLines = false,
  interactive = false, // If true, tapping or dragging places/moves pin
  selectedPin = null,  // Currently placed player pin { lat, lng }
  onPinSelect = null,  // callback(lat, lng)
  focusBounds = null,  // { minLat, maxLat, minLng, maxLng } to zoom camera into
  landColor = '#334155',  // Solid slate grey land
  oceanColor = '#090d16', // Solid deep navy ocean
  className = 'w-full h-full min-h-[320px]'
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // ViewBox pan and zoom state: { x, y, width, height }
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1000, height: 500 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingPin, setIsDraggingPin] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const touchStartDistRef = useRef(null);
  const touchStartPosRef = useRef(null);
  const touchMovedRef = useRef(false);
  const animRef = useRef(null);
  const currentViewBoxRef = useRef({ x: 0, y: 0, width: 1000, height: 500 });

  // Keep currentViewBoxRef in sync
  useEffect(() => {
    currentViewBoxRef.current = viewBox;
  }, [viewBox]);

  // Smoothly animate zoom when focusBounds is provided (Reveal Stage 4)
  useEffect(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }

    let targetX = 0;
    let targetY = 0;
    let targetW = 1000;
    let targetH = 500;

    if (focusBounds) {
      const { minLat, maxLat, minLng, maxLng } = focusBounds;
      const pTopLeft = coordsToPoint(maxLat, minLng);
      const pBottomRight = coordsToPoint(minLat, maxLng);

      const padX = Math.max(90, (pBottomRight.x - pTopLeft.x) * 0.45);
      const padY = Math.max(70, (pBottomRight.y - pTopLeft.y) * 0.45);

      targetW = Math.max(160, Math.min(1000, (pBottomRight.x - pTopLeft.x) + padX * 2));
      targetH = Math.max(100, Math.min(500, (pBottomRight.y - pTopLeft.y) + padY * 2));

      const centerX = (pTopLeft.x + pBottomRight.x) / 2;
      const centerY = (pTopLeft.y + pBottomRight.y) / 2;

      targetX = Math.max(0, Math.min(1000 - targetW, centerX - targetW / 2));
      targetY = Math.max(0, Math.min(500 - targetH, centerY - targetH / 2));
    }

    const start = { ...currentViewBoxRef.current };
    const startTime = performance.now();
    const duration = 1200; // 1.2s smooth cinematic camera zoom

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);

      const nextBox = {
        x: start.x + (targetX - start.x) * eased,
        y: start.y + (targetY - start.y) * eased,
        width: start.width + (targetW - start.width) * eased,
        height: start.height + (targetH - start.height) * eased
      };

      setViewBox(nextBox);
      currentViewBoxRef.current = nextBox;

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        animRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [focusBounds]);

  /**
   * Convert client (screen) coordinates to SVG coordinate space using the browser's
   * native SVG Matrix transformation (getScreenCTM().inverse()).
   * This completely accounts for aspect-ratio letterboxing, CSS sizing, devicePixelRatio,
   * and eliminates any vertical or horizontal offset!
   */
  const getSvgCoordinates = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return null;

    try {
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;

      const transformed = pt.matrixTransform(ctm.inverse());
      return {
        x: Math.max(0, Math.min(1000, transformed.x)),
        y: Math.max(0, Math.min(500, transformed.y))
      };
    } catch {
      // Fallback
      const rect = svg.getBoundingClientRect();
      const scaleX = viewBox.width / rect.width;
      const scaleY = viewBox.height / rect.height;
      return {
        x: viewBox.x + (clientX - rect.left) * scaleX,
        y: viewBox.y + (clientY - rect.top) * scaleY
      };
    }
  }, [viewBox]);

  // Selected player pin coordinates in SVG space
  const selectedPt = selectedPin && selectedPin.lat !== undefined && selectedPin.lng !== undefined
    ? coordsToPoint(selectedPin.lat, selectedPin.lng)
    : null;

  // Target pin coordinates in SVG space
  const targetPt = targetPin && targetPin.lat !== undefined && targetPin.lng !== undefined
    ? coordsToPoint(targetPin.lat, targetPin.lng)
    : null;

  // Counter-scaling factor: exactly cancels SVG viewport zoom so markers remain at constant screen size!
  const markerScale = viewBox.width / 1000;

  // Check if click/touch is near the existing placed pin
  const isNearSelectedPin = (svgCoords) => {
    if (!selectedPt || !svgCoords) return false;
    const hitRadius = 28 * markerScale;
    const dx = svgCoords.x - selectedPt.x;
    const dy = svgCoords.y - selectedPt.y;
    return Math.hypot(dx, dy) <= hitRadius;
  };

  // Handle clicking or tapping the map to place a pin
  const handleMapClick = (e) => {
    // If the click originated from zoom buttons or overlays, ignore
    if (e.target.closest('.map-control-overlay')) return;
    if (!interactive || !onPinSelect) return;
    if (isPanning || touchMovedRef.current) return;

    const coords = getSvgCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    const geo = pointToCoords(coords.x, coords.y);
    onPinSelect(geo.lat, geo.lng);
  };

  // Mouse pan & drag handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.map-control-overlay')) return;
    if (e.button !== 0) return;

    const coords = getSvgCoordinates(e.clientX, e.clientY);
    if (interactive && onPinSelect && isNearSelectedPin(coords)) {
      setIsDraggingPin(true);
    } else {
      setIsPanning(true);
    }
    setStartPan({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (isDraggingPin && interactive && onPinSelect) {
      const coords = getSvgCoordinates(e.clientX, e.clientY);
      if (coords) {
        const geo = pointToCoords(coords.x, coords.y);
        onPinSelect(geo.lat, geo.lng);
      }
      return;
    }

    if (!isPanning) return;
    const dx = e.clientX - startPan.x;
    const dy = e.clientY - startPan.y;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;

    setViewBox((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(1000 - prev.width, prev.x - dx * scaleX)),
      y: Math.max(0, Math.min(500 - prev.height, prev.y - dy * scaleY))
    }));

    setStartPan({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingPin(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.85 : 1.15;
    applyZoom(zoomFactor, e.clientX, e.clientY);
  };

  // Touch handlers for mobile pinch-to-zoom, pan, and tap/drag-to-adjust pin
  const handleTouchStart = (e) => {
    if (e.target.closest('.map-control-overlay')) return;

    if (e.touches.length === 2) {
      // Pinch zoom start
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      touchStartDistRef.current = dist;
      touchMovedRef.current = true;
      setIsDraggingPin(false);
      setIsPanning(false);
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const coords = getSvgCoordinates(touch.clientX, touch.clientY);

      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
      touchMovedRef.current = false;
      setStartPan({ x: touch.clientX, y: touch.clientY });

      if (interactive && onPinSelect && isNearSelectedPin(coords)) {
        setIsDraggingPin(true);
        setIsPanning(false);
      } else {
        setIsPanning(true);
        setIsDraggingPin(false);
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchStartDistRef.current) {
      // Pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const ratio = touchStartDistRef.current / dist;
      touchStartDistRef.current = dist;
      touchMovedRef.current = true;

      const midX = (touch1.clientX + touch2.clientX) / 2;
      const midY = (touch1.clientY + touch2.clientY) / 2;
      applyZoom(Math.max(0.85, Math.min(1.15, ratio)), midX, midY);
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const dx = touch.clientX - startPan.x;
      const dy = touch.clientY - startPan.y;

      if (Math.hypot(dx, dy) > 8) {
        touchMovedRef.current = true;
      }

      if (isDraggingPin && interactive && onPinSelect) {
        // Dragging existing pin to fine-tune
        const coords = getSvgCoordinates(touch.clientX, touch.clientY);
        if (coords) {
          const geo = pointToCoords(coords.x, coords.y);
          onPinSelect(geo.lat, geo.lng);
        }
      } else if (isPanning && containerRef.current) {
        // Panning map
        const rect = containerRef.current.getBoundingClientRect();
        const scaleX = viewBox.width / rect.width;
        const scaleY = viewBox.height / rect.height;

        setViewBox((prev) => ({
          ...prev,
          x: Math.max(0, Math.min(1000 - prev.width, prev.x - dx * scaleX)),
          y: Math.max(0, Math.min(500 - prev.height, prev.y - dy * scaleY))
        }));
        setStartPan({ x: touch.clientX, y: touch.clientY });
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (e.target.closest('.map-control-overlay')) return;

    if (e.touches.length === 0) {
      const wasTap = !touchMovedRef.current && !isDraggingPin;
      setIsPanning(false);
      setIsDraggingPin(false);
      touchStartDistRef.current = null;

      // Single tap to drop or reposition pin
      if (wasTap && interactive && onPinSelect && touchStartPosRef.current) {
        const coords = getSvgCoordinates(touchStartPosRef.current.x, touchStartPosRef.current.y);
        if (coords) {
          const geo = pointToCoords(coords.x, coords.y);
          onPinSelect(geo.lat, geo.lng);
        }
      }
    }
  };

  // Zoom helper centered around a screen point
  const applyZoom = (factor, screenX, screenY) => {
    setViewBox((prev) => {
      const newWidth = Math.max(120, Math.min(1000, prev.width * factor));
      const newHeight = Math.max(60, Math.min(500, prev.height * factor));

      let newX = prev.x + (prev.width - newWidth) / 2;
      let newY = prev.y + (prev.height - newHeight) / 2;

      if (screenX !== undefined && screenY !== undefined && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const originX = (screenX - rect.left) / rect.width;
        const originY = (screenY - rect.top) / rect.height;
        newX = prev.x + (prev.width - newWidth) * originX;
        newY = prev.y + (prev.height - newHeight) * originY;
      }

      return {
        x: Math.max(0, Math.min(1000 - newWidth, newX)),
        y: Math.max(0, Math.min(500 - newHeight, newY)),
        width: newWidth,
        height: newHeight
      };
    });
  };

  const handleResetZoom = () => {
    setViewBox({ x: 0, y: 0, width: 1000, height: 500 });
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-2xl border border-slate-800 shadow-2xl ${className}`}
      style={{ backgroundColor: oceanColor }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full cursor-crosshair transition-[viewBox] duration-700 ease-out"
        onClick={handleMapClick}
      >
        <defs>
          {/* Subtle star glow filter (clean stationary SVG filter) */}
          <filter id="star-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#fbbf24" floodOpacity="0.8" />
          </filter>
          <filter id="pin-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Ocean Background Canvas */}
        <rect x="0" y="0" width="1000" height="500" fill={oceanColor} />

        {/* High-Detail Natural Earth 50m Vector Landmass (Zero borders, zero text labels) */}
        <path
          d={WORLD_PATH}
          fill={landColor}
          className="transition-colors duration-300"
        />

        {/* Distance Connection Lines (Stage 3 & 4 Reveal) */}
        {showDistanceLines && showTarget && targetPt && showPlayerPins && (
          <g className="transition-opacity duration-700">
            {playerPins.map((player) => {
              if (player.lat === undefined || player.lng === undefined || isNaN(player.lat)) return null;
              const pt = coordsToPoint(player.lat, player.lng);
              const isWinner = Boolean(player.isWinner);

              return (
                <line
                  key={`line-${player.id}`}
                  x1={pt.x}
                  y1={pt.y}
                  x2={targetPt.x}
                  y2={targetPt.y}
                  stroke={isWinner ? '#fbbf24' : 'rgba(148, 163, 184, 0.4)'}
                  strokeWidth={isWinner ? 2 * markerScale : 1 * markerScale}
                  strokeDasharray={isWinner ? 'none' : `${4 * markerScale} ${3 * markerScale}`}
                />
              );
            })}
          </g>
        )}

        {/* Player Guess Pins (Reveal Stage 2, 3, 4) - Constant screen size */}
        {showPlayerPins && playerPins.map((player) => {
          if (player.lat === undefined || player.lng === undefined || isNaN(player.lat)) return null;
          const pt = coordsToPoint(player.lat, player.lng);
          const pinColor = player.isWinner ? '#f59e0b' : (player.color || '#a855f7');

          return (
            <g
              key={player.id}
              transform={`translate(${pt.x}, ${pt.y}) scale(${markerScale})`}
              className="transition-all duration-500 ease-out"
            >
              {/* Winner halo ring */}
              {player.isWinner && (
                <circle
                  cx="0"
                  cy="0"
                  r="13"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
              )}

              {/* Pin Base & Center */}
              <circle
                cx="0"
                cy="0"
                r="7"
                fill={pinColor}
                stroke="#ffffff"
                strokeWidth="1.5"
              />

              {/* Winner inner center dot */}
              {player.isWinner && (
                <circle
                  cx="0"
                  cy="0"
                  r="2.5"
                  fill="#ffffff"
                />
              )}
            </g>
          );
        })}

        {/* User Currently Selected Pin (Mobile Player Screen) - Anchored needle pin, constant screen size */}
        {selectedPt && (
          <g
            transform={`translate(${selectedPt.x}, ${selectedPt.y}) scale(${markerScale})`}
            filter="url(#pin-shadow)"
          >
            {/* Ground shadow ellipse */}
            <ellipse
              cx="0"
              cy="1.5"
              rx="6"
              ry="2.5"
              fill="rgba(0, 0, 0, 0.45)"
            />

            {/* Needle Pin Body with tip anchored precisely at (0, 0) */}
            <path
              d="M 0 0 C -7 -8 -9 -19 0 -19 C 9 -19 7 -8 0 0 Z"
              fill="#06b6d4"
              stroke="#ffffff"
              strokeWidth="1.6"
            />

            {/* Inner pin eyelet dot */}
            <circle
              cx="0"
              cy="-12.5"
              r="3"
              fill="#ffffff"
            />
          </g>
        )}

        {/* Actual Target Pin (Gold Star) - Clean radiant star, constant screen size */}
        {showTarget && targetPt && (
          <g
            transform={`translate(${targetPt.x}, ${targetPt.y}) scale(${markerScale})`}
            filter="url(#star-glow)"
          >
            {/* Stationary halo ring */}
            <circle
              cx="0"
              cy="0"
              r="17"
              fill="rgba(251, 191, 36, 0.18)"
              stroke="#fbbf24"
              strokeWidth="1"
            />

            {/* Target 8-Point Star Marker */}
            <path
              d="M 0 -13 L 3.6 -3.6 L 13 0 L 3.6 3.6 L 0 13 L -3.6 3.6 L -13 0 L -3.6 -3.6 Z"
              fill="#fbbf24"
              stroke="#ffffff"
              strokeWidth="1.8"
            />

            {/* Center core */}
            <circle
              cx="0"
              cy="0"
              r="3.5"
              fill="#ffffff"
            />
          </g>
        )}
      </svg>

      {/* Map Pan & Zoom Controls Overlay - Fully isolated to prevent accidental pin drops */}
      <div
        className="map-control-overlay absolute bottom-3 right-3 flex flex-col gap-1.5 z-30"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            applyZoom(0.7);
          }}
          className="w-9 h-9 rounded-xl bg-slate-900/95 border border-slate-700/80 text-white font-black text-base flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-xl cursor-pointer"
          title="Zoom In"
        >
          +
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            applyZoom(1.3);
          }}
          className="w-9 h-9 rounded-xl bg-slate-900/95 border border-slate-700/80 text-white font-black text-base flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-xl cursor-pointer"
          title="Zoom Out"
        >
          −
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleResetZoom();
          }}
          className="w-9 h-9 rounded-xl bg-slate-900/95 border border-slate-700/80 text-amber-300 font-bold text-sm flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-xl cursor-pointer"
          title="Reset View"
        >
          ⟲
        </button>
      </div>

      {/* Touch Instruction Tooltip for Interactive Mode */}
      {interactive && !selectedPt && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-cyan-200 px-3.5 py-1.5 rounded-full text-xs font-bold pointer-events-none shadow-xl flex items-center gap-1.5 animate-pulse">
          <span>📍 Tap map to drop pin • Drag to adjust</span>
        </div>
      )}
    </div>
  );
}
