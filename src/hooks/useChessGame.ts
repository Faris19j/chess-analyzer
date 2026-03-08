'use client'
import { Chess, Move } from 'chess.js'
import { useState, useMemo, useCallback } from 'react'

export function useChessGame(pgn: string) {
  const [moveIndex, setMoveIndex] = useState(-1) // -1 = starting position

  // Parse PGN once, extract all positions as FEN strings
  const { moves, fens, headers } = useMemo(() => {
    try {
      const chess = new Chess()
      chess.loadPgn(pgn)
      const history = chess.history({ verbose: true })

      // Replay from start to capture FEN at each move
      const tempChess = new Chess()
      const fenList = [tempChess.fen()] // index 0 = starting FEN
      for (const move of history) {
        tempChess.move(move)
        fenList.push(tempChess.fen())
      }

      return {
        moves: history,
        fens: fenList,
        headers: chess.header(),
      }
    } catch (e) {
      console.error('Failed to parse PGN:', e)
      return {
        moves: [],
        fens: [new Chess().fen()],
        headers: {},
      }
    }
  }, [pgn])

  const currentFen = fens[moveIndex + 1] ?? fens[0]
  const currentMove = moveIndex >= 0 ? moves[moveIndex] : null

  const goToMove = useCallback((index: number) => {
    setMoveIndex(Math.max(-1, Math.min(index, moves.length - 1)))
  }, [moves.length])

  const goForward = useCallback(() => goToMove(moveIndex + 1), [moveIndex, goToMove])
  const goBackward = useCallback(() => goToMove(moveIndex - 1), [moveIndex, goToMove])
  const goToStart = useCallback(() => goToMove(-1), [goToMove])
  const goToEnd = useCallback(() => goToMove(moves.length - 1), [moves.length, goToMove])

  return {
    moves,
    fens,
    currentFen,
    currentMove,
    moveIndex,
    goForward,
    goBackward,
    goToStart,
    goToEnd,
    goToMove,
    headers,
  }
}
