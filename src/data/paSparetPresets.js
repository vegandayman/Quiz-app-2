/**
 * På Spåret ("On the Track") Question Presets, YouTube Helper & Web Audio Synthesizer
 */

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
 * Web Audio API synthesized Train Whistle & Chime Sound FX
 * Zero external audio files, works completely offline and in sandbox
 */
export function playTrainWhistleSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Two-tone steam/air train whistle chord (F#5 + A5)
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(740, now);
    osc1.frequency.exponentialRampToValueAtTime(760, now + 0.3);
    osc1.frequency.exponentialRampToValueAtTime(730, now + 0.8);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(900, now + 0.3);
    osc2.frequency.exponentialRampToValueAtTime(870, now + 0.8);

    // Envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gainNode.gain.setValueAtTime(0.2, now + 0.6);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    // Gentle low-pass filter to soften the whistle
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.95);
    osc2.stop(now + 0.95);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export function playEmergencyBrakeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    // Mechanical brake hiss + bell
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export function playClueChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Crisp high chime (E6)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1318.5, now);
    osc.frequency.setValueAtTime(1760, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.75);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

/**
 * 5 Curated World-Class Train Journey Presets for "På Spåret"
 */
export const PA_SPARET_PRESETS = [
  {
    name: 'Stockholm → Gothenburg (Classic På Spåret)',
    country: 'Sweden',
    destination: 'Gothenburg',
    acceptedAnswers: 'Gothenburg, Göteborg, Goteborg',
    youtubeUrl: 'https://www.youtube.com/watch?v=q6E2XgS_c_o', // Scenic cab ride in Sweden
    videoStartTime: 20,
    duration: 90,
    clues: [
      { tier: 10, timeSec: 0, text: 'We depart towards a city founded on granite and salt water, where 17th-century Dutch canal planners left their geometric mark.' },
      { tier: 8, timeSec: 20, text: 'In this coastal powerhouse, the largest port in the Nordic region welcomes giant freighters beneath the Älvsborg suspension bridge.' },
      { tier: 6, timeSec: 40, text: 'Safety first! The three-point seatbelt and iconic boxy station wagons were born here, alongside Scandinavia’s grandest amusement park.' },
      { tier: 4, timeSec: 60, text: 'Sweden’s second city on the Kattegat sea, where blue-and-white trams glide past the Fish Church and Ullevi stadium.' },
      { tier: 2, timeSec: 80, text: 'Starts with G! From Avenyn to Poseidon’s fountain, welcome to Göteborg!' }
    ],
    secretNote: 'Founded in 1621 by King Gustavus Adolphus ("Here the city shall lie!"). Home of Volvo, Hasselblad cameras, and Europe’s iconic Liseberg amusement park.'
  },
  {
    name: 'Tokyo → Kyoto (Shinkansen Bullet Train)',
    country: 'Japan',
    destination: 'Kyoto',
    acceptedAnswers: 'Kyoto, Kyōto, Miyako',
    youtubeUrl: 'https://www.youtube.com/watch?v=7pL_bQ_2V9c', // Shinkansen cab ride
    videoStartTime: 15,
    duration: 90,
    clues: [
      { tier: 10, timeSec: 0, text: 'We ride the gleaming rails away from the hyper-modern metropolis toward the ancient home of the Chrysanthemum Throne.' },
      { tier: 8, timeSec: 20, text: 'Spared from wartime bombing due to its peerless cultural heritage, over a thousand wooden temples rest in these misty mountain foothills.' },
      { tier: 6, timeSec: 40, text: 'Ten thousand vermilion torii gates climb Mount Inari, while geishas walk through the lantern-lit wooden teahouses of Gion.' },
      { tier: 4, timeSec: 60, text: 'The imperial capital of Japan for over a thousand years before Tokyo took the crown in 1868.' },
      { tier: 2, timeSec: 80, text: 'Rearrange the letters of Tokyo and you arrive in the city of the Golden Pavilion (Kinkaku-ji)!' }
    ],
    secretNote: 'Kyoto was Japan’s imperial capital from 794 to 1868. It boasts 17 UNESCO World Heritage sites including Kiyomizu-dera and Kinkaku-ji.'
  },
  {
    name: 'London → Edinburgh (Flying Scotsman)',
    country: 'United Kingdom',
    destination: 'Edinburgh',
    acceptedAnswers: 'Edinburgh, Edinburg, Dun Eideann',
    youtubeUrl: 'https://www.youtube.com/watch?v=o6g3U4j9VbA', // East Coast cab ride
    videoStartTime: 25,
    duration: 90,
    clues: [
      { tier: 10, timeSec: 0, text: 'Speeding north from King’s Cross past ancient cathedral spires, we race toward a volcanic crag steeped in royal drama.' },
      { tier: 8, timeSec: 20, text: 'Crossing the historic River Tweed, our destination inspired tales of young wizards, iconic detectives, and body snatchers.' },
      { tier: 6, timeSec: 40, text: 'An extinct volcano named Arthur’s Seat watches over a medieval Old Town and Georgian New Town separated by Princes Street Gardens.' },
      { tier: 4, timeSec: 60, text: 'Scotland’s historic capital, guarded by an ancient fortress housing the Honours of Scotland and the Stone of Scone.' },
      { tier: 2, timeSec: 80, text: 'Home to the world’s largest arts festival, the Royal Mile, and Edinburgh Castle!' }
    ],
    secretNote: 'Edinburgh Castle sits atop a 350-million-year-old volcanic plug. The city was the first in the world to establish its own fire service (1824).'
  },
  {
    name: 'Glacier Express → St. Moritz (Swiss Alps)',
    country: 'Switzerland',
    destination: 'St. Moritz',
    acceptedAnswers: 'St. Moritz, Saint Moritz, Sankt Moritz, St Moritz, San Murezzan',
    youtubeUrl: 'https://www.youtube.com/watch?v=4Zp0F4y7E9A', // Glacier Express Landwasser viaduct
    videoStartTime: 30,
    duration: 90,
    clues: [
      { tier: 10, timeSec: 0, text: 'Climbing narrow-gauge alpine rails across dizzying stone viaducts and high snowy passes in the canton of Graubünden.' },
      { tier: 8, timeSec: 20, text: 'Basking in an average of 322 sunny days per year, this lakeside haven pioneered modern winter sports tourism in 1864.' },
      { tier: 6, timeSec: 40, text: 'Sip champagne beside a frozen lake where polo on snow was invented, beneath the towering shadow of Piz Nair.' },
      { tier: 4, timeSec: 60, text: 'Legendary host of both the 1928 and 1948 Winter Olympics, known worldwide as the glamorous crown of the Engadin valley.' },
      { tier: 2, timeSec: 80, text: 'Switzerland’s premier luxury ski resort, St. Moritz!' }
    ],
    secretNote: 'St. Moritz hosted the Winter Olympics twice (1928 & 1948) and is celebrated for its dry, sparkling "champagne climate" and Cresta Run ice track.'
  },
  {
    name: 'Bergensbanen: Oslo → Bergen (Norwegian Fjords)',
    country: 'Norway',
    destination: 'Bergen',
    acceptedAnswers: 'Bergen, Bjoergvin',
    youtubeUrl: 'https://www.youtube.com/watch?v=Gk30sRsmH1k', // Bergensbanen fjord cab ride
    videoStartTime: 20,
    duration: 90,
    clues: [
      { tier: 10, timeSec: 0, text: 'Crossing Europe’s highest windswept mountain plateau, we plunge through granite tunnels toward the deep North Sea coast.' },
      { tier: 8, timeSec: 20, text: 'Celebrated as the city of seven mountains and umbrellas, where rain paints the cobblestone streets over 200 days a year.' },
      { tier: 6, timeSec: 40, text: 'Centuries of German Hanseatic merchants traded Arctic cod along the colorful wooden harbor front of Bryggen.' },
      { tier: 4, timeSec: 60, text: 'The Gateway to the Norwegian Fjords, and birthplace of the legendary Romantic composer Edvard Grieg.' },
      { tier: 2, timeSec: 80, text: 'Norway’s historic second city and fjord capital, Bergen!' }
    ],
    secretNote: 'Bryggen wharf was founded around 1070 and became an official Hanseatic League trading post in 1360. It remains a UNESCO World Heritage treasure.'
  }
];
