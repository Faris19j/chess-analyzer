'use client'
import dynamic from 'next/dynamic'
import type { Square, Arrow } from 'react-chessboard/dist/chessboard/types'

const Chessboard = dynamic(
  () => import('react-chessboard').then((mod) => mod.Chessboard),
  { ssr: false }
)

interface Props {
  position: string
  boardOrientation: 'white' | 'black'
  customArrows?: Arrow[]
}

export function ChessBoard({ position, boardOrientation, customArrows }: Props) {
  return (
    <div className="bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
      <Chessboard
        position={position}
        boardOrientation={boardOrientation}
        arePremovesAllowed={false}
        areArrowsAllowed={false}
        onPieceDrop={() => false}
        customArrows={customArrows}
      />
    </div>
  )
}
