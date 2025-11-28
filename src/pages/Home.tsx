import { Link } from 'react-router-dom'
import { Play, LayoutDashboard, Trophy, Video, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const { user } = useAuth()

  // Show For You page if logged in
  if (user) {
    return (
      <div className="relative overflow-hidden bg-black min-h-[calc(100vh-3.5rem)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-6xl sm:text-8xl font-bold mb-8 tracking-tight">
              <span className="text-white">Welcome Back</span>
            </h1>

            <p className="text-xl sm:text-2xl text-dark-400 mb-12 max-w-2xl mx-auto font-light tracking-tight">
              Ready to watch some clips?
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/foryou" className="btn btn-primary text-lg px-10 py-4 inline-flex items-center gap-3 group">
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform" fill="currentColor" />
                Watch For You Feed
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/dashboard" className="btn btn-outline text-lg px-10 py-4 inline-flex items-center gap-3">
                <LayoutDashboard className="h-5 w-5" />
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show landing page if not logged in
  return (
    <div className="relative overflow-hidden bg-black min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm text-white/80 font-medium">Join the gaming community</span>
            </div>

            <h1 className="text-6xl sm:text-8xl font-bold mb-8 tracking-tight animate-fade-in">
              <span className="text-white">Show Off</span>
              <br />
              <span className="text-dark-500">Your Setup</span>
            </h1>

            <p className="text-xl sm:text-2xl text-dark-400 mb-12 max-w-2xl mx-auto font-light tracking-tight animate-slide-up">
              Share your gaming clips. Showcase your setup. Build your profile.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <Link to="/signup" className="btn btn-primary text-lg px-10 py-4 inline-flex items-center gap-3 group">
                Get Started
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/foryou" className="btn btn-outline text-lg px-10 py-4 inline-flex items-center gap-3 group">
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform" fill="currentColor" />
                Watch Clips
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Feature 1 */}
          <div className="group cursor-pointer transform hover:-translate-y-1 transition-all duration-300">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center mb-6 group-hover:border-white/30 group-hover:bg-white/10 transition-all">
              <Video className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white tracking-tight">Share Clips</h3>
            <p className="text-dark-400 text-base font-light leading-relaxed">
              Upload your best gaming moments. Get views, likes, and comments from the community.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group cursor-pointer transform hover:-translate-y-1 transition-all duration-300">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center mb-6 group-hover:border-white/30 group-hover:bg-white/10 transition-all">
              <LayoutDashboard className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white tracking-tight">Your Profile</h3>
            <p className="text-dark-400 text-base font-light leading-relaxed">
              Showcase your gaming peripherals, ranks, and stats. Build your complete profile.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group cursor-pointer transform hover:-translate-y-1 transition-all duration-300">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center mb-6 group-hover:border-white/30 group-hover:bg-white/10 transition-all">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white tracking-tight">Get Verified</h3>
            <p className="text-dark-400 text-base font-light leading-relaxed">
              Build your reputation. Earn verification and stand out from the crowd.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 mb-24">
        <div className="text-center border border-white/10 rounded-3xl p-16 bg-white/5 backdrop-blur-2xl transform hover:scale-[1.02] transition-all duration-300">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white tracking-tight">
            Ready to start?
          </h2>
          <p className="text-xl text-dark-400 mb-10 font-light">
            Join thousands of gamers showcasing their skills.
          </p>
          <Link to="/signup" className="btn btn-primary text-lg px-12 py-4 inline-flex items-center gap-3 group">
            Create Your Profile
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}
