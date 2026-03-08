'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ChessComGame } from '@/types/chesscom'
import { GameViewer } from '@/components/game/GameViewer'

interface Props {
  params: { gameId: string }
}

export default function GamePage({ params }: Props) {
  const { gameId } = params
  const router = useRouter()
  const [game, setGame] = useState<ChessComGame | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try to get game from sessionStorage
    const storedGame = sessionStorage.getItem(`game_${gameId}`)

    if (storedGame) {
      try {
        setGame(JSON.parse(storedGame))
      } catch (err) {
        setError('Failed to load game data')
      }
    } else {
      setError('Game data not found. Please go back and select a game.')
    }

    setLoading(false)
  }, [gameId])

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading game...</p>
        </div>
      </main>
    )
  }

  if (error || !game) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Error</h1>
          <p className="text-zinc-400 mb-8">
            {error || 'Failed to load game'}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </main>
    )
  }

  return <GameViewer game={game} />
}
