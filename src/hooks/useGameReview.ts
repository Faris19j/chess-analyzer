'use client'
import { useState, useRef, useCallback } from 'react'
import { Move } from 'chess.js'
import type { GameReview, MoveAnalysis, StockfishLine } from '@/types/analysis'
import { parseInfoLine } from '@/lib/pgn-utils'
import { classifyMove, calculateAccuracy, effectiveEval, uciToSan } from '@/lib/analysis-utils'

const ANALYSIS_DEPTH = 12

interface PositionResult {
  eval: number // centipawns from side-to-move perspective
  mate: number | null
  bestMove: string // UCI
  topLines: StockfishLine[]
}

export function useGameReview() {
  const [review, setReview] = useState<GameReview | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const workerRef = useRef<Worker | null>(null)
  const cancelRef = useRef(false)

  const analyzePosition = useCallback(
    (worker: Worker, fen: string): Promise<PositionResult> => {
      return new Promise((resolve) => {
        const linesMap = new Map<number, StockfishLine>()
        let bestEval = 0
        let bestMate: number | null = null
        let bestMove = ''

        const handler = (event: MessageEvent<string>) => {
          const output = event.data

          if (output.startsWith('info')) {
            const parsed = parseInfoLine(output)
            if (parsed) {
              const line: StockfishLine = {
                depth: parsed.depth,
                score: parsed.score,
                mate: parsed.mate,
                pv: parsed.pv,
                bestMove: parsed.pv[0] || '',
              }
              linesMap.set(parsed.depth, line)
            }
          } else if (output.startsWith('bestmove')) {
            worker.removeEventListener('message', handler)

            // Get the deepest line
            const lines = Array.from(linesMap.values()).sort(
              (a, b) => b.depth - a.depth
            )
            if (lines.length > 0) {
              const top = lines[0]
              bestEval = top.mate != null ? 0 : top.score
              bestMate = top.mate ?? null
              bestMove = top.bestMove
            }

            resolve({
              eval: bestEval,
              mate: bestMate,
              bestMove,
              topLines: lines.slice(0, 3),
            })
          }
        }

        worker.addEventListener('message', handler)
        worker.postMessage('stop')
        worker.postMessage(`position fen ${fen}`)
        worker.postMessage(`go depth ${ANALYSIS_DEPTH}`)
      })
    },
    []
  )

  const startReview = useCallback(
    async (fens: string[], moves: Move[]) => {
      if (isReviewing) return
      cancelRef.current = false
      setIsReviewing(true)

      const totalMoves = moves.length

      setReview({
        moves: [],
        whiteAccuracy: 0,
        blackAccuracy: 0,
        isComplete: false,
        currentMoveBeingAnalyzed: 0,
        totalMoves,
      })

      // Create dedicated worker for batch analysis
      const worker = new Worker('/stockfish-bridge.worker.js')
      workerRef.current = worker

      // Wait for UCI ready
      await new Promise<void>((resolve) => {
        const handler = (event: MessageEvent<string>) => {
          if (event.data.startsWith('uciok')) {
            worker.removeEventListener('message', handler)
            resolve()
          }
        }
        worker.addEventListener('message', handler)
        worker.postMessage('uci')
      })

      // Wait for isready
      await new Promise<void>((resolve) => {
        const handler = (event: MessageEvent<string>) => {
          if (event.data.startsWith('readyok')) {
            worker.removeEventListener('message', handler)
            resolve()
          }
        }
        worker.addEventListener('message', handler)
        worker.postMessage('isready')
      })

      // Analyze all positions: N+1 positions for N moves
      // positionResults[i] = analysis of fens[i]
      const positionResults: PositionResult[] = []

      for (let i = 0; i <= totalMoves; i++) {
        if (cancelRef.current) break

        setReview((prev) =>
          prev
            ? { ...prev, currentMoveBeingAnalyzed: i }
            : null
        )

        const result = await analyzePosition(worker, fens[i])
        positionResults.push(result)
      }

      if (cancelRef.current) {
        worker.postMessage('quit')
        worker.terminate()
        workerRef.current = null
        setIsReviewing(false)
        return
      }

      // Build MoveAnalysis array
      const moveAnalyses: MoveAnalysis[] = []

      for (let i = 0; i < totalMoves; i++) {
        const isWhiteMove = i % 2 === 0
        const before = positionResults[i]
        const after = positionResults[i + 1]

        // Normalize evals to white's perspective
        // Stockfish reports from side-to-move perspective
        const evalBeforeWhite = isWhiteMove
          ? effectiveEval(before.eval, before.mate)
          : -effectiveEval(before.eval, before.mate)
        const evalAfterWhite = !isWhiteMove
          ? effectiveEval(after.eval, after.mate)
          : -effectiveEval(after.eval, after.mate)

        const mateBeforeWhite = before.mate != null
          ? (isWhiteMove ? before.mate : -before.mate)
          : null
        const mateAfterWhite = after.mate != null
          ? (!isWhiteMove ? after.mate : -after.mate)
          : null

        // CP loss from the moving player's perspective
        const evalBeforePlayer = isWhiteMove ? evalBeforeWhite : -evalBeforeWhite
        const evalAfterPlayer = isWhiteMove ? evalAfterWhite : -evalAfterWhite
        const cpLoss = Math.max(0, evalBeforePlayer - evalAfterPlayer)

        const playedMove = moves[i].lan || `${moves[i].from}${moves[i].to}${moves[i].promotion || ''}`
        const bestMoveUci = before.bestMove
        const bestMoveSan = uciToSan(fens[i], bestMoveUci)

        const classification = classifyMove(
          cpLoss,
          playedMove,
          bestMoveUci,
          evalBeforeWhite,
          evalAfterWhite,
          isWhiteMove,
          fens[i]
        )

        moveAnalyses.push({
          moveIndex: i,
          fen: fens[i],
          playedMove,
          playedMoveSan: moves[i].san,
          bestMove: bestMoveUci,
          bestMoveSan,
          evalBefore: evalBeforeWhite,
          evalAfter: evalAfterWhite,
          mateBefore: mateBeforeWhite,
          mateAfter: mateAfterWhite,
          cpLoss,
          classification,
          isWhiteMove,
          topLines: before.topLines,
        })
      }

      const whiteAccuracy = calculateAccuracy(moveAnalyses, true)
      const blackAccuracy = calculateAccuracy(moveAnalyses, false)

      setReview({
        moves: moveAnalyses,
        whiteAccuracy,
        blackAccuracy,
        isComplete: true,
        currentMoveBeingAnalyzed: totalMoves,
        totalMoves,
      })

      setIsReviewing(false)

      // Cleanup worker
      worker.postMessage('quit')
      worker.terminate()
      workerRef.current = null
    },
    [isReviewing, analyzePosition]
  )

  const cancelReview = useCallback(() => {
    cancelRef.current = true
    if (workerRef.current) {
      workerRef.current.postMessage('stop')
    }
  }, [])

  return { review, isReviewing, startReview, cancelReview }
}
