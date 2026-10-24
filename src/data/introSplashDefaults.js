/**
 * Default Intro & Rules Splash Screen Configuration
 * Explains scoring, tie-breaking via speed, question types, and rules.
 */

export const DEFAULT_RULES_LIST = [
  {
    icon: '🎯',
    title: 'Points for Accuracy',
    highlight: 'Earn Points',
    description: 'Take your time to think! Every correct answer earns full points across multiple choice, text input, closest pin map drops, and video rounds.'
  },
  {
    icon: '⚡',
    title: 'Speed is the Tie-Breaker!',
    highlight: 'Tie-Breaker Only',
    description: 'Speed does NOT give bonus points per question. However, your total answer time is tracked! If players tie on score at the end, the lowest total time wins the gold podium!'
  },
  {
    icon: '🗺️',
    title: 'Interactive Question Types',
    highlight: 'Maps & Mystery Video',
    description: 'Drop pins near mystery landmarks, type answers under the wire, and hit the brakes on På Spåret train journeys!'
  },
  {
    icon: '🏆',
    title: 'Play Right to the End',
    highlight: 'Podium Finish',
    description: 'Every single point counts until the final winner reveal. Relax, have fun with friends, and may the best trivia mind win!'
  }
];

export const DEFAULT_INTRO_RULES_SPLASH = {
  id: 'intro-rules-splash',
  type: 'splash',
  badge: 'Quiz Intro & Rules',
  title: 'Welcome to QuizPulse Live!',
  subtitle: 'Grab a drink, get comfortable, and warm up your thumbs! Here is how to play and win.',
  imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
  rules: DEFAULT_RULES_LIST
};
