import { motion } from 'framer-motion'
import HeroGif from './components/HeroGif'
import QuickStats from './components/QuickStats'
import FitnessCard from './components/FitnessCard'
import WeatherCard from './components/WeatherCard'
import Game2048 from './components/Game2048'
import Calendar from './components/Calendar'

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] relative">
      {/* Ambient neon glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-[var(--color-neon-purple)]/[0.04] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-20 w-48 h-48 bg-[var(--color-neon-blue)]/[0.04] rounded-full blur-[80px]" />
        <div className="absolute bottom-20 -left-10 w-40 h-40 bg-[var(--color-neon-pink)]/[0.03] rounded-full blur-[60px]" />
      </div>

      {/* Mobile-first single column */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-3 pt-2 pb-8 space-y-3">
        <HeroGif />
        <QuickStats />
        <FitnessCard />
        <WeatherCard />
        <Game2048 />
        <Calendar />

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="text-center pt-4 pb-2"
        >
          <div className="neon-divider mb-3" />
          <p className="text-[9px] font-mono text-gray-700 uppercase tracking-[0.2em]">
            Personal Dashboard
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
