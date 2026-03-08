import { Chess } from 'chess.js'
import { MoveClassification, MoveAnalysis } from '@/types/analysis'

// Classification color constants (chess.com style)
export const CLASSIFICATION_COLORS: Record<MoveClassification, string> = {
  brilliant: '#1cada8',
  great: '#5c8bb0',
  best: '#96bc4b',
  excellent: '#96bc4b',
  good: '#96bc4b',
  inaccuracy: '#e6a827',
  mistake: '#e68a27',
  blunder: '#ca3431',
  book: '#a88865',
}

export const CLASSIFICATION_SYMBOLS: Record<MoveClassification, string> = {
  brilliant: '!!',
  great: '!',
  best: '★',
  excellent: '○',
  good: '○',
  inaccuracy: '?!',
  mistake: '?',
  blunder: '??',
  book: '📖',
}

export const CLASSIFICATION_LABELS: Record<MoveClassification, string> = {
  brilliant: 'Brilliant',
  great: 'Great Move',
  best: 'Best Move',
  excellent: 'Excellent',
  good: 'Good',
  inaccuracy: 'Inaccuracy',
  mistake: 'Mistake',
  blunder: 'Blunder',
  book: 'Book',
}

// Convert mate score to centipawn equivalent for comparison
export function mateToCP(mate: number | null | undefined): number {
  if (mate == null) return 0
  return mate > 0 ? 10000 - mate * 10 : -10000 - mate * 10
}

// Get effective eval in centipawns (handles mate scores)
export function effectiveEval(cp: number, mate: number | null | undefined): number {
  if (mate != null) return mateToCP(mate)
  return cp
}

// Win probability using sigmoid (chess.com CAPS-style)
function winProbability(cp: number): number {
  return 1 / (1 + Math.pow(10, -cp / 400))
}

// Classify a move based on centipawn loss and context
export function classifyMove(
  cpLoss: number,
  playedMove: string,
  bestMove: string,
  evalBefore: number,
  evalAfter: number,
  isWhiteMove: boolean,
  fen: string
): MoveClassification {
  // If played the engine's top choice
  if (playedMove === bestMove || cpLoss <= 0) {
    return 'best'
  }

  // Check for brilliant: sacrifice with very low cp loss
  if (cpLoss < 10) {
    try {
      const chess = new Chess(fen)
      const move = chess.move(playedMove)
      if (move && move.captured) {
        // Piece sacrifice: captured piece is worth less than the moved piece
        const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
        const movedValue = pieceValues[move.piece] || 0
        const capturedValue = move.captured ? pieceValues[move.captured] || 0 : 0
        if (movedValue > capturedValue + 1) {
          return 'brilliant'
        }
      }
    } catch {
      // Fall through to normal classification
    }

    // Great move: turns a losing position into equal/winning
    const signedBefore = isWhiteMove ? evalBefore : -evalBefore
    const signedAfter = isWhiteMove ? evalAfter : -evalAfter
    if (signedBefore < -100 && signedAfter > -30) {
      return 'great'
    }

    return 'excellent'
  }

  if (cpLoss < 30) return 'good'
  if (cpLoss < 90) return 'inaccuracy'
  if (cpLoss < 200) return 'mistake'
  return 'blunder'
}

// Calculate accuracy for one side (CAPS-style)
export function calculateAccuracy(moves: MoveAnalysis[], isWhite: boolean): number {
  const playerMoves = moves.filter((m) => m.isWhiteMove === isWhite)
  if (playerMoves.length === 0) return 100

  let totalWinProbLoss = 0
  for (const move of playerMoves) {
    const wpBefore = winProbability(move.evalBefore)
    const wpAfter = winProbability(move.evalAfter)
    // Win prob loss from the moving player's perspective
    const loss = isWhite ? wpBefore - wpAfter : wpAfter - wpBefore
    totalWinProbLoss += Math.max(0, loss)
  }

  const avgLoss = totalWinProbLoss / playerMoves.length
  // Convert to accuracy percentage (0 loss = 100%, higher loss = lower accuracy)
  const accuracy = Math.max(0, Math.min(100, 100 * (1 - avgLoss)))
  return Math.round(accuracy * 10) / 10
}

// Convert UCI move to SAN notation
export function uciToSan(fen: string, uciMove: string): string {
  try {
    const chess = new Chess(fen)
    const from = uciMove.substring(0, 2)
    const to = uciMove.substring(2, 4)
    const promotion = uciMove.length > 4 ? uciMove[4] : undefined
    const result = chess.move({ from, to, promotion })
    return result?.san ?? uciMove
  } catch {
    return uciMove
  }
}

// Extract from/to squares from UCI move for board arrows
export function uciToArrow(uciMove: string): [string, string] {
  const from = uciMove.substring(0, 2)
  const to = uciMove.substring(2, 4)
  return [from, to]
}

// Should this classification show a dot in the move list?
export function shouldShowDot(classification: MoveClassification): boolean {
  return ['brilliant', 'great', 'blunder', 'mistake', 'inaccuracy'].includes(classification)
}

// Clamp eval for display purposes
export function clampEval(cp: number): number {
  return Math.max(-1000, Math.min(1000, cp))
}
