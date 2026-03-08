'use client'
import type { AnalysisState, MoveAnalysis } from '@/types/analysis'
import { Chess } from 'chess.js'
import {
  CLASSIFICATION_COLORS,
  CLASSIFICATION_LABELS,
  CLASSIFICATION_SYMBOLS,
} from '@/lib/analysis-utils'

interface Props {
  analysis: AnalysisState
  isEnabled: boolean
  currentFen: string
  moveAnalysis?: MoveAnalysis | null
}

export function AnalysisPanel({
  analysis,
  isEnabled,
  currentFen,
  moveAnalysis,
}: Props) {
  if (!isEnabled && !moveAnalysis) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
        <p className="text-zinc-500 text-sm">Enable analysis to see engine lines</p>
      </div>
    )
  }

  // Convert UCI moves to SAN notation
  function uciToSan(fen: string, uciMove: string): string {
    try {
      const chess = new Chess(fen)
      const from = uciMove.slice(0, 2) as Parameters<typeof chess.move>[0] extends { from: infer F } ? F : string
      const to = uciMove.slice(2, 4) as typeof from
      const promotion = uciMove[4] as 'q' | 'r' | 'b' | 'n' | undefined

      const result = chess.move({ from, to, promotion })
      return result?.san ?? uciMove
    } catch {
      return uciMove
    }
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
      {/* Classification badge */}
      {moveAnalysis && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{
                backgroundColor: CLASSIFICATION_COLORS[moveAnalysis.classification],
              }}
            >
              {CLASSIFICATION_SYMBOLS[moveAnalysis.classification]}{' '}
              {CLASSIFICATION_LABELS[moveAnalysis.classification]}
            </span>
            {moveAnalysis.cpLoss > 0 && (
              <span className="text-xs text-zinc-400">
                {moveAnalysis.mateBefore != null || moveAnalysis.mateAfter != null
                  ? ''
                  : `−${(moveAnalysis.cpLoss / 100).toFixed(1)} pawns`}
              </span>
            )}
          </div>

          {/* Played move */}
          <div className="text-sm text-zinc-300">
            <span className="text-zinc-500">Played: </span>
            <span className="font-mono font-semibold">
              {moveAnalysis.playedMoveSan}
            </span>
          </div>

          {/* Best move (if different) */}
          {moveAnalysis.playedMove !== moveAnalysis.bestMove && (
            <div className="text-sm text-green-400">
              <span className="text-zinc-500">Best was: </span>
              <span className="font-mono font-semibold">
                {moveAnalysis.bestMoveSan}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Live analysis section */}
      {isEnabled && (
        <>
          {analysis.isAnalyzing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">
                  Depth {analysis.depth}
                </span>
                <span className="text-xs text-zinc-500">Analyzing...</span>
              </div>
              <div className="h-2 bg-zinc-700 rounded overflow-hidden">
                <div
                  className="h-full bg-green-600 animate-pulse"
                  style={{
                    width: `${Math.min((analysis.depth / 20) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            !moveAnalysis && (
              <div className="text-zinc-500 text-sm">Engine ready</div>
            )
          )}

          {analysis.lines.length > 0 && (
            <div
              className={`space-y-3 ${moveAnalysis ? 'border-t border-zinc-700 pt-3' : 'mt-4 border-t border-zinc-700 pt-4'}`}
            >
              {analysis.lines.map((line, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-zinc-400">Line {idx + 1}</span>
                    <span className="text-green-400 font-semibold">
                      {line.mate !== null && line.mate !== undefined
                        ? line.mate > 0
                          ? `M+${line.mate}`
                          : `M${line.mate}`
                        : `${(line.score / 100).toFixed(2)}`}
                    </span>
                  </div>
                  <p className="text-zinc-300 font-mono break-words">
                    {line.pv
                      .slice(0, 5)
                      .map((move) => uciToSan(currentFen, move))
                      .join(' ')}
                    {line.pv.length > 5 && ' ...'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
