import { motion } from 'framer-motion'

export default function HeroGif() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-full rounded-xl overflow-hidden glass glow"
    >
      <div className="relative w-full h-36 sm:h-48">
        <img
          src="/gifs/bonfire.gif"
          alt="Elden Ring Bonfire"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4">
          <motion.h1
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xl font-bold text-white drop-shadow-lg"
          >
            Personal Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-xs text-gray-300 mt-0.5 font-light"
          >
            Rest here, Tarnished
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}
