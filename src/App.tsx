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
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-10 w-60 h-60 bg-[var(--color-accent-cyan)]/5 rounded-full blur-3xl" />
      </div>

      {/* Mobile-first single column, max-width for tablets/desktop */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-3 pt-2 pb-8 space-y-3">
        <HeroGif />
        <QuickStats />
        <WeatherCard />
        <FlappyGame />
        <Calendar />

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center pt-4 pb-2 text-[10px] text-gray-600"
        >
          Personal Dashboard
        </motion.footer>
      </div>
    </div>
  )
}
