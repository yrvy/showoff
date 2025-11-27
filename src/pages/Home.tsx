import { Link } from 'react-router-dom'
import { Play, LayoutDashboard, Trophy, Video } from 'lucide-react'

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-black min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-6xl sm:text-8xl font-bold mb-8 tracking-tight">
              <span className="text-white">Show Off</span>
              <br />
              <span className="text-dark-500">Your Setup</span>
            </h1>

            <p className="text-xl sm:text-2xl text-dark-400 mb-12 max-w-2xl mx-auto font-light tracking-tight">
              Create your gaming profile. Share clips. Build your audience.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link to="/foryou" className="btn btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
                <Play className="h-4 w-4" fill="currentColor" />
                Watch Clips
              </Link>
              <Link to="/signup" className="btn btn-outline text-base px-8 py-3">
                Create Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group cursor-pointer">
            <div className="h-14 w-14 rounded-2xl bg-dark-900 border border-dark-850 flex items-center justify-center mb-6 group-hover:border-white transition-all">
              <Video className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white tracking-tight">Share Clips</h3>
            <p className="text-dark-400 text-base font-light leading-relaxed">
              Upload your best gaming moments. Get views, likes, and comments from the community.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group cursor-pointer">
            <div className="h-14 w-14 rounded-2xl bg-dark-900 border border-dark-850 flex items-center justify-center mb-6 group-hover:border-white transition-all">
              <LayoutDashboard className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white tracking-tight">Your Setup</h3>
            <p className="text-dark-400 text-base font-light leading-relaxed">
              Showcase your gaming peripherals, ranks, and stats. Build your complete profile.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group cursor-pointer">
            <div className="h-14 w-14 rounded-2xl bg-dark-900 border border-dark-850 flex items-center justify-center mb-6 group-hover:border-white transition-all">
              <Trophy className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white tracking-tight">Get Verified</h3>
            <p className="text-dark-400 text-base font-light leading-relaxed">
              Build your reputation. Earn verification and stand out from the crowd.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center border border-dark-850 rounded-3xl p-12 bg-dark-900/30">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white tracking-tight">
            Ready to start?
          </h2>
          <p className="text-xl text-dark-400 mb-10 font-light">
            Join thousands of gamers showcasing their skills.
          </p>
          <Link to="/signup" className="btn btn-primary text-base px-10 py-3.5 inline-flex items-center gap-2">
            Create Your Profile
          </Link>
        </div>
      </div>
    </div>
  )
}
