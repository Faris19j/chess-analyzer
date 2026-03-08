'use client'
import { GameReview, MoveClassification } from '@/types/analysis'
import { CLASSIFICATION_COLORS, CLASSIFICATION_LABELS } from '@/lib/analysis-utils'

interface Props {
  review: GameReview
  whiteUsername: string
  blackUsername: string
}

const DISPLAY_CLASSIFICATIONS: MoveClassification[] = [
  'brilliant',
  'great',
  'best',
  'excellent',
  'good',
  'inaccuracy',
  'mistake',
  'blunder',
]

export default function ReviewSummary({ review, whiteUsername, blackUsername }: Props) {
  const whiteMoves = review.moves.filter((m) => m.isWhiteMove)
  const blackMoves = review.moves.filter((m) => !m.isWhiteMove)

  const countByClassification = (
    moves: typeof review.moves,
    classification: MoveClassification
  ) => moves.filter((m) => m.classification === classification).length

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-3">
      {/* Accuracy header */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-center">
          <div className="text-xs text-zinc-400 mb-1">{whiteUsername}</div>
          <div className="text-2xl font-bold text-white">
            {review.whiteAccuracy.toFixed(1)}%
          </div>
          <div className="text-xs text-zinc-500">Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-zinc-400 mb-1">{blackUsername}</div>
          <div className="text-2xl font-bold text-white">
            {review.blackAccuracy.toFixed(1)}%
          </div>
          <div className="text-xs text-zinc-500">Accuracy</div>
        </div>
      </div>

      {/* Classification counts */}
      <div className="border-t border-zinc-700 pt-2">
        {DISPLAY_CLASSIFICATIONS.map((cls) => {
          const whiteCount = countByClassification(whiteMoves, cls)
          const blackCount = countByClassification(blackMoves, cls)
          if (whiteCount === 0 && blackCount === 0) return null

          return (
            <div
              key={cls}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-0.5 text-xs"
            >
              <div className="text-right text-zinc-300">
                {whiteCount > 0 ? whiteCount : ''}
              </div>
              <div className="flex items-center gap-1.5 min-w-[100px]">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: CLASSIFICATION_COLORS[cls] }}
                />
                <span className="text-zinc-400">{CLASSIFICATION_LABELS[cls]}</span>
              </div>
              <div className="text-zinc-300">
                {blackCount > 0 ? blackCount : ''}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
