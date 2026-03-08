'use client'
import { useEffect, useRef } from 'react'
import type { Move } from 'chess.js'
import type { GameReview } from '@/types/analysis'
import {
  CLASSIFICATION_COLORS,
  CLASSIFICATION_SYMBOLS,
  shouldShowDot,
} from '@/lib/analysis-utils'

interface Props {
  moves: Move[]
  currentIndex: number
  onMoveClick: (index: number) => void
  review?: GameReview | null
}

export function MoveList({ moves, currentIndex, onMoveClick, review }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  // Auto-scroll to active move
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [currentIndex])

  // Group moves into pairs (1. e4 e5, 2. Nf3 Nc6)
  const movePairs: Array<[Move | null, Move | null]> = []
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push([moves[i], moves[i + 1] || null])
  }

  const getMoveAnalysis = (moveIndex: number) => {
    if (!review?.isComplete) return null
    return review.moves[moveIndex] ?? null
  }

  return (
    <div
      ref={containerRef}
      className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 h-96 overflow-y-auto"
    >
      <div className="text-sm font-mono space-y-1">
        {movePairs.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No moves</p>
        ) : (
          movePairs.map((pair, pairIndex) => {
            const [whiteMove, blackMove] = pair
            const moveNumber = pairIndex + 1
            const whiteAnalysis = getMoveAnalysis(pairIndex * 2)
            const blackAnalysis = getMoveAnalysis(pairIndex * 2 + 1)

            return (
              <div key={pairIndex} className="flex gap-4">
                <span className="text-zinc-500 min-w-fit">{moveNumber}.</span>
                <div className="flex gap-4">
                  {whiteMove && (
                    <button
                      ref={currentIndex === pairIndex * 2 ? activeRef : null}
                      onClick={() => onMoveClick(pairIndex * 2)}
                      className={`text-left px-2 py-1 rounded hover:bg-zinc-700 transition-colors flex items-center gap-1 ${
                        currentIndex === pairIndex * 2
                          ? whiteAnalysis
                            ? 'text-white'
                            : 'bg-green-600 text-white'
                          : 'text-white'
                      }`}
                      style={
                        currentIndex === pairIndex * 2 && whiteAnalysis
                          ? {
                              backgroundColor:
                                CLASSIFICATION_COLORS[whiteAnalysis.classification] + '33',
                              borderLeft: `2px solid ${CLASSIFICATION_COLORS[whiteAnalysis.classification]}`,
                            }
                          : undefined
                      }
                    >
                      {whiteAnalysis && shouldShowDot(whiteAnalysis.classification) && (
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              CLASSIFICATION_COLORS[whiteAnalysis.classification],
                          }}
                        />
                      )}
                      {whiteMove.san}
                      {whiteAnalysis &&
                        ['brilliant', 'great', 'blunder', 'mistake', 'inaccuracy'].includes(
                          whiteAnalysis.classification
                        ) && (
                          <span
                            className="text-[10px] ml-0.5"
                            style={{
                              color: CLASSIFICATION_COLORS[whiteAnalysis.classification],
                            }}
                          >
                            {CLASSIFICATION_SYMBOLS[whiteAnalysis.classification]}
                          </span>
                        )}
                    </button>
                  )}
                  {blackMove && (
                    <button
                      ref={currentIndex === pairIndex * 2 + 1 ? activeRef : null}
                      onClick={() => onMoveClick(pairIndex * 2 + 1)}
                      className={`text-left px-2 py-1 rounded hover:bg-zinc-700 transition-colors flex items-center gap-1 ${
                        currentIndex === pairIndex * 2 + 1
                          ? blackAnalysis
                            ? 'text-white'
                            : 'bg-green-600 text-white'
                          : 'text-white'
                      }`}
                      style={
                        currentIndex === pairIndex * 2 + 1 && blackAnalysis
                          ? {
                              backgroundColor:
                                CLASSIFICATION_COLORS[blackAnalysis.classification] + '33',
                              borderLeft: `2px solid ${CLASSIFICATION_COLORS[blackAnalysis.classification]}`,
                            }
                          : undefined
                      }
                    >
                      {blackAnalysis && shouldShowDot(blackAnalysis.classification) && (
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              CLASSIFICATION_COLORS[blackAnalysis.classification],
                          }}
                        />
                      )}
                      {blackMove.san}
                      {blackAnalysis &&
                        ['brilliant', 'great', 'blunder', 'mistake', 'inaccuracy'].includes(
                          blackAnalysis.classification
                        ) && (
                          <span
                            className="text-[10px] ml-0.5"
                            style={{
                              color: CLASSIFICATION_COLORS[blackAnalysis.classification],
                            }}
                          >
                            {CLASSIFICATION_SYMBOLS[blackAnalysis.classification]}
                          </span>
                        )}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
