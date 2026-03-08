import type { ChessComGame } from '@/types/chesscom'

interface Props {
  game: ChessComGame
}

export function GameInfo({ game }: Props) {
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-zinc-400 text-sm font-medium mb-1">White</h3>
          <p className="text-white font-semibold">{game.white.username}</p>
          <p className="text-zinc-400 text-sm">{game.white.rating}</p>
        </div>
        <div>
          <h3 className="text-zinc-400 text-sm font-medium mb-1">Black</h3>
          <p className="text-white font-semibold">{game.black.username}</p>
          <p className="text-zinc-400 text-sm">{game.black.rating}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-700">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Time Control:</span>
          <span className="text-white">{game.time_control}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-zinc-400">Date:</span>
          <span className="text-white">
            {new Date(game.end_time * 1000).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-zinc-400">Status:</span>
          <span className="text-white capitalize">
            {game.white.result === 'win' || game.black.result === 'checkmated'
              ? `White wins by ${game.white.result}`
              : game.black.result === 'win' || game.white.result === 'checkmated'
                ? `Black wins by ${game.black.result}`
                : `Draw by ${game.white.result}`}
          </span>
        </div>
      </div>
    </div>
  )
}
