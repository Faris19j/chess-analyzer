'use client'

interface Props {
  currentMove: number
  totalMoves: number
  onCancel: () => void
}

export default function AnalysisProgress({ currentMove, totalMoves, onCancel }: Props) {
  const progress = totalMoves > 0 ? (currentMove / totalMoves) * 100 : 0

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-300">
          Analyzing move {Math.min(currentMove + 1, totalMoves)} / {totalMoves}...
        </span>
        <button
          onClick={onCancel}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Cancel
        </button>
      </div>
      <div className="w-full bg-zinc-700 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
