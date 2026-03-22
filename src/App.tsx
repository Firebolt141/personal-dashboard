import { motion } from 'framer-motion'
import HeroGif from './components/HeroGif'
import QuickStats from './components/QuickStats'
import WeatherCard from './components/WeatherCard'
import FlappyGame from './components/FlappyGame'
import Calendar from './components/Calendar'

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--color-accent-cyan)]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Hero GIF */}
        <HeroGif />

        {/* Quick Stats */}
        <QuickStats />

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column */}
          <div className="space-y-4">
            <WeatherCard />
            <FlappyGame />
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <Calendar />
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center py-6 text-xs text-gray-600"
        >
          Personal Dashboard &middot; Built with React + Vite + Tailwind
        </motion.footer>
      </div>
    </div>
  )
}
