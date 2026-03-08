'use client'
import { useEffect } from 'react'

interface Props {
  onFirst: () => void
  onBack: () => void
  onForward: () => void
  onLast: () => void
  onFlip: () => void
  onToggleAnalysis: () => void
  isAnalysisEnabled: boolean
  onGameReview?: () => void
  isReviewing?: boolean
  hasReview?: boolean
}

export function GameControls({
  onFirst,
  onBack,
  onForward,
  onLast,
  onFlip,
  onToggleAnalysis,
  isAnalysisEnabled,
  onGameReview,
  isReviewing,
  hasReview,
}: Props) {
  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') onBack()
      if (e.key === 'ArrowRight') onForward()
      if (e.key === 'Home') onFirst()
      if (e.key === 'End') onLast()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onFirst, onBack, onForward, onLast])

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
      <div className="flex gap-2">
        <button
          onClick={onFirst}
          className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
          title="Home"
        >
          ⏮
        </button>
        <button
          onClick={onBack}
          className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
          title="Previous move (←)"
        >
          ◀
        </button>
        <button
          onClick={onForward}
          className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
          title="Next move (→)"
        >
          ▶
        </button>
        <button
          onClick={onLast}
          className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
          title="End"
        >
          ⏭
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onFlip}
          className="py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors text-sm"
        >
          Flip Board
        </button>
        <button
          onClick={onToggleAnalysis}
          className={`py-2 rounded transition-colors text-sm ${
            isAnalysisEnabled
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-zinc-700 hover:bg-zinc-600 text-white'
          }`}
        >
          {isAnalysisEnabled ? '✓ Analysis' : 'Analysis'}
        </button>
        {onGameReview && (
          <button
            onClick={onGameReview}
            disabled={isReviewing}
            className={`py-2 rounded transition-colors text-sm ${
              hasReview
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : isReviewing
                  ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                  : 'bg-zinc-700 hover:bg-zinc-600 text-white'
            }`}
          >
            {isReviewing ? 'Reviewing...' : hasReview ? '✓ Review' : 'Game Review'}
          </button>
        )}
      </div>
    </div>
  )
}
