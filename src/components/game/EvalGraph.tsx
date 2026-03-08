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

  const width = 800
  const height = 80
  const padding = { top: 2, bottom: 2, left: 2, right: 2 }
  const graphWidth = width - padding.left - padding.right
  const graphHeight = height - padding.top - padding.bottom
  const centerY = padding.top + graphHeight / 2

  const maxEval = 500

  const getX = (i: number) =>
    padding.left + (i / Math.max(1, moves.length - 1)) * graphWidth

  const getY = (evalCP: number) => {
    const clamped = clampEval(evalCP)
    const normalized = Math.max(-maxEval, Math.min(maxEval, clamped))
    return centerY - (normalized / maxEval) * (graphHeight / 2)
  }

  // Build a single continuous line path + fill areas
  const buildPaths = () => {
    const points: { x: number; y: number; evalCP: number }[] = []
    for (let i = 0; i < moves.length; i++) {
      points.push({ x: getX(i), y: getY(moves[i].evalAfter), evalCP: moves[i].evalAfter })
    }

    // Line path
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

    // White fill: area between line and center where eval > 0
    let whiteFill = `M ${points[0].x} ${centerY}`
    let blackFill = `M ${points[0].x} ${centerY}`

    for (const p of points) {
      if (p.evalCP >= 0) {
        whiteFill += ` L ${p.x} ${p.y}`
        blackFill += ` L ${p.x} ${centerY}`
      } else {
        whiteFill += ` L ${p.x} ${centerY}`
        blackFill += ` L ${p.x} ${p.y}`
      }
    }

    const lastX = points[points.length - 1].x
    whiteFill += ` L ${lastX} ${centerY} Z`
    blackFill += ` L ${lastX} ${centerY} Z`

    return { linePath, whiteFill, blackFill }
  }

  const { linePath, whiteFill, blackFill } = buildPaths()

  const notableMoves = moves.filter((m) =>
    ['inaccuracy', 'mistake', 'blunder', 'brilliant', 'great'].includes(m.classification)
  )

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full block"
        style={{ height: '64px' }}
        preserveAspectRatio="xMidYMid meet"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * width
          const moveIdx = Math.round(
            ((x - padding.left) / graphWidth) * (moves.length - 1)
          )
          onMoveClick(Math.max(0, Math.min(moves.length - 1, moveIdx)))
        }}
        role="button"
        tabIndex={0}
      >
        {/* Background */}
        <rect x={0} y={0} width={width} height={height} fill="#18181b" />

        {/* Center line */}
        <line
          x1={padding.left}
          y1={centerY}
          x2={width - padding.right}
          y2={centerY}
          stroke="#3f3f46"
          strokeWidth={0.5}
        />

        {/* White area */}
        <path d={whiteFill} fill="rgba(255,255,255,0.5)" />

        {/* Black area */}
        <path d={blackFill} fill="rgba(255,255,255,0.08)" />

        {/* Eval line */}
        <path d={linePath} fill="none" stroke="#71717a" strokeWidth={1} />

        {/* Notable move dots */}
        {notableMoves.map((m) => (
          <circle
            key={m.moveIndex}
            cx={getX(m.moveIndex)}
            cy={getY(m.evalAfter)}
            r={2.5}
            fill={CLASSIFICATION_COLORS[m.classification]}
            stroke="#18181b"
            strokeWidth={0.5}
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
            opacity={0.8}
          />
        )}
      </svg>
    </div>
  )
}
