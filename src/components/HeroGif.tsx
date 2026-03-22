import { motion } from 'framer-motion'

export default function HeroGif() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-full rounded-xl overflow-hidden neon-card glow-purple scanlines"
    >
      <div className="relative w-full h-32 sm:h-44">
        <img
          src="/gifs/bonfire.gif"
          alt="Elden Ring Bonfire"
          className="w-full h-full object-cover opacity-80"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-neon-purple)]/10 via-transparent to-[var(--color-neon-blue)]/10" />

        {/* Title */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-lg font-bold neon-text-purple tracking-wide"
            >
              DASHBOARD
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-[10px] text-gray-400 mt-0.5 font-mono uppercase tracking-[0.2em]"
            >
              Rest here, Tarnished
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-[10px] font-mono text-gray-500"
          >
            v2.0
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
