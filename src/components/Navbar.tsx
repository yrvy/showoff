import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/auth'
import { User, LogOut, LayoutDashboard, Trophy, Play } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      navigate('/')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-dark-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Trophy className="h-6 w-6 text-white group-hover:text-dark-200 transition-colors" />
            <span className="text-xl font-semibold text-white tracking-tight">ShowOff</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {/* For You - Always visible */}
            <Link
              to="/foryou"
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-dark-850 rounded-md transition-all font-medium"
            >
              <Play className="h-4 w-4" fill="currentColor" />
              <span>For You</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-850 rounded-md transition-all"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                {profile && (
                  <Link
                    to={`/${profile.username}`}
                    className="flex items-center gap-2 px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-850 rounded-md transition-all"
                  >
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="h-6 w-6 rounded-full object-cover border border-dark-700"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{profile.username}</span>
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-850 rounded-md transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline text-sm">
                  Log In
                </Link>
                <Link to="/signup" className="btn btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
