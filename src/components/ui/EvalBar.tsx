interface Props {
  evaluation: number // Centipawns
  mate: number | null
  isWhiteTurn: boolean
}

export function EvalBar({ evaluation, mate, isWhiteTurn }: Props) {
  // Cap display at +/- 10 pawns (1000 cp)
  const cappedEval = Math.max(-1000, Math.min(1000, evaluation))
  const displayEval = !isWhiteTurn ? -cappedEval : cappedEval
  const whitePercent = ((displayEval + 1000) / 2000) * 100

  // Format display string
  let displayText = ''
  if (mate !== null) {
    displayText = mate > 0 ? `M+${mate}` : `M${mate}`
  } else {
    const pawns = Math.abs(displayEval / 100).toFixed(2)
    displayText = displayEval >= 0 ? `+${pawns}` : `-${pawns}`
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-12 h-64 bg-zinc-700 rounded overflow-hidden border border-zinc-600 flex flex-col-reverse">
        <div
          className="bg-white transition-all duration-75"
          style={{ height: `${whitePercent}%` }}
        />
      </div>
      <div className="text-sm font-semibold text-zinc-300">{displayText}</div>
    </div>
  )
}
