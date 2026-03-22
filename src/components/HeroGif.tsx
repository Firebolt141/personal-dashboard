import { motion } from 'framer-motion'

export default function HeroGif() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full rounded-xl overflow-hidden card"
    >
      <div className="relative w-full h-28 sm:h-36">
        <img
          src="/gifs/bonfire.gif"
          alt="Bonfire"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/60 to-transparent" />
        <div className="absolute bottom-3 left-4">
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-sm text-[var(--color-text-secondary)]"
          >
            Rest here,
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-lg font-semibold text-white tracking-tight"
          >
            Firebolt141
          </motion.h1>
        </div>
      </div>
    </motion.div>
  )
}
