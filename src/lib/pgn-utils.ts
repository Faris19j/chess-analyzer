export function getChesscomAnalysisUrl(gameUrl: string): string {
  // Input:  "https://www.chess.com/game/live/12345678"
  // Output: "https://www.chess.com/analysis/game/live/12345678"
  return gameUrl.replace('chess.com/game/', 'chess.com/analysis/game/')
}

export function extractGameId(gameUrl: string): string {
  // "https://www.chess.com/game/live/12345678" -> "live_12345678"
  const match = gameUrl.match(/chess\.com\/game\/(\w+)\/(\d+)/)
  return match ? `${match[1]}_${match[2]}` : ''
}

export function parseInfoLine(
  line: string
): { depth: number; score: number; mate: number | undefined; pv: string[] } | null {
  if (!line.startsWith('info')) return null

  const depthMatch = line.match(/depth (\d+)/)
  const scoreMatch = line.match(/score (cp|mate) (-?\d+)/)
  const pvMatch = line.match(/ pv (.+)/)

  if (!depthMatch || !scoreMatch) return null

  const isMate = scoreMatch[1] === 'mate'
  const scoreValue = parseInt(scoreMatch[2])

  return {
    depth: parseInt(depthMatch[1]),
    score: isMate ? 0 : scoreValue,
    mate: isMate ? scoreValue : undefined,
    pv: pvMatch ? pvMatch[1].trim().split(' ') : [],
  }
}
