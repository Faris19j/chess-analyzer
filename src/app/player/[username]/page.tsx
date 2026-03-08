import { getPlayerProfile, getArchives, getMonthGames } from '@/lib/chesscom-api'
import { PlayerHeader } from '@/components/player/PlayerHeader'
import { GameList } from '@/components/player/GameList'

interface Props {
  params: { username: string }
}

export default async function PlayerPage({ params }: Props) {
  const { username } = params

  try {
    const [profile, archives] = await Promise.all([
      getPlayerProfile(username),
      getArchives(username),
    ])

    // Load the most recent month's games by default
    const latestArchiveUrl = archives[archives.length - 1]
    const initialGames = await getMonthGames(latestArchiveUrl)

    console.log(`Loaded ${initialGames.length} games from ${latestArchiveUrl}`)

    return (
      <main className="min-h-screen bg-zinc-950">
        <PlayerHeader profile={profile} />
        <GameList
          username={username}
          archives={archives}
          initialGames={initialGames}
          initialArchiveUrl={latestArchiveUrl}
        />
      </main>
    )
  } catch (error) {
    console.error('Failed to load player:', error)
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Not Found</h1>
          <p className="text-zinc-400 mb-8">
            Could not find player &quot;{username}&quot;
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg"
          >
            Back to Home
          </a>
        </div>
      </main>
    )
  }
}
