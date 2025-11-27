import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase, Peripheral, GameRank, Clip } from '@/lib/supabase'
import { Edit, Plus, Trash2, Eye, Heart, ExternalLink } from 'lucide-react'
import { formatRelativeTime, formatNumber } from '@/lib/utils'
import toast from 'react-hot-toast'
import ClipUploadModal from '@/components/ClipUploadModal'
import PeripheralModal from '@/components/PeripheralModal'
import GameRankModal from '@/components/GameRankModal'

export default function Dashboard() {
  const { profile } = useAuth()
  const [peripherals, setPeripherals] = useState<Peripheral[]>([])
  const [gameRanks, setGameRanks] = useState<GameRank[]>([])
  const [clips, setClips] = useState<Clip[]>([])
  const [loading, setLoading] = useState(true)

  const [showClipModal, setShowClipModal] = useState(false)
  const [showPeripheralModal, setShowPeripheralModal] = useState(false)
  const [showGameRankModal, setShowGameRankModal] = useState(false)
  const [editingPeripheral, setEditingPeripheral] = useState<Peripheral | null>(null)
  const [editingGameRank, setEditingGameRank] = useState<GameRank | null>(null)

  useEffect(() => {
    if (profile) {
      fetchData()
    }
  }, [profile])

  async function fetchData() {
    try {
      const [peripheralsRes, gameRanksRes, clipsRes] = await Promise.all([
        supabase.from('peripherals').select('*').eq('user_id', profile!.id).order('display_order'),
        supabase.from('game_ranks').select('*').eq('user_id', profile!.id).order('is_primary', { ascending: false }),
        supabase.from('clips').select('*').eq('user_id', profile!.id).order('created_at', { ascending: false }),
      ])

      if (peripheralsRes.error) throw peripheralsRes.error
      if (gameRanksRes.error) throw gameRanksRes.error
      if (clipsRes.error) throw clipsRes.error

      setPeripherals(peripheralsRes.data || [])
      setGameRanks(gameRanksRes.data || [])
      setClips(clipsRes.data || [])
    } catch (error: any) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function deletePeripheral(id: string) {
    if (!confirm('Are you sure you want to delete this peripheral?')) return

    try {
      const { error } = await supabase.from('peripherals').delete().eq('id', id)
      if (error) throw error

      setPeripherals(peripherals.filter((p) => p.id !== id))
      toast.success('Peripheral deleted')
    } catch (error) {
      toast.error('Failed to delete peripheral')
    }
  }

  async function deleteGameRank(id: string) {
    if (!confirm('Are you sure you want to delete this rank?')) return

    try {
      const { error } = await supabase.from('game_ranks').delete().eq('id', id)
      if (error) throw error

      setGameRanks(gameRanks.filter((r) => r.id !== id))
      toast.success('Rank deleted')
    } catch (error) {
      toast.error('Failed to delete rank')
    }
  }

  async function deleteClip(id: string) {
    if (!confirm('Are you sure you want to delete this clip?')) return

    try {
      const { error } = await supabase.from('clips').delete().eq('id', id)
      if (error) throw error

      setClips(clips.filter((c) => c.id !== id))
      toast.success('Clip deleted')
    } catch (error) {
      toast.error('Failed to delete clip')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">Manage your gaming profile</p>
        </div>
        <div className="flex gap-3">
          <Link to={`/${profile?.username}`} className="btn btn-outline">
            <Eye className="h-4 w-4 mr-2" />
            View Profile
          </Link>
          <Link to="/dashboard/edit" className="btn btn-primary">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Peripherals Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Peripherals</h2>
          <button
            onClick={() => {
              setEditingPeripheral(null)
              setShowPeripheralModal(true)
            }}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Peripheral
          </button>
        </div>

        {peripherals.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 mb-4">No peripherals yet. Add your gaming gear!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {peripherals.map((peripheral) => (
              <div key={peripheral.id} className="card">
                {peripheral.image_url && (
                  <img
                    src={peripheral.image_url}
                    alt={peripheral.model}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">{peripheral.category}</p>
                    <h3 className="font-bold">{peripheral.brand} {peripheral.model}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingPeripheral(peripheral)
                        setShowPeripheralModal(true)
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deletePeripheral(peripheral.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {peripheral.purchase_url && (
                  <a
                    href={peripheral.purchase_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  >
                    View Product <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Game Ranks Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Game Ranks</h2>
          <button
            onClick={() => {
              setEditingGameRank(null)
              setShowGameRankModal(true)
            }}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Rank
          </button>
        </div>

        {gameRanks.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 mb-4">No ranks yet. Add your competitive ranks!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameRanks.map((rank) => (
              <div key={rank.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">{rank.game}</p>
                    <h3 className="font-bold text-lg">{rank.rank_tier || rank.rank}</h3>
                    {rank.peak_rank && (
                      <p className="text-sm text-gray-400">Peak: {rank.peak_rank}</p>
                    )}
                    {rank.hours_played && (
                      <p className="text-xs text-gray-500 mt-1">{rank.hours_played} hours</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingGameRank(rank)
                        setShowGameRankModal(true)
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteGameRank(rank.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {rank.is_primary && (
                  <span className="badge badge-primary text-xs">Primary Game</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Clips Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Clips</h2>
          <button onClick={() => setShowClipModal(true)} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Upload Clip
          </button>
        </div>

        {clips.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 mb-4">No clips yet. Upload your best moments!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clips.map((clip) => (
              <div key={clip.id} className="card p-0 overflow-hidden">
                {clip.thumbnail_url ? (
                  <img
                    src={clip.thumbnail_url}
                    alt={clip.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-dark-800 flex items-center justify-center">
                    <p className="text-gray-500">No thumbnail</p>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold mb-1 truncate">{clip.title}</h3>
                  {clip.description && (
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">{clip.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {formatNumber(clip.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {formatNumber(clip.likes)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{formatRelativeTime(clip.created_at)}</p>
                    <button
                      onClick={() => deleteClip(clip.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      {showClipModal && (
        <ClipUploadModal
          onClose={() => setShowClipModal(false)}
          onSuccess={() => {
            setShowClipModal(false)
            fetchData()
          }}
        />
      )}

      {showPeripheralModal && (
        <PeripheralModal
          peripheral={editingPeripheral}
          onClose={() => {
            setShowPeripheralModal(false)
            setEditingPeripheral(null)
          }}
          onSuccess={() => {
            setShowPeripheralModal(false)
            setEditingPeripheral(null)
            fetchData()
          }}
        />
      )}

      {showGameRankModal && (
        <GameRankModal
          gameRank={editingGameRank}
          onClose={() => {
            setShowGameRankModal(false)
            setEditingGameRank(null)
          }}
          onSuccess={() => {
            setShowGameRankModal(false)
            setEditingGameRank(null)
            fetchData()
          }}
        />
      )}
    </div>
  )
}
