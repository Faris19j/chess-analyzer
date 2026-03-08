import type {
  ChessComPlayer,
  ChessComGame,
  ChessComMonthGames,
  ChessComArchives,
} from '@/types/chesscom'

const BASE = 'https://api.chess.com/pub'

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithRetry(
  url: string,
  retries = 3
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'ChessViewer/1.0' },
      })
      if (res.ok) return res
      if (res.status === 429) await delay(1000 * (i + 1)) // Rate limit backoff
    } catch (e) {
      if (i === retries - 1) throw e
      await delay(500)
    }
  }
  throw new Error(`Failed to fetch ${url}`)
}

export async function getPlayerProfile(
  username: string
): Promise<ChessComPlayer> {
  const url = `${BASE}/player/${username.toLowerCase()}`
  const res = await fetchWithRetry(url)
  return res.json()
}

export async function getArchives(username: string): Promise<string[]> {
  const url = `${BASE}/player/${username.toLowerCase()}/games/archives`
  const res = await fetchWithRetry(url)
  const data: ChessComArchives = await res.json()
  return data.archives
}

export async function getMonthGames(archiveUrl: string): Promise<ChessComGame[]> {
  const res = await fetchWithRetry(archiveUrl)
  const data: ChessComMonthGames = await res.json()
  return data.games
}
