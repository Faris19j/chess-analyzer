'use client'
import { useRouter } from 'next/navigation'
import { useState, FormEvent } from 'react'

export function UsernameSearchForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const clean = username.trim().toLowerCase()

    if (!clean) {
      setError('Please enter a username')
      return
    }

    // Navigate directly - server will handle validation
    router.push(`/player/${clean}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="e.g. hikaru"
        className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-600 focus:border-green-500 focus:outline-none"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
      >
        View Games
      </button>
    </form>
  )
}
