import { motion } from 'framer-motion'
import HeroGif from './components/HeroGif'
import FitnessCard from './components/FitnessCard'
import WeatherCard from './components/WeatherCard'
import DinoGame from './components/DinoGame'
import Calendar from './components/Calendar'

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="w-full max-w-lg mx-auto px-3 pt-2 pb-10 space-y-2.5">
        <HeroGif />
        <WeatherCard />
        <FitnessCard />
        <Calendar />
        <DinoGame />

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center pt-6 pb-2"
        >
          <p className="text-[9px] text-[var(--color-text-faint)]">
            Personal Dashboard
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
