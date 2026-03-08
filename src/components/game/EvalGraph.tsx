'use client'
import { MoveAnalysis } from '@/types/analysis'
import { CLASSIFICATION_COLORS, clampEval } from '@/lib/analysis-utils'

interface Props {
  moves: MoveAnalysis[]
  currentMoveIndex: number
  onMoveClick: (index: number) => void
}

export default function EvalGraph({ moves, currentMoveIndex, onMoveClick }: Props) {
  if (moves.length === 0) return null

  const width = 600
  const height = 100
  const padding = { top: 4, bottom: 4, left: 0, right: 0 }
  const graphWidth = width - padding.left - padding.right
  const graphHeight = height - padding.top - padding.bottom
  const centerY = padding.top + graphHeight / 2

  // Max eval for scaling (in centipawns)
  const maxEval = 500

  const getX = (i: number) =>
    padding.left + (i / Math.max(1, moves.length - 1)) * graphWidth

  const getY = (evalCP: number) => {
    const clamped = clampEval(evalCP)
    const normalized = Math.max(-maxEval, Math.min(maxEval, clamped))
    // Positive eval = above center (lower Y), negative = below
    return centerY - (normalized / maxEval) * (graphHeight / 2)
  }

  // Build the white area path (above center when white is winning)
  const buildAreaPath = () => {
    if (moves.length === 0) return ''

    let whitePath = `M ${getX(0)} ${centerY}`
    let blackPath = `M ${getX(0)} ${centerY}`

    for (let i = 0; i < moves.length; i++) {
      const x = getX(i)
      const evalCP = moves[i].evalAfter
      const y = getY(evalCP)

      if (evalCP >= 0) {
        whitePath += ` L ${x} ${y}`
        blackPath += ` L ${x} ${centerY}`
      } else {
        whitePath += ` L ${x} ${centerY}`
        blackPath += ` L ${x} ${y}`
      }
    }

    whitePath += ` L ${getX(moves.length - 1)} ${centerY} Z`
    blackPath += ` L ${getX(moves.length - 1)} ${centerY} Z`

    return { whitePath, blackPath }
  }

  const paths = buildAreaPath()
  if (!paths) return null

  // Find notable moves (inaccuracies, mistakes, blunders)
  const notableMoves = moves.filter((m) =>
    ['inaccuracy', 'mistake', 'blunder', 'brilliant', 'great'].includes(m.classification)
  )

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full cursor-pointer"
        preserveAspectRatio="none"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * width
          const moveIdx = Math.round(
            ((x - padding.left) / graphWidth) * (moves.length - 1)
          )
          const clampedIdx = Math.max(0, Math.min(moves.length - 1, moveIdx))
          onMoveClick(clampedIdx)
        }}
      >
        {/* Background */}
        <rect x={0} y={0} width={width} height={height} fill="#27272a" rx={4} />

        {/* Center line */}
        <line
          x1={padding.left}
          y1={centerY}
          x2={width - padding.right}
          y2={centerY}
          stroke="#52525b"
          strokeWidth={0.5}
        />

        {/* White area */}
        <path d={paths.whitePath} fill="rgba(255,255,255,0.6)" />

        {/* Black area */}
        <path d={paths.blackPath} fill="rgba(0,0,0,0.5)" />

        {/* Notable move dots */}
        {notableMoves.map((m) => (
          <circle
            key={m.moveIndex}
            cx={getX(m.moveIndex)}
            cy={getY(m.evalAfter)}
            r={3}
            fill={CLASSIFICATION_COLORS[m.classification]}
          />
        ))}

        {/* Current position indicator */}
        {currentMoveIndex >= 0 && currentMoveIndex < moves.length && (
          <line
            x1={getX(currentMoveIndex)}
            y1={padding.top}
            x2={getX(currentMoveIndex)}
            y2={height - padding.bottom}
            stroke="#22c55e"
            strokeWidth={1.5}
          />
        )}
      </svg>
    </div>
  )
}
