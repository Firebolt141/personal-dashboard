import type { WeatherDay } from '../types/weather'

const conditions = [
  { condition: 'Sunny', icon: '☀️' },
  { condition: 'Partly Cloudy', icon: '⛅' },
  { condition: 'Cloudy', icon: '☁️' },
  { condition: 'Light Rain', icon: '🌦️' },
  { condition: 'Rain', icon: '🌧️' },
  { condition: 'Clear', icon: '🌙' },
]

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function generateWeatherData(): WeatherDay[] {
  const today = new Date()
  const data: WeatherDay[] = []

  for (let i = 0; i < 15; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
    const rand = seededRandom(seed)
    const conditionIndex = Math.floor(rand * conditions.length)
    const baseTemp = 12 + Math.floor(seededRandom(seed + 1) * 10)

    data.push({
      date: `${monthNames[date.getMonth()]} ${date.getDate()}`,
      day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[date.getDay()],
      temp: baseTemp + Math.floor(seededRandom(seed + 2) * 5),
      tempMin: baseTemp - 2 + Math.floor(seededRandom(seed + 3) * 3),
      tempMax: baseTemp + 3 + Math.floor(seededRandom(seed + 4) * 5),
      condition: conditions[conditionIndex].condition,
      icon: conditions[conditionIndex].icon,
      humidity: 40 + Math.floor(seededRandom(seed + 5) * 40),
      windSpeed: 5 + Math.floor(seededRandom(seed + 6) * 20),
      precipitation: Math.floor(seededRandom(seed + 7) * 60),
    })
  }

  return data
}
