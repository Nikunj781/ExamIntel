import examData from '../data/examData.json'

/**
 * Predict JEE Main rank from score (0–300)
 * Formula is an approximation based on historical NTA data trends.
 */
export function predictJeeMainRank(score) {
  if (score <= 0)   return null
  if (score >= 300) return 1
  // Piecewise exponential approximation
  if (score >= 250) return Math.round(50   + (300 - score) * 10)
  if (score >= 200) return Math.round(550  + (250 - score) * 100)
  if (score >= 150) return Math.round(5550 + (200 - score) * 500)
  if (score >= 100) return Math.round(30550 + (150 - score) * 1500)
  return Math.round(105550 + (100 - score) * 3000)
}

/**
 * Predict NEET rank from score (0–720)
 */
export function predictNeetRank(score) {
  if (score <= 0)   return null
  if (score >= 720) return 1
  if (score >= 650) return Math.round(100  + (720 - score) * 100)
  if (score >= 550) return Math.round(7100 + (650 - score) * 500)
  if (score >= 450) return Math.round(57100 + (550 - score) * 2000)
  return Math.round(257100 + (450 - score) * 5000)
}

/**
 * Predict BITSAT rank from score (0–390)
 */
export function predictBitsatRank(score) {
  if (score <= 0)   return null
  if (score >= 390) return 1
  if (score >= 350) return Math.round(10  + (390 - score) * 5)
  if (score >= 300) return Math.round(210 + (350 - score) * 20)
  if (score >= 250) return Math.round(1210 + (300 - score) * 50)
  return Math.round(3710 + (250 - score) * 100)
}

/**
 * Predict JEE Advanced rank from score (0–360)
 */
export function predictJeeAdvRank(score) {
  if (score <= 0)   return null
  if (score >= 360) return 1
  if (score >= 300) return Math.round(50  + (360 - score) * 20)
  if (score >= 200) return Math.round(1250 + (300 - score) * 80)
  return Math.round(9250 + (200 - score) * 150)
}

/**
 * Main predictor: given examId + score → { rank, colleges[] }
 */
export function runPredictor(examId, score) {
  const scoreNum = Number(score)
  let rank = null

  switch (examId) {
    case 'jee-main':     rank = predictJeeMainRank(scoreNum); break
    case 'jee-advanced': rank = predictJeeAdvRank(scoreNum);  break
    case 'neet':         rank = predictNeetRank(scoreNum);    break
    case 'bitsat':       rank = predictBitsatRank(scoreNum);  break
    default:             rank = null
  }

  const allColleges = examData.colleges[examId] || []
  const matches = rank
    ? allColleges.filter(c => c.cutoffRank >= rank)
    : []

  return { rank, matches }
}

/**
 * Format rank nicely
 */
export function formatRank(rank) {
  if (!rank) return '—'
  if (rank <= 100)    return `Top ${rank} 🏆`
  if (rank <= 1000)   return rank.toLocaleString('en-IN')
  if (rank <= 100000) return `${(rank / 1000).toFixed(1)}k`
  return `${(rank / 100000).toFixed(2)}L`
}

/**
 * Score-to-percentile helper (JEE Main specific)
 */
export function scoreToPercentile(score, maxScore = 300) {
  const pct = (score / maxScore) * 100
  if (pct >= 99.9) return '99.9+'
  return pct.toFixed(2)
}
