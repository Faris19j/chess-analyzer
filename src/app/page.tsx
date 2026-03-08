import { UsernameSearchForm } from '@/components/home/UsernameSearchForm'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Chess Viewer
        </h1>
        <p className="text-zinc-400 text-center mb-8">
          Enter your chess.com username to explore your games
        </p>
        <UsernameSearchForm />
      </div>
    </main>
  )
}
