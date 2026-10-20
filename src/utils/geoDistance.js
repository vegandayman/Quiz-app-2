/**
 * Geodesic Distance and Coordinate Utilities for "Closest Wins" Geography Questions
 */

export const LANDMARK_PRESETS = [
  {
    name: 'Eiffel Tower',
    location: 'Paris, France',
    lat: 48.8584,
    lng: 2.2945,
    imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
    hint: 'Completed in 1889, standing 330 meters tall on the Champ de Mars.'
  },
  {
    name: 'Statue of Liberty',
    location: 'New York City, USA',
    lat: 40.6892,
    lng: -74.0445,
    imageUrl: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=1200&q=80',
    hint: 'A gift from France dedicated in October 1886 on Liberty Island.'
  },
  {
    name: 'The Colosseum',
    location: 'Rome, Italy',
    lat: 41.8902,
    lng: 12.4922,
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    hint: 'The largest ancient amphitheatre ever built, begun under Emperor Vespasian.'
  },
  {
    name: 'Taj Mahal',
    location: 'Agra, India',
    lat: 27.1751,
    lng: 78.0421,
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    hint: 'White marble mausoleum commissioned in 1631 by Mughal Emperor Shah Jahan.'
  },
  {
    name: 'Great Pyramids of Giza',
    location: 'Giza, Egypt',
    lat: 29.9792,
    lng: 31.1342,
    imageUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80',
    hint: 'The oldest and only remaining intact wonder of the ancient world.'
  },
  {
    name: 'Sydney Opera House',
    location: 'Sydney, Australia',
    lat: -33.8568,
    lng: 151.2153,
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
    hint: 'Designed by Danish architect Jørn Utzon and opened in 1973 on Bennelong Point.'
  },
  {
    name: 'Machu Picchu',
    location: 'Cusco Region, Peru',
    lat: -13.1631,
    lng: -72.5450,
    imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80',
    hint: '15th-century Inca citadel situated on an Andean mountain ridge at 2,430m.'
  },
  {
    name: 'Christ the Redeemer',
    location: 'Rio de Janeiro, Brazil',
    lat: -22.9519,
    lng: -43.2105,
    imageUrl: 'https://images.unsplash.com/photo-1593995863951-57fa2b45fed3?auto=format&fit=crop&w=1200&q=80',
    hint: 'Art Deco statue atop Corcovado mountain overlooking Guanabara Bay.'
  },
  {
    name: 'Mount Fuji',
    location: 'Honshu, Japan',
    lat: 35.3606,
    lng: 138.7274,
    imageUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1200&q=80',
    hint: 'An active stratovolcano and the highest peak in Japan at 3,776 meters.'
  },
  {
    name: 'Big Ben & Parliament',
    location: 'London, United Kingdom',
    lat: 51.5007,
    lng: -0.1246,
    imageUrl: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=1200&q=80',
    hint: 'The Great Bell and Elizabeth Tower standing at the north end of Westminster Palace.'
  }
];

/**
 * Convert Latitude & Longitude to SVG coordinates (Equirectangular Projection)
 * Default ViewBox: 1000 x 500
 */
export function coordsToPoint(lat, lng, width = 1000, height = 500) {
  const clampedLat = Math.max(-90, Math.min(90, Number(lat) || 0));
  const clampedLng = Math.max(-180, Math.min(180, Number(lng) || 0));
  const x = ((clampedLng + 180) / 360) * width;
  const y = ((90 - clampedLat) / 180) * height;
  return { x, y };
}

/**
 * Convert SVG coordinates back to Latitude & Longitude
 */
export function pointToCoords(x, y, width = 1000, height = 500) {
  const lng = (x / width) * 360 - 180;
  const lat = 90 - (y / height) * 180;
  return {
    lat: parseFloat(Math.max(-85, Math.min(85, lat)).toFixed(4)),
    lng: parseFloat(Math.max(-180, Math.min(180, lng)).toFixed(4))
  };
}

/**
 * Haversine Great-Circle Distance between two coordinates in kilometers or miles
 */
export function haversineDistance(lat1, lon1, lat2, lon2, unit = 'km') {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return Infinity;
  }
  const toRad = (angle) => (angle * Math.PI) / 180;
  const R = unit === 'mi' ? 3958.8 : 6371; // Earth mean radius in miles or kilometers

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance);
}

/**
 * Format distance cleanly with commas and units (e.g., "142 km" or "88 mi")
 */
export function formatDistance(distance, unit = 'km') {
  if (distance === undefined || isNaN(distance) || distance === Infinity) return 'N/A';
  const formatted = Math.round(distance).toLocaleString();
  return `${formatted} ${unit === 'mi' ? 'mi' : 'km'}`;
}

/**
 * Rank players by proximity to target coordinates
 */
export function findClosestPlayers(targetLat, targetLng, playersList, unit = 'km') {
  if (!playersList || !Array.isArray(playersList)) return [];

  const evaluated = playersList.map((player) => {
    const lat = player.guessLat ?? player.lat;
    const lng = player.guessLng ?? player.lng;
    const hasGuessed = lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng);

    const distance = hasGuessed
      ? haversineDistance(targetLat, targetLng, Number(lat), Number(lng), unit)
      : Infinity;

    return {
      ...player,
      hasGuessed,
      lat: Number(lat),
      lng: Number(lng),
      distance,
      distanceFormatted: hasGuessed ? formatDistance(distance, unit) : 'No Pin Placed'
    };
  });

  // Filter only players who placed a pin and sort by distance ascending
  const withGuesses = evaluated.filter((p) => p.hasGuessed);
  withGuesses.sort((a, b) => a.distance - b.distance);

  const minDistance = withGuesses.length > 0 ? withGuesses[0].distance : Infinity;

  // Mark winner(s) - Option A: strict minimum distance
  const ranked = withGuesses.map((p, index) => ({
    ...p,
    rank: index + 1,
    isWinner: p.distance === minDistance && p.distance !== Infinity
  }));

  const withoutGuesses = evaluated
    .filter((p) => !p.hasGuessed)
    .map((p) => ({
      ...p,
      rank: null,
      isWinner: false
    }));

  return [...ranked, ...withoutGuesses];
}

/**
 * Calculate bounding box { minLat, maxLat, minLng, maxLng }
 * encompassing the target pin and at least the top 2 closest guesses.
 */
export function calculateFocusBounds(targetLat, targetLng, rankedPlayers = []) {
  const points = [];
  if (targetLat !== undefined && targetLng !== undefined && !isNaN(targetLat) && !isNaN(targetLng)) {
    points.push({ lat: Number(targetLat), lng: Number(targetLng) });
  }

  const guesses = (rankedPlayers || []).filter(
    (p) => p.hasGuessed && p.lat !== undefined && p.lng !== undefined && !isNaN(p.lat) && !isNaN(p.lng)
  );

  // Take at least the closest 2 guesses
  const closestGuesses = guesses.slice(0, 2);
  closestGuesses.forEach((p) => {
    points.push({ lat: Number(p.lat), lng: Number(p.lng) });
  });

  if (points.length === 0) {
    return { minLat: -30, maxLat: 60, minLng: -120, maxLng: 120 };
  }

  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;

  points.forEach((pt) => {
    if (pt.lat < minLat) minLat = pt.lat;
    if (pt.lat > maxLat) maxLat = pt.lat;
    if (pt.lng < minLng) minLng = pt.lng;
    if (pt.lng > maxLng) maxLng = pt.lng;
  });

  // Ensure minimum spread around the points so the zoom feels natural and visible
  const minSpread = 6; // At least ~6 degrees padding
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;

  if (latDiff < minSpread) {
    const pad = (minSpread - latDiff) / 2;
    minLat = Math.max(-85, minLat - pad);
    maxLat = Math.min(85, maxLat + pad);
  }
  if (lngDiff < minSpread) {
    const pad = (minSpread - lngDiff) / 2;
    minLng = Math.max(-175, minLng - pad);
    maxLng = Math.min(175, maxLng + pad);
  }

  return { minLat, maxLat, minLng, maxLng };
}
