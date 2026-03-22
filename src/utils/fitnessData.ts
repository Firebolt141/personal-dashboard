export interface FitnessData {
  steps: number
  stepGoal: number
  distance: number // km
  calories: number
  calorieGoal: number
  activeMinutes: number
  activeMinuteGoal: number
  heartRate: number
  weeklySteps: { day: string; steps: number }[]
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function generateFitnessData(): FitnessData {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const hour = today.getHours()

  // Steps increase throughout the day
  const dayProgress = Math.min(hour / 22, 1)
  const baseSteps = 3000 + Math.floor(seededRandom(seed) * 5000)
  const steps = Math.floor(baseSteps * dayProgress + seededRandom(seed + 1) * 2000 * dayProgress)

  const stepGoal = 10000
  const distance = Math.round((steps * 0.0008) * 10) / 10
  const calories = Math.floor(steps * 0.04 + seededRandom(seed + 2) * 200)
  const calorieGoal = 500
  const activeMinutes = Math.floor(steps / 100 + seededRandom(seed + 3) * 15)
  const activeMinuteGoal = 60
  const heartRate = 62 + Math.floor(seededRandom(seed + 4) * 15)

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const todayIndex = (today.getDay() + 6) % 7 // Monday = 0

  const weeklySteps = dayNames.map((day, i) => {
    if (i > todayIndex) {
      return { day, steps: 0 }
    }
    if (i === todayIndex) {
      return { day, steps }
    }
    const daySeed = seed - (todayIndex - i)
    return {
      day,
      steps: 4000 + Math.floor(seededRandom(daySeed) * 9000),
    }
  })

  return {
    steps,
    stepGoal,
    distance,
    calories,
    calorieGoal,
    activeMinutes,
    activeMinuteGoal,
    heartRate,
    weeklySteps,
  }
}
