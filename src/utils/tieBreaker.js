/**
 * Tie-Breaker Utility for QuizPulse
 * 
 * - Calculates total answer response time (sum of timeElapsedSec across all questions)
 * - Ranks players primarily by score (descending), and secondarily by total time (ascending - fastest wins)
 * - Detects dead-heats and podium ties for dramatic speed tie-break reveals
 */

/**
 * Calculates total elapsed time in seconds for all answers submitted by a player.
 * @param {Object} player Player object containing `answers`
 * @returns {number} Total elapsed seconds rounded to 1 decimal place
 */
export function calculatePlayerTotalTime(player) {
  if (!player || !player.answers) return 999999;
  const answers = Array.isArray(player.answers)
    ? player.answers
    : Object.values(player.answers);

  let totalTime = 0;
  answers.forEach((ans) => {
    if (ans && typeof ans === 'object') {
      const t = Number(ans.timeElapsedSec);
      if (Number.isFinite(t) && t >= 0) {
        totalTime += t;
      }
    }
  });

  return parseFloat(totalTime.toFixed(1));
}

/**
 * Sorts and enriches players list with score and speed tie-breaker data.
 * @param {Array} playersList Array of player objects
 * @returns {Array} Sorted and enriched player list
 */
export function rankPlayersWithTieBreak(playersList) {
  if (!Array.isArray(playersList)) return [];

  // Enriched copy with calculated total times
  const enriched = playersList.map((player) => {
    const totalTime = calculatePlayerTotalTime(player);
    return {
      ...player,
      score: Number(player.score || 0),
      totalTime,
      formattedTime: totalTime < 99999 ? `${totalTime.toFixed(1)}s` : '--'
    };
  });

  // Sort: 1) Score descending, 2) Total Time ascending (fastest wins)
  enriched.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.totalTime - b.totalTime;
  });

  // Identify ties and tie-break outcomes
  return enriched.map((player, idx, arr) => {
    const prev = arr[idx - 1];
    const next = arr[idx + 1];
    const isTiedWithPrev = prev && prev.score === player.score;
    const isTiedWithNext = next && next.score === player.score;
    const isTiedScore = Boolean(isTiedWithPrev || isTiedWithNext);

    return {
      ...player,
      isTiedScore,
      wonOnTieBreak: idx === 0 && Boolean(isTiedWithNext) && player.totalTime <= (next?.totalTime || 0),
      lostTieBreak: Boolean(idx > 0 && prev && prev.score === player.score)
    };
  });
}

/**
 * Checks if the 1st place position is involved in a tied score.
 * @param {Array} rankedPlayers Array returned by rankPlayersWithTieBreak
 * @returns {Object} Tie info object
 */
export function detectTopTie(rankedPlayers) {
  if (!Array.isArray(rankedPlayers) || rankedPlayers.length < 2) {
    return {
      hasTopTie: false,
      tiedPlayers: [],
      winner: rankedPlayers?.[0] || null,
      runnerUp: null,
      topScore: rankedPlayers?.[0]?.score || 0,
      timeDifference: 0
    };
  }

  const first = rankedPlayers[0];
  const second = rankedPlayers[1];

  if (!first || !second || first.score !== second.score || first.score === 0) {
    return {
      hasTopTie: false,
      tiedPlayers: [],
      winner: first,
      runnerUp: second,
      topScore: first?.score || 0,
      timeDifference: 0
    };
  }

  // All players sharing the 1st place score
  const tiedPlayers = rankedPlayers.filter((p) => p.score === first.score);
  const timeDifference = parseFloat(Math.max(0, second.totalTime - first.totalTime).toFixed(1));

  return {
    hasTopTie: true,
    tiedPlayers,
    winner: first,
    runnerUp: second,
    topScore: first.score,
    timeDifference
  };
}
