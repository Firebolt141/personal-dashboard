import { motion } from 'framer-motion'

export default function HeroGif() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative w-full rounded-2xl overflow-hidden glass glow"
    >
      <div className="relative w-full h-48 sm:h-64 md:h-72">
        <img
          src="/gifs/bonfire.gif"
          alt="Elden Ring Bonfire"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent" />
        <div className="absolute bottom-4 left-6">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg"
          >
            Personal Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-sm text-gray-300 mt-1 font-light"
          >
            Rest here, Tarnished
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}
