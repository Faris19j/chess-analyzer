import type { ChessComPlayer } from '@/types/chesscom'

interface Props {
  profile: ChessComPlayer
}

export function PlayerHeader({ profile }: Props) {
  return (
    <div className="bg-zinc-900 border-b border-zinc-700 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-6">
          {profile.avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-20 h-20 rounded-lg"
            />
          )}
          <div>
            <h1 className="text-4xl font-bold text-white">
              {profile.username}
            </h1>
            {profile.name && (
              <p className="text-zinc-400 text-lg">{profile.name}</p>
            )}
            <p className="text-zinc-500 text-sm mt-1">
              Member since{' '}
              {new Date(profile.joined * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
