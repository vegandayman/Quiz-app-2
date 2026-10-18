/**
 * Intelligent Answer Matcher for Free-Input Questions
 *
 * Provides forgiving fuzzy matching for free-text quiz answers:
 * - Strips punctuation, dashes, quotes, and extraneous spacing
 * - Case-insensitive & diacritic/accent normalization (e.g. Café -> cafe)
 * - Phonetic & common letter substitutions ('y' <-> 'i', 'ph' <-> 'f')
 * - Levenshtein edit distance buffer scaled by answer length
 * - Support for common abbreviations (e.g. "mt" <-> "mount", "st" <-> "saint")
 * - Support for optional accepted alternative answers (comma-separated or array)
 *
 * Examples:
 *   Target: "Spider-Man" -> matches "spiderman", "spyderman", "spider man", "Spider-man!"
 *   Target: "Mount Everest" -> matches "Mt Everest", "mt everest", "mount everst"
 */

// Compute Levenshtein distance between two strings
export function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = [];
  for (let j = 0; j <= b.length; j++) {
    row[j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      let val;
      if (a[i - 1] === b[j - 1]) {
        val = row[j - 1];
      } else {
        val = Math.min(
          row[j - 1] + 1, // substitution
          prev + 1,       // insertion
          row[j] + 1       // deletion
        );
      }
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }

  return row[b.length];
}

// Remove accents and convert to lowercase
export function normalizeText(str = '') {
  if (typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Keep only alphanumeric characters
export function toAlphaNumeric(str = '') {
  return normalizeText(str).replace(/[^a-z0-9]/g, '');
}

// Normalize common contractions & abbreviations
export function expandAbbreviations(str = '') {
  return normalizeText(str)
    .replace(/\bmt\b/g, 'mount')
    .replace(/\bst\b/g, 'saint')
    .replace(/\bdr\b/g, 'doctor')
    .replace(/\bu\.s\.a?\b/g, 'usa')
    .replace(/\bu\.k\b/g, 'uk');
}

// Phonetic simplified transformation ('y' to 'i', 'ph' to 'f', repeated letters collapsed)
export function phoneticSimplify(str = '') {
  return toAlphaNumeric(str)
    .replace(/ph/g, 'f')
    .replace(/y/g, 'i')
    .replace(/c([eiy])/g, 's$1')
    .replace(/c/g, 'k')
    .replace(/(.)\1+/g, '$1'); // collapse double consonants/vowels
}

// Strip leading English articles
export function stripArticles(str = '') {
  return normalizeText(str).replace(/^(the|a|an)\s+/i, '');
}

/**
 * Compares player input against a single target string
 */
export function matchSingleAnswer(playerInput, target) {
  if (!playerInput || !target) return { isMatch: false, similarity: 0, reason: 'empty' };

  const normPlayer = normalizeText(playerInput);
  const normTarget = normalizeText(target);

  // 1. Exact match (case insensitive, trimmed)
  if (normPlayer === normTarget) {
    return { isMatch: true, similarity: 1, reason: 'exact' };
  }

  // 2. Alphanumeric match (ignoring dashes, spaces, punctuation like "Spider-Man" -> "spiderman")
  const alphaPlayer = toAlphaNumeric(playerInput);
  const alphaTarget = toAlphaNumeric(target);

  if (alphaPlayer.length > 0 && alphaPlayer === alphaTarget) {
    return { isMatch: true, similarity: 1, reason: 'punctuation_stripped' };
  }

  // 3. Article-stripped match (e.g. "The Beatles" vs "Beatles")
  const noArtPlayer = toAlphaNumeric(stripArticles(playerInput));
  const noArtTarget = toAlphaNumeric(stripArticles(target));
  if (noArtPlayer.length > 0 && (noArtPlayer === noArtTarget || noArtPlayer === alphaTarget || alphaPlayer === noArtTarget)) {
    return { isMatch: true, similarity: 0.98, reason: 'article_stripped' };
  }

  // 4. Expanded abbreviations (e.g. "Mt Everest" vs "Mount Everest")
  const expPlayer = toAlphaNumeric(expandAbbreviations(playerInput));
  const expTarget = toAlphaNumeric(expandAbbreviations(target));
  if (expPlayer.length > 0 && expPlayer === expTarget) {
    return { isMatch: true, similarity: 0.98, reason: 'abbreviation_expanded' };
  }

  // 5. Phonetic simplification ('y' <-> 'i', collapse duplicates e.g. "spyderman" -> "spiderman")
  const phonPlayer = phoneticSimplify(playerInput);
  const phonTarget = phoneticSimplify(target);
  if (phonPlayer.length > 0 && phonPlayer === phonTarget) {
    return { isMatch: true, similarity: 0.95, reason: 'phonetic_variant' };
  }

  // 6. Levenshtein fuzzy distance buffer
  // Calculate max allowed distance based on target length
  const targetLen = alphaTarget.length;
  let maxAllowedDist = 0;

  if (targetLen <= 3) {
    maxAllowedDist = 0; // Very short answers (e.g. "cat", "pi", "sun") must match closely
  } else if (targetLen <= 5) {
    maxAllowedDist = 1; // 1 typo allowed (e.g. "paris" -> "pariss", "tokyo" -> "tokio")
  } else if (targetLen <= 8) {
    maxAllowedDist = 2; // 2 typos allowed (e.g. "jupiter" -> "jupitor")
  } else if (targetLen <= 12) {
    maxAllowedDist = 2; // e.g. "spiderman" (9 chars) vs "spyderman" (1 char diff)
  } else {
    maxAllowedDist = Math.max(2, Math.floor(targetLen * 0.25)); // ~25% typo buffer for long names
  }

  const dist = levenshteinDistance(alphaPlayer, alphaTarget);
  const similarity = 1 - (dist / Math.max(alphaPlayer.length, alphaTarget.length, 1));

  if (dist <= maxAllowedDist && similarity >= 0.72) {
    return { isMatch: true, similarity, reason: `fuzzy_typo_buffer (dist=${dist})` };
  }

  // Also test Levenshtein on phonetically simplified forms
  const phonDist = levenshteinDistance(phonPlayer, phonTarget);
  const phonSimilarity = 1 - (phonDist / Math.max(phonPlayer.length, phonTarget.length, 1));
  if (phonDist <= maxAllowedDist && phonSimilarity >= 0.70) {
    return { isMatch: true, similarity: phonSimilarity, reason: `phonetic_fuzzy (dist=${phonDist})` };
  }

  return { isMatch: false, similarity, reason: 'no_match' };
}

/**
 * Main evaluation function
 * Evaluates player input against primary correct answer and any optional accepted answers.
 *
 * @param {string} playerInput - What the player typed in the text box
 * @param {string} correctAnswer - The main correct answer configured in QuizMaker
 * @param {Array<string>|string} acceptedAnswers - Optional comma-separated string or array of alternative answers
 * @returns {{ isCorrect: boolean, similarity: number, matchedAnswer: string, reason: string }}
 */
export function checkFreeInputAnswer(playerInput, correctAnswer, acceptedAnswers = []) {
  if (!playerInput || typeof playerInput !== 'string') {
    return { isCorrect: false, similarity: 0, matchedAnswer: '', reason: 'no_input' };
  }

  // Collect all valid target answers
  const targets = [];
  if (correctAnswer && typeof correctAnswer === 'string' && correctAnswer.trim()) {
    targets.push(correctAnswer.trim());
  }

  if (Array.isArray(acceptedAnswers)) {
    acceptedAnswers.forEach((ans) => {
      if (typeof ans === 'string' && ans.trim()) targets.push(ans.trim());
    });
  } else if (typeof acceptedAnswers === 'string' && acceptedAnswers.trim()) {
    acceptedAnswers
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((ans) => targets.push(ans));
  }

  if (targets.length === 0) {
    return { isCorrect: false, similarity: 0, matchedAnswer: '', reason: 'no_target_answer' };
  }

  let bestResult = { isCorrect: false, similarity: 0, matchedAnswer: '', reason: 'no_match' };

  for (const target of targets) {
    const res = matchSingleAnswer(playerInput, target);
    if (res.isMatch) {
      return {
        isCorrect: true,
        similarity: res.similarity,
        matchedAnswer: target,
        reason: res.reason
      };
    }
    if (res.similarity > bestResult.similarity) {
      bestResult = {
        isCorrect: false,
        similarity: res.similarity,
        matchedAnswer: target,
        reason: res.reason
      };
    }
  }

  return bestResult;
}
