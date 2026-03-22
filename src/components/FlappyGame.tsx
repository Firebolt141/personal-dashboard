import { useRef, useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2, Trophy, RotateCcw } from 'lucide-react'

const CANVAS_W = 320
const CANVAS_H = 200
const BIRD_SIZE = 16
const PIPE_WIDTH = 36
const PIPE_GAP = 60
const GRAVITY = 0.35
const JUMP = -5.5
const PIPE_SPEED = 1.8

type GameState = 'idle' | 'playing' | 'dead'

interface GameData {
  birdY: number
  birdVelocity: number
  pipes: Array<{ x: number; gapY: number; passed: boolean }>
  score: number
  frame: number
  state: GameState
}

function createGameData(): GameData {
  return {
    birdY: CANVAS_H / 2,
    birdVelocity: 0,
    pipes: [],
    score: 0,
    frame: 0,
    state: 'idle',
  }
}

function drawBird(ctx: CanvasRenderingContext2D, y: number) {
  ctx.fillStyle = '#f59e0b'
  ctx.beginPath()
  ctx.arc(60, y, BIRD_SIZE / 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fbbf24'
  ctx.beginPath()
  ctx.ellipse(55, y + 2, 6, 4, -0.3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(65, y - 3, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(66, y - 3, 1.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ef4444'
  ctx.beginPath()
  ctx.moveTo(68, y)
  ctx.lineTo(74, y + 2)
  ctx.lineTo(68, y + 4)
  ctx.closePath()
  ctx.fill()
}

function drawPipe(ctx: CanvasRenderingContext2D, x: number, gapY: number) {
  const gradient = ctx.createLinearGradient(x, 0, x + PIPE_WIDTH, 0)
  gradient.addColorStop(0, '#10b981')
  gradient.addColorStop(0.5, '#34d399')
  gradient.addColorStop(1, '#10b981')

  ctx.fillStyle = gradient
  ctx.fillRect(x, 0, PIPE_WIDTH, gapY)
  ctx.fillStyle = '#059669'
  ctx.fillRect(x - 3, gapY - 10, PIPE_WIDTH + 6, 10)

  ctx.fillStyle = gradient
  ctx.fillRect(x, gapY + PIPE_GAP, PIPE_WIDTH, CANVAS_H - gapY - PIPE_GAP)
  ctx.fillStyle = '#059669'
  ctx.fillRect(x - 3, gapY + PIPE_GAP, PIPE_WIDTH + 6, 10)
}

export default function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<GameData>(createGameData())
  const animRef = useRef<number>(0)
  const [gameState, setGameState] = useState<GameState>('idle')
  const [displayScore, setDisplayScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('flappy_high')
    return saved ? parseInt(saved, 10) : 0
  })
  const highScoreRef = useRef(highScore)

  const updateHighScore = useCallback((newScore: number) => {
    if (newScore > highScoreRef.current) {
      highScoreRef.current = newScore
      setHighScore(newScore)
      localStorage.setItem('flappy_high', String(newScore))
    }
  }, [])

  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current
      if (!canvas) { animRef.current = requestAnimationFrame(render); return }
      const ctx = canvas.getContext('2d')
      if (!ctx) { animRef.current = requestAnimationFrame(render); return }

      const g = gameRef.current

      // Clear
      ctx.fillStyle = '#0f1729'
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      for (let i = 0; i < 20; i++) {
        const sx = (i * 47 + g.frame * 0.1) % CANVAS_W
        const sy = (i * 31) % CANVAS_H
        ctx.fillRect(sx, sy, 1, 1)
      }

      // Ground
      ctx.fillStyle = '#1a2744'
      ctx.fillRect(0, CANVAS_H - 10, CANVAS_W, 10)
      ctx.fillStyle = '#243352'
      for (let gx = -g.frame % 20; gx < CANVAS_W; gx += 20) {
        ctx.fillRect(gx, CANVAS_H - 10, 10, 2)
      }

      if (g.state === 'idle') {
        drawBird(ctx, CANVAS_H / 2 + Math.sin(g.frame * 0.05) * 8)
        ctx.fillStyle = '#e2e8f0'
        ctx.font = '14px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Tap or Press Space to Play', CANVAS_W / 2, CANVAS_H / 2 + 40)
        g.frame++
        animRef.current = requestAnimationFrame(render)
        return
      }

      if (g.state === 'playing') {
        g.birdVelocity += GRAVITY
        g.birdY += g.birdVelocity

        // Spawn pipes
        if (g.frame % 100 === 0) {
          const gapY = 30 + Math.random() * (CANVAS_H - PIPE_GAP - 50)
          g.pipes.push({ x: CANVAS_W, gapY, passed: false })
        }

        // Update pipes
        g.pipes = g.pipes.filter(p => p.x > -PIPE_WIDTH)
        for (const pipe of g.pipes) {
          pipe.x -= PIPE_SPEED

          if (!pipe.passed && pipe.x + PIPE_WIDTH < 60) {
            pipe.passed = true
            g.score++
            setDisplayScore(g.score)
          }

          if (
            60 + BIRD_SIZE / 2 > pipe.x &&
            60 - BIRD_SIZE / 2 < pipe.x + PIPE_WIDTH
          ) {
            if (g.birdY - BIRD_SIZE / 2 < pipe.gapY || g.birdY + BIRD_SIZE / 2 > pipe.gapY + PIPE_GAP) {
              g.state = 'dead'
              setGameState('dead')
              updateHighScore(g.score)
            }
          }
        }

        if (g.birdY > CANVAS_H - 10 - BIRD_SIZE / 2 || g.birdY < BIRD_SIZE / 2) {
          g.state = 'dead'
          setGameState('dead')
          updateHighScore(g.score)
        }

        for (const pipe of g.pipes) drawPipe(ctx, pipe.x, pipe.gapY)
        drawBird(ctx, g.birdY)

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 20px JetBrains Mono, monospace'
        ctx.textAlign = 'center'
        ctx.fillText(String(g.score), CANVAS_W / 2, 28)
      }

      if (g.state === 'dead') {
        for (const pipe of g.pipes) drawPipe(ctx, pipe.x, pipe.gapY)
        drawBird(ctx, g.birdY)

        ctx.fillStyle = 'rgba(15, 15, 35, 0.6)'
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

        ctx.fillStyle = '#f43f5e'
        ctx.font = 'bold 18px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Game Over', CANVAS_W / 2, CANVAS_H / 2 - 10)

        ctx.fillStyle = '#e2e8f0'
        ctx.font = '12px Inter, sans-serif'
        ctx.fillText(`Score: ${g.score}`, CANVAS_W / 2, CANVAS_H / 2 + 12)
      }

      g.frame++
      animRef.current = requestAnimationFrame(render)
    }

    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [updateHighScore])

  const handleInput = useCallback(() => {
    const g = gameRef.current
    if (g.state === 'idle') {
      Object.assign(gameRef.current, createGameData())
      gameRef.current.state = 'playing'
      setGameState('playing')
      setDisplayScore(0)
    } else if (g.state === 'playing') {
      g.birdVelocity = JUMP
    } else if (g.state === 'dead') {
      Object.assign(gameRef.current, createGameData())
      setGameState('idle')
      setDisplayScore(0)
    }
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handleInput()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleInput])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass rounded-2xl overflow-hidden glass-hover"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 size={16} className="text-[var(--color-accent-amber)]" />
          <span className="text-sm font-semibold text-white">Flappy Bird</span>
          {gameState === 'playing' && (
            <span className="ml-2 text-xs font-mono text-[var(--color-accent-amber)]">
              Score: {displayScore}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Trophy size={12} className="text-[var(--color-accent-amber)]" />
            {highScore}
          </div>
          {gameState === 'dead' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleInput() }}
              className="flex items-center gap-1 text-[var(--color-primary-light)] hover:text-white transition-colors"
            >
              <RotateCcw size={12} />
              Retry
            </button>
          )}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="game-canvas w-full"
        onClick={handleInput}
        onTouchStart={(e) => { e.preventDefault(); handleInput() }}
      />
    </motion.div>
  )
}
