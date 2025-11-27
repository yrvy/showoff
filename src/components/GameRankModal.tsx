import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase, GameRank } from '@/lib/supabase'
import { X, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

interface GameRankModalProps {
  gameRank: GameRank | null
  onClose: () => void
  onSuccess: () => void
}

export default function GameRankModal({ gameRank, onClose, onSuccess }: GameRankModalProps) {
  const { profile } = useAuth()
  const [game, setGame] = useState(gameRank?.game || 'valorant')
  const [rank, setRank] = useState(gameRank?.rank || '')
  const [rankTier, setRankTier] = useState(gameRank?.rank_tier || '')
  const [peakRank, setPeakRank] = useState(gameRank?.peak_rank || '')
  const [hoursPlayed, setHoursPlayed] = useState(gameRank?.hours_played?.toString() || '')
  const [isPrimary, setIsPrimary] = useState(gameRank?.is_primary || false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile) return

    setLoading(true)

    try {
      const gameRankData = {
        user_id: profile.id,
        game,
        rank,
        rank_tier: rankTier || null,
        peak_rank: peakRank || null,
        hours_played: hoursPlayed ? parseInt(hoursPlayed) : null,
        is_primary: isPrimary,
      }

      if (gameRank) {
        // Update existing
        const { error } = await supabase
          .from('game_ranks')
          .update(gameRankData)
          .eq('id', gameRank.id)

        if (error) throw error
        toast.success('Rank updated!')
      } else {
        // Create new
        const { error } = await supabase.from('game_ranks').insert(gameRankData)

        if (error) {
          if (error.message.includes('duplicate')) {
            toast.error('You already have a rank for this game')
          } else {
            throw error
          }
        } else {
          toast.success('Rank added!')
        }
      }

      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save rank')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{gameRank ? 'Edit Rank' : 'Add Rank'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" disabled={loading}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="game" className="block text-sm font-medium mb-2">
              Game *
            </label>
            <select
              id="game"
              value={game}
              onChange={(e) => setGame(e.target.value as any)}
              className="input"
              required
              disabled={loading || !!gameRank}
            >
              <option value="valorant">Valorant</option>
              <option value="cs2">Counter-Strike 2</option>
              <option value="r6">Rainbow Six Siege</option>
              <option value="apex">Apex Legends</option>
              <option value="league">League of Legends</option>
              <option value="overwatch">Overwatch 2</option>
              <option value="fortnite">Fortnite</option>
              <option value="cod">Call of Duty</option>
              <option value="other">Other</option>
            </select>
            {gameRank && (
              <p className="mt-1 text-xs text-gray-500">Game cannot be changed after creation</p>
            )}
          </div>

          <div>
            <label htmlFor="rank" className="block text-sm font-medium mb-2">
              Rank *
            </label>
            <input
              id="rank"
              type="text"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              className="input"
              placeholder="Radiant"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="rankTier" className="block text-sm font-medium mb-2">
              Rank Tier
            </label>
            <input
              id="rankTier"
              type="text"
              value={rankTier}
              onChange={(e) => setRankTier(e.target.value)}
              className="input"
              placeholder="Radiant (or Iron 1, Gold 3, etc)"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">Optional: More specific rank tier</p>
          </div>

          <div>
            <label htmlFor="peakRank" className="block text-sm font-medium mb-2">
              Peak Rank
            </label>
            <input
              id="peakRank"
              type="text"
              value={peakRank}
              onChange={(e) => setPeakRank(e.target.value)}
              className="input"
              placeholder="Your highest rank achieved"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="hoursPlayed" className="block text-sm font-medium mb-2">
              Hours Played
            </label>
            <input
              id="hoursPlayed"
              type="number"
              value={hoursPlayed}
              onChange={(e) => setHoursPlayed(e.target.value)}
              className="input"
              placeholder="1000"
              min="0"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isPrimary"
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="h-4 w-4 rounded border-dark-700 bg-dark-900 text-primary-600 focus:ring-primary-600"
              disabled={loading}
            />
            <label htmlFor="isPrimary" className="text-sm font-medium">
              Set as primary game
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : gameRank ? (
                'Update'
              ) : (
                'Add Rank'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
