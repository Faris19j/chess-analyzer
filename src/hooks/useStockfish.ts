'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import type { AnalysisState, StockfishLine } from '@/types/analysis'
import { parseInfoLine } from '@/lib/pgn-utils'

const INITIAL_STATE: AnalysisState = {
  isAnalyzing: false,
  depth: 0,
  evaluation: 0,
  mate: null,
  lines: [],
  bestMove: null,
}

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisState>(INITIAL_STATE)
  const isReadyRef = useRef(false)
  const linesMapRef = useRef<Map<number, StockfishLine>>(new Map())

  useEffect(() => {
    // Only create worker on client-side
    if (typeof window === 'undefined') return

    try {
      const worker = new Worker('/stockfish.js')
      workerRef.current = worker

      worker.onmessage = (event: MessageEvent<string>) => {
        const output = event.data

        // Parse engine output
        if (output.startsWith('uciok')) {
          isReadyRef.current = true
        } else if (output.startsWith('info')) {
          const parsed = parseInfoLine(output)
          if (parsed) {
            const depth = parsed.depth
            const line: StockfishLine = {
              depth,
              score: parsed.score,
              mate: parsed.mate,
              pv: parsed.pv,
              bestMove: parsed.pv[0] || '',
            }

            linesMapRef.current.set(depth, line)

            // Update state with top lines
            const lines = Array.from(linesMapRef.current.values())
              .sort((a, b) => b.depth - a.depth)
              .slice(0, 3)

            setAnalysis((prev) => ({
              ...prev,
              depth,
              evaluation: lines[0]?.score ?? 0,
              mate: lines[0]?.mate ?? null,
              lines,
              bestMove: lines[0]?.bestMove ?? null,
              isAnalyzing: true,
            }))
          }
        } else if (output.startsWith('bestmove')) {
          setAnalysis((prev) => ({ ...prev, isAnalyzing: false }))
        }
      }

      // Initialize UCI mode
      worker.postMessage('uci')

      return () => {
        worker.postMessage('quit')
        worker.terminate()
        workerRef.current = null
      }
    } catch (err) {
      console.error('Failed to initialize Stockfish worker:', err)
    }
  }, [])

  const analyze = useCallback((fen: string, depth = 18) => {
    if (!workerRef.current) {
      console.warn('Stockfish worker not initialized')
      return
    }

    linesMapRef.current.clear()
    setAnalysis((prev) => ({ ...prev, isAnalyzing: true }))

    try {
      workerRef.current.postMessage('stop')
      workerRef.current.postMessage(`position fen ${fen}`)
      workerRef.current.postMessage(`go depth ${depth}`)
    } catch (err) {
      console.error('Error sending message to Stockfish:', err)
    }
  }, [])

  const stopAnalysis = useCallback(() => {
    if (workerRef.current) {
      try {
        workerRef.current.postMessage('stop')
      } catch (err) {
        console.error('Error stopping analysis:', err)
      }
    }
  }, [])

  return { analysis, analyze, stopAnalysis }
}
