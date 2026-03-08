export interface StockfishLine {
  depth: number
  score: number // Centipawns
  mate?: number // Mate in N moves
  pv: string[] // Principal variation: array of UCI moves
  bestMove: string // First move of pv in UCI notation
}

export interface AnalysisState {
  isAnalyzing: boolean
  depth: number
  evaluation: number // Centipawns
  mate: number | null
  lines: StockfishLine[]
  bestMove: string | null
}

// Game Review types
export type MoveClassification =
  | 'brilliant'
  | 'great'
  | 'best'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'book'

export interface MoveAnalysis {
  moveIndex: number
  fen: string
  playedMove: string // UCI
  playedMoveSan: string
  bestMove: string // UCI
  bestMoveSan: string
  evalBefore: number // centipawns, from white's perspective
  evalAfter: number // centipawns, from white's perspective
  mateBefore: number | null
  mateAfter: number | null
  cpLoss: number
  classification: MoveClassification
  isWhiteMove: boolean
  topLines: StockfishLine[]
}

export interface GameReview {
  moves: MoveAnalysis[]
  whiteAccuracy: number
  blackAccuracy: number
  isComplete: boolean
  currentMoveBeingAnalyzed: number
  totalMoves: number
}
