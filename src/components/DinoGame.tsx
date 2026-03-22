import { useRef, useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2, Trophy, RotateCcw } from 'lucide-react'

const W = 320
const H = 120
const GROUND_Y = H - 16
const DINO_W = 20
const DINO_H = 22
const DINO_X = 30
const GRAVITY = 0.6
const JUMP_FORCE = -9
const OBSTACLE_SPEED_BASE = 3
const OBSTACLE_MIN_GAP = 80

type State = 'idle' | 'playing' | 'dead'

interface Obstacle {
  x: number
  w: number
  h: number
  type: 'cactus' | 'bird'
  birdY?: number
  passed: boolean
}

interface Game {
  state: State
  dinoY: number
  velocity: number
  ducking: boolean
  obstacles: Obstacle[]
  score: number
  frame: number
  speed: number
  nextSpawn: number
}

function create(): Game {
  return {
    state: 'idle',
    dinoY: GROUND_Y - DINO_H,
    velocity: 0,
    ducking: false,
    obstacles: [],
    score: 0,
    frame: 0,
    speed: OBSTACLE_SPEED_BASE,
    nextSpawn: 60,
  }
}

function drawDino(ctx: CanvasRenderingContext2D, y: number, ducking: boolean, frame: number) {
  const bodyH = ducking ? 12 : DINO_H
  const bodyY = ducking ? GROUND_Y - 12 : y
  ctx.fillStyle = '#a1a1aa'

  // Body
  ctx.fillRect(DINO_X, bodyY, DINO_W, bodyH)

  // Head
  if (!ducking) {
    ctx.fillRect(DINO_X + 8, bodyY - 8, 14, 10)
    ctx.fillStyle = '#09090b'
    ctx.fillRect(DINO_X + 18, bodyY - 6, 2, 2) // eye
    ctx.fillStyle = '#a1a1aa'
  } else {
    ctx.fillRect(DINO_X + 10, bodyY - 4, 16, 8)
    ctx.fillStyle = '#09090b'
    ctx.fillRect(DINO_X + 22, bodyY - 2, 2, 2)
    ctx.fillStyle = '#a1a1aa'
  }

  // Legs (animated)
  const legPhase = Math.floor(frame / 6) % 2
  if (y >= GROUND_Y - DINO_H - 1) {
    if (legPhase === 0) {
      ctx.fillRect(DINO_X + 4, bodyY + bodyH, 4, 6)
      ctx.fillRect(DINO_X + 12, bodyY + bodyH, 4, 3)
    } else {
      ctx.fillRect(DINO_X + 4, bodyY + bodyH, 4, 3)
      ctx.fillRect(DINO_X + 12, bodyY + bodyH, 4, 6)
    }
  } else {
    ctx.fillRect(DINO_X + 4, bodyY + bodyH, 4, 4)
    ctx.fillRect(DINO_X + 12, bodyY + bodyH, 4, 4)
  }
}

function drawCactus(ctx: CanvasRenderingContext2D, x: number, h: number) {
  ctx.fillStyle = '#52525b'
  ctx.fillRect(x, GROUND_Y - h, 8, h)
  ctx.fillRect(x - 4, GROUND_Y - h + 6, 6, 4)
  ctx.fillRect(x + 6, GROUND_Y - h + 10, 6, 4)
}

function drawBird(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  ctx.fillStyle = '#71717a'
  ctx.fillRect(x, y, 16, 6)
  const wingY = Math.floor(frame / 8) % 2 === 0 ? -4 : 3
  ctx.fillRect(x + 4, y + wingY, 8, 3)
}

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game>(create())
  const animRef = useRef(0)
  const [gameState, setGameState] = useState<State>('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    const s = localStorage.getItem('dino_high')
    return s ? parseInt(s, 10) : 0
  })
  const highRef = useRef(highScore)

  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current
      if (!canvas) { animRef.current = requestAnimationFrame(render); return }
      const ctx = canvas.getContext('2d')
      if (!ctx) { animRef.current = requestAnimationFrame(render); return }
      const g = gameRef.current

      // Clear
      ctx.fillStyle = '#09090b'
      ctx.fillRect(0, 0, W, H)

      // Ground line
      ctx.fillStyle = '#27272a'
      ctx.fillRect(0, GROUND_Y, W, 1)

      // Ground texture
      ctx.fillStyle = '#1f1f23'
      for (let gx = -g.frame % 12; gx < W; gx += 12) {
        ctx.fillRect(gx, GROUND_Y + 4, 6, 1)
      }

      if (g.state === 'idle') {
        drawDino(ctx, GROUND_Y - DINO_H, false, g.frame)
        ctx.fillStyle = '#52525b'
        ctx.font = '10px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Tap or Space to start', W / 2, GROUND_Y - 40)
        g.frame++
        animRef.current = requestAnimationFrame(render)
        return
      }

      if (g.state === 'playing') {
        // Speed increases over time
        g.speed = OBSTACLE_SPEED_BASE + g.score * 0.02

        // Physics
        g.velocity += GRAVITY
        g.dinoY += g.velocity
        if (g.dinoY > GROUND_Y - DINO_H) {
          g.dinoY = GROUND_Y - DINO_H
          g.velocity = 0
        }

        // Spawn obstacles
        g.nextSpawn--
        if (g.nextSpawn <= 0) {
          const isBird = g.score > 5 && Math.random() < 0.3
          if (isBird) {
            const birdY = GROUND_Y - 30 - Math.floor(Math.random() * 20)
            g.obstacles.push({ x: W, w: 16, h: 6, type: 'bird', birdY, passed: false })
          } else {
            const h = 16 + Math.floor(Math.random() * 14)
            g.obstacles.push({ x: W, w: 8, h, type: 'cactus', passed: false })
          }
          g.nextSpawn = OBSTACLE_MIN_GAP + Math.floor(Math.random() * 60)
        }

        // Update obstacles
        g.obstacles = g.obstacles.filter(o => o.x > -30)
        for (const o of g.obstacles) {
          o.x -= g.speed

          if (!o.passed && o.x + o.w < DINO_X) {
            o.passed = true
            g.score++
            setScore(g.score)
          }

          // Collision
          const dinoTop = g.ducking ? GROUND_Y - 12 : g.dinoY
          const dinoBottom = GROUND_Y
          const dinoLeft = DINO_X
          const dinoRight = DINO_X + DINO_W

          let oTop: number, oBottom: number, oLeft: number, oRight: number
          if (o.type === 'bird') {
            oTop = o.birdY!
            oBottom = o.birdY! + o.h
            oLeft = o.x
            oRight = o.x + o.w
          } else {
            oTop = GROUND_Y - o.h
            oBottom = GROUND_Y
            oLeft = o.x - 4
            oRight = o.x + o.w + 6
          }

          if (dinoRight > oLeft + 4 && dinoLeft < oRight - 4 && dinoBottom > oTop + 2 && dinoTop < oBottom - 2) {
            g.state = 'dead'
            setGameState('dead')
            if (g.score > highRef.current) {
              highRef.current = g.score
              setHighScore(g.score)
              localStorage.setItem('dino_high', String(g.score))
            }
          }
        }

        // Draw
        for (const o of g.obstacles) {
          if (o.type === 'cactus') drawCactus(ctx, o.x, o.h)
          else drawBird(ctx, o.x, o.birdY!, g.frame)
        }
        drawDino(ctx, g.dinoY, g.ducking, g.frame)

        // Score
        ctx.fillStyle = '#52525b'
        ctx.font = '10px JetBrains Mono, monospace'
        ctx.textAlign = 'right'
        ctx.fillText(String(g.score).padStart(5, '0'), W - 8, 14)
      }

      if (g.state === 'dead') {
        for (const o of g.obstacles) {
          if (o.type === 'cactus') drawCactus(ctx, o.x, o.h)
          else drawBird(ctx, o.x, o.birdY!, g.frame)
        }
        drawDino(ctx, g.dinoY, g.ducking, g.frame)

        ctx.fillStyle = 'rgba(9, 9, 11, 0.5)'
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#f43f5e'
        ctx.font = '12px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('GAME OVER', W / 2, H / 2 - 4)
        ctx.fillStyle = '#52525b'
        ctx.font = '10px JetBrains Mono, monospace'
        ctx.fillText(String(g.score).padStart(5, '0'), W / 2, H / 2 + 12)
      }

      g.frame++
      animRef.current = requestAnimationFrame(render)
    }

    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const handleInput = useCallback((action?: 'duck') => {
    const g = gameRef.current
    if (g.state === 'idle') {
      Object.assign(gameRef.current, create())
      gameRef.current.state = 'playing'
      gameRef.current.velocity = JUMP_FORCE
      setGameState('playing')
      setScore(0)
    } else if (g.state === 'playing') {
      if (action === 'duck') {
        g.ducking = true
      } else if (g.dinoY >= GROUND_Y - DINO_H - 1) {
        g.velocity = JUMP_FORCE
      }
    } else if (g.state === 'dead') {
      Object.assign(gameRef.current, create())
      setGameState('idle')
      setScore(0)
    }
  }, [])

  const handleInputUp = useCallback(() => {
    gameRef.current.ducking = false
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); handleInput() }
      if (e.code === 'ArrowDown') { e.preventDefault(); handleInput('duck') }
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') handleInputUp()
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [handleInput, handleInputUp])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="card rounded-xl overflow-hidden"
    >
      <div className="px-4 py-2.5 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 size={13} className="text-[var(--color-text-muted)]" />
          <span className="text-xs font-medium text-[var(--color-text)]">Dino Run</span>
          {gameState === 'playing' && (
            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{String(score).padStart(5, '0')}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--color-text-faint)]">
            <Trophy size={10} className="text-[var(--color-amber)]" />
            {String(highScore).padStart(5, '0')}
          </div>
          {gameState === 'dead' && (
            <button onClick={() => handleInput()} className="p-1 text-[var(--color-text-muted)] active:text-[var(--color-text)]">
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="game-canvas w-full"
        onClick={() => handleInput()}
        onTouchStart={(e) => { e.preventDefault(); handleInput() }}
      />
    </motion.div>
  )
}
