'use client'
import { useState, useEffect, useMemo } from 'react'
import type { ChessComGame } from '@/types/chesscom'
import { useChessGame } from '@/hooks/useChessGame'
import { useStockfish } from '@/hooks/useStockfish'
import { useGameReview } from '@/hooks/useGameReview'
import { getChesscomAnalysisUrl } from '@/lib/pgn-utils'
import { uciToArrow } from '@/lib/analysis-utils'
import type { Square, Arrow } from 'react-chessboard/dist/chessboard/types'
import { ChessBoard } from './ChessBoard'
import { MoveList } from './MoveList'
import { GameControls } from './GameControls'
import { GameInfo } from './GameInfo'
import { EvalBar } from '@/components/ui/EvalBar'
import { AnalysisPanel } from './AnalysisPanel'
import EvalGraph from './EvalGraph'
import ReviewSummary from './ReviewSummary'
import AnalysisProgress from './AnalysisProgress'

interface Props {
  game: ChessComGame
}

export function GameViewer({ game }: Props) {
  const {
    moves,
    fens,
    currentFen,
    moveIndex,
    goForward,
    goBackward,
    goToStart,
    goToEnd,
    goToMove,
  } = useChessGame(game.pgn)

  const { analysis, analyze, stopAnalysis } = useStockfish()
  const { review, isReviewing, startReview, cancelReview } = useGameReview()
  const [boardFlipped, setBoardFlipped] = useState(false)
  const [isAnalysisEnabled, setIsAnalysisEnabled] = useState(false)

  const movesPlayedCount = moveIndex + 1
  const isWhiteTurn = movesPlayedCount % 2 === 0

  const currentMoveAnalysis = useMemo(() => {
    if (!review?.isComplete || moveIndex < 0) return null
    return review.moves[moveIndex] ?? null
  }, [review, moveIndex])

  const customArrows = useMemo((): Arrow[] | undefined => {
    if (!currentMoveAnalysis) return undefined
    if (currentMoveAnalysis.playedMove === currentMoveAnalysis.bestMove) return undefined
    const [from, to] = uciToArrow(currentMoveAnalysis.bestMove)
    return [[from as Square, to as Square, 'rgb(0,180,0)']]
  }, [currentMoveAnalysis])

  useEffect(() => {
    if (isAnalysisEnabled) {
      analyze(currentFen, 20)
    }
  }, [currentFen, isAnalysisEnabled, analyze])

  useEffect(() => {
    return () => {
      stopAnalysis()
    }
  }, [stopAnalysis])

  const handleGameReview = () => {
    if (!isReviewing && !review?.isComplete) {
      startReview(fens, moves)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Analysis progress bar - full width above everything */}
        {isReviewing && review && (
          <div className="mb-4">
            <AnalysisProgress
              currentMove={review.currentMoveBeingAnalyzed}
              totalMoves={review.totalMoves}
              onCancel={cancelReview}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-4">
          {/* Left sidebar - Game info & review summary */}
          <div className="space-y-4">
            <GameInfo game={game} />

            {review?.isComplete && (
              <ReviewSummary
                review={review}
                whiteUsername={game.white.username}
                blackUsername={game.black.username}
              />
            )}

            <AnalysisPanel
              analysis={analysis}
              isEnabled={isAnalysisEnabled}
              currentFen={currentFen}
              moveAnalysis={currentMoveAnalysis}
            />

            <a
              href={getChesscomAnalysisUrl(game.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors border border-zinc-700"
            >
              Open on Chess.com
            </a>
          </div>

          {/* Center - Board + eval graph + controls */}
          <div className="space-y-3">
            {/* Eval graph */}
            {review?.isComplete && (
              <EvalGraph
                moves={review.moves}
                currentMoveIndex={moveIndex}
                onMoveClick={goToMove}
              />
            )}

            <div className="flex gap-3 justify-center">
              {/* Eval bar */}
              {(isAnalysisEnabled || review?.isComplete) && (
                <div className="w-7 flex-shrink-0">
                  <EvalBar
                    evaluation={
                      currentMoveAnalysis
                        ? currentMoveAnalysis.evalAfter
                        : analysis.evaluation
                    }
                    mate={
                      currentMoveAnalysis
                        ? currentMoveAnalysis.mateAfter
                        : analysis.mate
                    }
                    isWhiteTurn={isWhiteTurn}
                  />
                </div>
              )}

              <div className="flex-1 max-w-[560px]">
                <ChessBoard
                  position={currentFen}
                  boardOrientation={boardFlipped ? 'black' : 'white'}
                  customArrows={customArrows}
                />
              </div>
            </div>

            <GameControls
              onFirst={goToStart}
              onBack={goBackward}
              onForward={goForward}
              onLast={goToEnd}
              onFlip={() => setBoardFlipped((f) => !f)}
              onToggleAnalysis={() => setIsAnalysisEnabled((e) => !e)}
              isAnalysisEnabled={isAnalysisEnabled}
              onGameReview={handleGameReview}
              isReviewing={isReviewing}
              hasReview={review?.isComplete}
            />
          </div>

          {/* Right sidebar - Move list */}
          <div>
            <MoveList
              moves={moves}
              currentIndex={moveIndex}
              onMoveClick={goToMove}
              review={review}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
