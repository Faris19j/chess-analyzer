'use client'
import Link from 'next/link'
import type { ChessComGame } from '@/types/chesscom'
import { extractGameId } from '@/lib/pgn-utils'

interface Props {
  game: ChessComGame
  currentUsername: string
}

export function GameCard({ game, currentUsername }: Props) {
  const isWhite = game.white.username.toLowerCase() === currentUsername.toLowerCase()
  const opponent = isWhite ? game.black : game.white
  const userResult = isWhite ? game.white.result : game.black.result
  const gameId = extractGameId(game.url)

  const resultColor: { [key: string]: string } = {
    win: 'bg-green-900 text-green-200',
    resigned: 'bg-green-900 text-green-200',
    checkmated: 'bg-red-900 text-red-200',
    timeout: 'bg-red-900 text-red-200',
    abandoned: 'bg-red-900 text-red-200',
    stalemate: 'bg-yellow-900 text-yellow-200',
    agreed: 'bg-yellow-900 text-yellow-200',
    insufficient: 'bg-yellow-900 text-yellow-200',
    repetition: 'bg-yellow-900 text-yellow-200',
    '50move': 'bg-yellow-900 text-yellow-200',
    timevsinsufficient: 'bg-yellow-900 text-yellow-200',
  }

  const resultLabel: { [key: string]: string } = {
    win: 'Win',
    resigned: 'Win',
    checkmated: 'Loss',
    timeout: 'Loss',
    abandoned: 'Loss',
    stalemate: 'Draw',
    agreed: 'Draw',
    insufficient: 'Draw',
    repetition: 'Draw',
    '50move': 'Draw',
    timevsinsufficient: 'Draw',
  }

  return (
    <Link href={`/game/${gameId}`}>
      <div
        onClick={() => {
          sessionStorage.setItem(`game_${gameId}`, JSON.stringify(game))
        }}
        className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg p-4 cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-white font-semibold">
                {opponent.username}
              </span>
              <span className="text-zinc-400">({opponent.rating})</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>{game.time_class}</span>
              <span>•</span>
              <span>
                {new Date(game.end_time * 1000).toLocaleDateString()}
              </span>
              {game.rated && (
                <>
                  <span>•</span>
                  <span className="text-yellow-500">Rated</span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-3 py-1 rounded font-semibold text-sm ${
                resultColor[userResult] || 'bg-zinc-700 text-white'
              }`}
            >
              {resultLabel[userResult] || userResult}
            </span>
            <span className="text-xs text-zinc-400">
              {isWhite ? 'White' : 'Black'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
