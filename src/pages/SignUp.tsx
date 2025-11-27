import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '@/lib/auth'
import { isValidUsername } from '@/lib/utils'
import { Trophy } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignUp() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidUsername(username)) {
      toast.error('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, username)
      toast.success('Account created! Please check your email to verify your account.')
      navigate('/login')
    } catch (error: any) {
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered')
      } else if (error.message.includes('username')) {
        toast.error('This username is already taken')
      } else {
        toast.error(error.message || 'Failed to create account')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Trophy className="h-12 w-12 text-primary-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create Your Profile</h1>
          <p className="text-gray-400">Join ShowOff and start showcasing your gaming setup</p>
        </div>

        {/* SignUp Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="input"
                placeholder="your_username"
                required
                minLength={3}
                maxLength={30}
              />
              <p className="mt-1 text-xs text-gray-500">
                3-30 characters. Letters, numbers, underscores, and hyphens only.
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
