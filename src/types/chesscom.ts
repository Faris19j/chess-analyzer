export interface ChessComPlayer {
  username: string
  player_id: number
  url: string
  name?: string
  avatar?: string
  country: string
  joined: number
  last_online: number
}

export interface ChessComGamePlayer {
  username: string
  rating: number
  result:
    | 'win'
    | 'resigned'
    | 'timeout'
    | 'checkmated'
    | 'stalemate'
    | 'agreed'
    | 'insufficient'
    | 'repetition'
    | '50move'
    | 'abandoned'
    | 'timevsinsufficient'
  uuid: string
}

export interface ChessComGame {
  url: string
  pgn: string
  time_control: string
  end_time: number
  rated: boolean
  fen: string
  time_class: 'daily' | 'rapid' | 'blitz' | 'bullet'
  rules: 'chess' | 'chess960' | 'bughouse' | 'kingofthehill'
  white: ChessComGamePlayer
  black: ChessComGamePlayer
  accuracies?: { white: number; black: number }
}

export interface ChessComArchives {
  archives: string[]
}

export interface ChessComMonthGames {
  games: ChessComGame[]
}
