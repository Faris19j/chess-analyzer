'use client'
import { useState, useEffect, useMemo } from 'react'
import type { ChessComGame } from '@/types/chesscom'
import { getMonthGames } from '@/lib/chesscom-api'
import { GameCard } from './GameCard'

const PAGE_SIZE = 20

interface Props {
  username: string
  archives: string[]
  initialGames: ChessComGame[]
  initialArchiveUrl: string
}

export function GameList({
  username,
  archives,
  initialGames,
  initialArchiveUrl,
}: Props) {
  const [currentArchive, setCurrentArchive] = useState(initialArchiveUrl)
  const [games, setGames] = useState(initialGames)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedTimeClass, setSelectedTimeClass] = useState<string | null>(
    null
  )
  const [selectedResult, setSelectedResult] = useState<string | null>(null)

  // Load games when archive changes
  useEffect(() => {
    setLoading(true)
    setCurrentPage(0)
    console.log('Loading games from:', currentArchive)
    getMonthGames(currentArchive)
      .then((newGames) => {
        console.log('Loaded', newGames.length, 'games')
        setGames(newGames)
      })
      .catch((err) => {
        console.error('Failed to load games:', err)
        setGames([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [currentArchive])

  // Filter games
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const userResult =
        game.white.username.toLowerCase() === username.toLowerCase()
          ? game.white.result
          : game.black.result

      if (selectedTimeClass && game.time_class !== selectedTimeClass) {
        return false
      }

      if (selectedResult) {
        const resultCategory = ['win', 'resigned', 'checkmated', 'timeout', 'abandoned'].includes(
          userResult
        )
          ? 'win'
          : ['stalemate', 'agreed', 'insufficient', 'repetition', '50move'].includes(
              userResult
            )
            ? 'draw'
            : 'loss'
        if (resultCategory !== selectedResult) {
          return false
        }
      }

      return true
    })
  }, [games, username, selectedTimeClass, selectedResult])

  const totalPages = Math.ceil(filteredGames.length / PAGE_SIZE)
  const paginatedGames = filteredGames.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  )

  const currentArchiveMonth = currentArchive.split('/').slice(-2).join('/')

  return (
    <div className="bg-zinc-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-4">
        {/* Archive selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Month
          </label>
          <select
            value={currentArchive}
            onChange={(e) => setCurrentArchive(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:border-green-500 focus:outline-none"
          >
            {archives.map((url) => {
              const month = url.split('/').slice(-2).join('/')
              return (
                <option key={url} value={url}>
                  {month}
                </option>
              )
            })}
          </select>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Time Class
            </label>
            <select
              value={selectedTimeClass || ''}
              onChange={(e) => setSelectedTimeClass(e.target.value || null)}
              className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:border-green-500 focus:outline-none"
            >
              <option value="">All</option>
              <option value="bullet">Bullet</option>
              <option value="blitz">Blitz</option>
              <option value="rapid">Rapid</option>
              <option value="daily">Daily</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Result
            </label>
            <select
              value={selectedResult || ''}
              onChange={(e) => setSelectedResult(e.target.value || null)}
              className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:border-green-500 focus:outline-none"
            >
              <option value="">All</option>
              <option value="win">Wins</option>
              <option value="draw">Draws</option>
              <option value="loss">Losses</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Results
            </label>
            <div className="text-sm text-zinc-400 py-2">
              {filteredGames.length} of {games.length} games
            </div>
          </div>
        </div>

        {/* Games list */}
        {loading ? (
          <div className="text-center py-8 text-zinc-400">Loading games...</div>
        ) : paginatedGames.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">No games found</div>
        ) : (
          <>
            <div className="space-y-2 mb-6">
              {paginatedGames.map((game) => (
                <GameCard
                  key={game.url}
                  game={game}
                  currentUsername={username}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-lg"
                >
                  Previous
                </button>
                <span className="text-zinc-400">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                  }
                  disabled={currentPage === totalPages - 1}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-lg"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
