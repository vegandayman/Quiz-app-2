import React, { useState, useRef, useEffect, useCallback } from 'react';
import { coordsToPoint, pointToCoords } from '../utils/geoDistance.js';

/**
 * Detailed World Landmass SVG Polygons (Equirectangular Projection 1000x500)
 * Pure landmass silhouettes with ZERO borders and ZERO text labels.
 */
const WORLD_PATHS = [
  // North America (including Canada, USA, Alaska, Mexico, Central America)
  "M 152,70 L 165,65 L 185,55 L 210,50 L 250,55 L 290,65 L 320,80 L 315,105 L 295,115 L 310,135 L 295,150 L 280,140 L 275,120 L 255,115 L 245,130 L 260,150 L 250,175 L 235,185 L 205,190 L 195,215 L 180,210 L 170,185 L 155,170 L 140,170 L 125,145 L 135,120 L 115,110 L 95,95 L 105,80 L 130,85 Z " +
  "M 265,180 L 250,215 L 230,225 L 210,210 L 200,240 L 220,250 L 245,265 L 260,250 L 280,240 L 290,210 L 285,185 Z " +
  "M 225,255 L 240,270 L 255,290 L 270,305 L 260,315 L 245,300 L 230,285 L 215,270 Z",

  // Greenland
  "M 360,40 L 405,35 L 435,50 L 415,85 L 375,95 L 350,75 L 345,55 Z",

  // South America
  "M 270,310 L 295,305 L 330,320 L 365,340 L 390,370 L 375,410 L 350,440 L 325,480 L 305,490 L 300,465 L 310,430 L 295,390 L 280,360 L 265,335 Z",

  // Europe & British Isles
  "M 470,110 L 490,100 L 515,115 L 530,140 L 510,160 L 485,165 L 465,150 L 450,130 Z " +
  "M 455,135 L 465,125 L 475,140 L 465,150 Z " + // British Isles
  "M 435,130 L 445,125 L 450,140 L 440,145 Z",  // Ireland

  // Scandinavia
  "M 505,80 L 525,65 L 545,75 L 535,115 L 515,125 L 495,115 L 500,95 Z",

  // Africa
  "M 465,185 L 500,180 L 545,195 L 585,230 L 565,270 L 540,320 L 520,370 L 495,385 L 475,360 L 460,300 L 440,260 L 435,225 L 455,200 Z",

  // Madagascar
  "M 585,340 L 595,335 L 600,365 L 590,380 L 580,360 Z",

  // Eurasia (Russia, Central Asia, Middle East, India, China, SE Asia, Siberia)
  "M 530,140 L 575,130 L 630,110 L 700,95 L 780,85 L 850,90 L 910,105 L 940,130 L 890,145 L 830,150 L 775,170 L 730,185 L 680,180 L 640,195 L 590,190 L 550,175 L 520,165 Z " +
  "M 530,185 L 565,190 L 600,220 L 590,250 L 560,255 L 540,225 Z " + // Arabian Peninsula
  "M 650,215 L 685,220 L 705,255 L 680,290 L 660,260 L 645,235 Z " + // Indian Subcontinent
  "M 710,210 L 770,205 L 820,230 L 855,270 L 825,295 L 785,280 L 760,250 L 725,235 Z " + // China & East Asia
  "M 780,270 L 805,290 L 820,330 L 800,345 L 785,315 L 770,285 Z", // Indochina & SE Asia

  // Japan
  "M 870,175 L 885,165 L 895,190 L 880,210 L 865,195 Z",

  // Indonesia, Philippines & Pacific Islands
  "M 780,340 L 820,345 L 850,355 L 835,370 L 795,365 Z " +
  "M 830,280 L 845,270 L 850,305 L 835,315 Z " +
  "M 865,340 L 905,345 L 915,365 L 875,370 Z", // New Guinea

  // Australia
  "M 830,375 L 880,365 L 920,385 L 935,425 L 905,455 L 860,450 L 825,415 L 815,385 Z",

  // New Zealand
  "M 955,445 L 970,440 L 965,475 L 950,465 Z",

  // Antarctica
  "M 100,480 L 250,470 L 450,475 L 650,470 L 850,475 L 950,485 L 1000,500 L 0,500 Z"
];

/**
 * WorldMap Component
 * - Pure silhouette vector world map (zero borders, zero text labels)
 * - Equirectangular coordinates (width: 1000, height: 500)
 * - Mobile pinch-to-zoom, touch pan, desktop drag/wheel zoom, and button controls
 * - Interactive target pin, player guess pins, and distance connection lines
 * - Dynamic animated camera zoom focusing on target and closest guesses
 */
export default function WorldMap({
  targetPin = null, // { lat, lng, label, icon }
  playerPins = [],  // Array of { id, name, lat, lng, color, distance, isWinner }
  showTarget = true,
  showPlayerPins = true,
  showDistanceLines = false,
  interactive = false, // If true, clicking/tapping places or moves pin
  selectedPin = null,  // Currently placed player pin { lat, lng }
  onPinSelect = null,  // callback(lat, lng)
  focusBounds = null,  // { minLat, maxLat, minLng, maxLng } to zoom camera into
  landColor = '#334155',  // Solid slate landmass
  oceanColor = '#090d16', // Solid deep obsidian/navy ocean
  className = 'w-full h-full min-h-[320px]'
}) {
  const containerRef = useRef(null);

  // ViewBox pan and zoom state: { x, y, width, height }
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1000, height: 500 });
  const [isPanning, setIsPanning] = useState(false);
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

  // Smoothly animate zoom when focusBounds is provided (Stage 4)
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
    const duration = 1200; // 1.2s cinematic camera zoom

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

  // Convert click/touch on the SVG to SVG coordinate space
  const getSvgCoordinates = useCallback((clientX, clientY) => {
    if (!containerRef.current) return null;
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return null;

    const rect = svg.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    // Scale from screen pixels to viewBox coordinates
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;

    const svgX = viewBox.x + relX * scaleX;
    const svgY = viewBox.y + relY * scaleY;

    return { x: svgX, y: svgY };
  }, [viewBox]);

  // Handle clicking or tapping the map to place a pin
  const handleMapClick = (e) => {
    if (!interactive || !onPinSelect) return;
    // Don't register click if user was panning/dragging
    if (isPanning) return;

    const coords = getSvgCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    const geo = pointToCoords(coords.x, coords.y);
    onPinSelect(geo.lat, geo.lng);
  };

  // Mouse pan handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only primary mouse button
    setIsPanning(true);
    setStartPan({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
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
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.85 : 1.15;
    applyZoom(zoomFactor, e.clientX, e.clientY);
  };

  // Touch handlers for mobile pinch-to-zoom & one-finger pan/tap
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch zoom start
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      touchStartDistRef.current = dist;
      touchMovedRef.current = true;
    } else if (e.touches.length === 1) {
      // 1-finger start
      setIsPanning(true);
      setStartPan({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchMovedRef.current = false;
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
    } else if (e.touches.length === 1 && isPanning) {
      // Pan
      const touch = e.touches[0];
      const dx = touch.clientX - startPan.x;
      const dy = touch.clientY - startPan.y;

      if (Math.hypot(dx, dy) > 6) {
        touchMovedRef.current = true;
      }

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scaleX = viewBox.width / rect.width;
        const scaleY = viewBox.height / rect.height;

        setViewBox((prev) => ({
          ...prev,
          x: Math.max(0, Math.min(1000 - prev.width, prev.x - dx * scaleX)),
          y: Math.max(0, Math.min(500 - prev.height, prev.y - dy * scaleY))
        }));
      }
      setStartPan({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      setIsPanning(false);
      touchStartDistRef.current = null;

      // If user tapped without dragging, place pin
      if (!touchMovedRef.current && interactive && onPinSelect && touchStartPosRef.current) {
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

      // Keep focus around cursor/touch point if available
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

  // Target pin coordinates in SVG space
  const targetPt = targetPin && targetPin.lat !== undefined && targetPin.lng !== undefined
    ? coordsToPoint(targetPin.lat, targetPin.lng)
    : null;

  // Selected player pin coordinates in SVG space
  const selectedPt = selectedPin && selectedPin.lat !== undefined && selectedPin.lng !== undefined
    ? coordsToPoint(selectedPin.lat, selectedPin.lng)
    : null;

  // Scale marker sizes according to current zoom level so markers remain clear
  const zoomScale = viewBox.width / 1000;
  const pinRadius = Math.max(3.5, 7 * zoomScale);
  const targetStarRadius = Math.max(6, 12 * zoomScale);
  const textScale = Math.max(9, 13 * zoomScale);

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
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="w-full h-full cursor-crosshair transition-[viewBox] duration-700 ease-out"
        onClick={handleMapClick}
      >
        <defs>
          {/* Subtle ocean grid lines for geographic latitude/longitude depth */}
          <pattern id="geo-grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.8" />
          </pattern>

          {/* Target Star Glow Filter */}
          <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Winner Pin Glow Filter */}
          <filter id="winner-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ocean Background & Coordinate Grid */}
        <rect x="0" y="0" width="1000" height="500" fill={oceanColor} />
        <rect x="0" y="0" width="1000" height="500" fill="url(#geo-grid)" />

        {/* Equator & Prime Meridian Subtle Guideline */}
        <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" strokeWidth="0.8" />
        <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" strokeWidth="0.8" />

        {/* Solid Landmass Silhouettes (NO BORDERS, NO LABELS) */}
        <g fill={landColor} stroke="none">
          {WORLD_PATHS.map((pathData, idx) => (
            <path
              key={idx}
              d={pathData}
              className="transition-colors duration-300"
            />
          ))}
        </g>

        {/* Connecting Distance Lines between Players and Target (Reveal Stage) */}
        {showDistanceLines && targetPt && showPlayerPins && (
          <g>
            {playerPins.map((player) => {
              if (player.lat === undefined || player.lng === undefined || isNaN(player.lat)) return null;
              const pt = coordsToPoint(player.lat, player.lng);
              return (
                <g key={`line-${player.id}`}>
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={targetPt.x}
                    y2={targetPt.y}
                    stroke={player.isWinner ? '#f59e0b' : 'rgba(255, 255, 255, 0.45)'}
                    strokeWidth={player.isWinner ? Math.max(2, 3.5 * zoomScale) : Math.max(1, 1.8 * zoomScale)}
                    strokeDasharray={player.isWinner ? 'none' : '4 4'}
                  />
                  {/* Distance label midway along line */}
                  {player.distanceFormatted && (
                    <text
                      x={(pt.x + targetPt.x) / 2}
                      y={(pt.y + targetPt.y) / 2 - 3 * zoomScale}
                      fill={player.isWinner ? '#fbbf24' : '#e2e8f0'}
                      fontSize={Math.max(8, textScale * 0.75)}
                      fontWeight="bold"
                      textAnchor="middle"
                      className="font-mono shadow-md"
                    >
                      {player.distanceFormatted}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* Player Guess Pins (Reveal Stage) */}
        {showPlayerPins && playerPins.map((player) => {
          if (player.lat === undefined || player.lng === undefined || isNaN(player.lat)) return null;
          const pt = coordsToPoint(player.lat, player.lng);
          const pinColor = player.isWinner ? '#f59e0b' : (player.color || '#a855f7');

          return (
            <g
              key={player.id}
              className="transition-all duration-500 ease-out"
              filter={player.isWinner ? 'url(#winner-glow)' : undefined}
            >
              {/* Winner Radar Shockwave */}
              {player.isWinner && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={pinRadius * 2.2}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth={1.5 * zoomScale}
                  className="animate-ping opacity-75"
                />
              )}

              {/* Pin Base & Center */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={pinRadius}
                fill={pinColor}
                stroke="#ffffff"
                strokeWidth={Math.max(1, 1.5 * zoomScale)}
              />

              {/* Floating Player Name Label */}
              <g transform={`translate(${pt.x}, ${pt.y - pinRadius - 2 * zoomScale})`}>
                <text
                  x="0"
                  y="0"
                  fill="#ffffff"
                  fontSize={Math.max(7, textScale * 0.8)}
                  fontWeight="bold"
                  textAnchor="middle"
                  className="font-sans"
                >
                  {player.isWinner ? `👑 ${player.name}` : player.name}
                </text>
              </g>
            </g>
          );
        })}

        {/* User Currently Selected Pin (Mobile Player Screen) */}
        {selectedPt && (
          <g>
            <circle
              cx={selectedPt.x}
              cy={selectedPt.y}
              r={pinRadius * 1.8}
              fill="rgba(56, 189, 248, 0.25)"
              className="animate-ping"
            />
            <circle
              cx={selectedPt.x}
              cy={selectedPt.y}
              r={pinRadius}
              fill="#06b6d4"
              stroke="#ffffff"
              strokeWidth={Math.max(1, 2 * zoomScale)}
            />
            <g transform={`translate(${selectedPt.x}, ${selectedPt.y - pinRadius - 3 * zoomScale})`}>
              <rect
                x={-28 * zoomScale}
                y={-14 * zoomScale}
                width={56 * zoomScale}
                height={14 * zoomScale}
                rx={3 * zoomScale}
                fill="#0f172a"
                stroke="#06b6d4"
                strokeWidth={0.8 * zoomScale}
              />
              <text
                x="0"
                y={-4 * zoomScale}
                fill="#38bdf8"
                fontSize={Math.max(7, textScale * 0.75)}
                fontWeight="black"
                textAnchor="middle"
                className="font-sans"
              >
                YOUR GUESS
              </text>
            </g>
          </g>
        )}

        {/* Actual Target Pin (Gold Star / Monument Location) */}
        {showTarget && targetPt && (
          <g filter="url(#star-glow)">
            {/* Glowing shockwave ripple */}
            <circle
              cx={targetPt.x}
              cy={targetPt.y}
              r={targetStarRadius * 2}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={1.5 * zoomScale}
              className="animate-ping opacity-60"
            />

            {/* Target Star Marker */}
            <path
              d={`M ${targetPt.x} ${targetPt.y - targetStarRadius}
                  L ${targetPt.x + targetStarRadius * 0.3} ${targetPt.y - targetStarRadius * 0.3}
                  L ${targetPt.x + targetStarRadius} ${targetPt.y}
                  L ${targetPt.x + targetStarRadius * 0.3} ${targetPt.y + targetStarRadius * 0.3}
                  L ${targetPt.x} ${targetPt.y + targetStarRadius}
                  L ${targetPt.x - targetStarRadius * 0.3} ${targetPt.y + targetStarRadius * 0.3}
                  L ${targetPt.x - targetStarRadius} ${targetPt.y}
                  L ${targetPt.x - targetStarRadius * 0.3} ${targetPt.y - targetStarRadius * 0.3} Z`}
              fill="#fbbf24"
              stroke="#ffffff"
              strokeWidth={Math.max(1, 2 * zoomScale)}
            />

            {/* Target Name Banner */}
            {targetPin.label && (
              <g transform={`translate(${targetPt.x}, ${targetPt.y + targetStarRadius + 12 * zoomScale})`}>
                <text
                  x="0"
                  y="0"
                  fill="#fef08a"
                  fontSize={Math.max(9, textScale)}
                  fontWeight="black"
                  textAnchor="middle"
                  className="font-sans uppercase tracking-wider"
                >
                  ⭐ {targetPin.label}
                </text>
              </g>
            )}
          </g>
        )}
      </svg>

      {/* Map Pan & Zoom Controls Overlay */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-30">
        <button
          type="button"
          onClick={() => applyZoom(0.7)}
          className="w-8 h-8 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white font-black text-sm flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-lg cursor-pointer"
          title="Zoom In"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => applyZoom(1.3)}
          className="w-8 h-8 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white font-black text-sm flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-lg cursor-pointer"
          title="Zoom Out"
        >
          −
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          className="w-8 h-8 rounded-xl bg-slate-900/90 border border-slate-700/80 text-amber-300 font-bold text-xs flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-lg cursor-pointer"
          title="Reset View"
        >
          ⟲
        </button>
      </div>

      {/* Touch Instruction Tooltip for Interactive Mode */}
      {interactive && !selectedPt && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-cyan-200 px-3.5 py-1.5 rounded-full text-xs font-bold pointer-events-none shadow-xl flex items-center gap-1.5 animate-pulse">
          <span>📍 Tap anywhere on the map to place your pin</span>
        </div>
      )}
    </div>
  );
}
