import HeroGif from './components/HeroGif'
import FitnessCard from './components/FitnessCard'
import WeatherCard from './components/WeatherCard'
import DinoGame from './components/DinoGame'
import Calendar from './components/Calendar'

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="w-full max-w-lg mx-auto px-3 pt-2 pb-6 space-y-2">
        <HeroGif />
        <WeatherCard />
        <FitnessCard />
        <Calendar />
        <DinoGame />
      </div>
    </div>
  )
}
