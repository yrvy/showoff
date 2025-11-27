import { Link } from 'react-router-dom'
import { Trophy, Gamepad2, Video, Medal, Sparkles, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-radial-primary opacity-20"></div>
        <div className="absolute top-1/2 right-0 bg-gradient-radial-accent opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-900/30 border border-primary-800 text-primary-400">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">The Ultimate Gaming Profile Platform</span>
              </div>
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold mb-6">
              <span className="text-gradient">Show Off</span>
              <br />
              <span className="text-white">Your Gaming Setup</span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Create your personalized gaming profile. Showcase your peripherals, share epic clips,
              and display your ranks. All in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn btn-primary text-lg px-8 py-3 inline-flex items-center gap-2">
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/login" className="btn btn-outline text-lg px-8 py-3">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          Everything You Need to <span className="text-gradient">Stand Out</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="card group hover:border-primary-700 transition-all cursor-pointer">
            <div className="h-12 w-12 rounded-lg bg-primary-900/30 flex items-center justify-center mb-4 group-hover:bg-primary-900/50 transition-all">
              <Gamepad2 className="h-6 w-6 text-primary-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Peripherals Showcase</h3>
            <p className="text-gray-400">
              Display your gaming gear with images and links. Let others know what you use to dominate.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card group hover:border-accent-700 transition-all cursor-pointer">
            <div className="h-12 w-12 rounded-lg bg-accent-900/30 flex items-center justify-center mb-4 group-hover:bg-accent-900/50 transition-all">
              <Video className="h-6 w-6 text-accent-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Epic Clips</h3>
            <p className="text-gray-400">
              Upload and share your best gaming moments. Track views and likes on your highlights.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card group hover:border-primary-700 transition-all cursor-pointer">
            <div className="h-12 w-12 rounded-lg bg-primary-900/30 flex items-center justify-center mb-4 group-hover:bg-primary-900/50 transition-all">
              <Medal className="h-6 w-6 text-primary-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Game Ranks</h3>
            <p className="text-gray-400">
              Show off your competitive ranks across multiple games. Prove your skills.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="card group hover:border-accent-700 transition-all cursor-pointer">
            <div className="h-12 w-12 rounded-lg bg-accent-900/30 flex items-center justify-center mb-4 group-hover:bg-accent-900/50 transition-all">
              <Trophy className="h-6 w-6 text-accent-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Verified Profiles</h3>
            <p className="text-gray-400">
              Get verified and stand out from the crowd. Build your reputation in the community.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="card text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-accent-900/20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to <span className="text-gradient">Show Off</span>?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join the community and create your gaming profile in minutes.
            </p>
            <Link to="/signup" className="btn btn-primary text-lg px-8 py-3 inline-flex items-center gap-2">
              Create Your Profile <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
