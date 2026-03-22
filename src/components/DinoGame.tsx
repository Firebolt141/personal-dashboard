import { useRef, useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2, Trophy, RotateCcw } from 'lucide-react'

const SCALE = 2
const W = 300
const H = 75
const GROUND = H - 8

// Dino sprite (simplified pixel art)
const DINO_FRAMES = {
  stand: [
    [0,0,0,1,1,1,1,0],
    [0,0,1,1,0,1,1,0],
    [0,0,1,1,1,1,0,0],
    [1,0,1,1,0,0,0,0],
    [1,1,1,1,1,0,0,0],
    [1,1,1,1,0,0,0,0],
    [0,1,1,0,0,0,0,0],
    [0,1,0,1,0,0,0,0],
  ],
  run1: [
    [0,0,0,1,1,1,1,0],
    [0,0,1,1,0,1,1,0],
    [0,0,1,1,1,1,0,0],
    [1,0,1,1,0,0,0,0],
    [1,1,1,1,1,0,0,0],
    [1,1,1,1,0,0,0,0],
    [0,1,1,0,0,0,0,0],
    [0,1,0,0,0,0,0,0],
  ],
  run2: [
    [0,0,0,1,1,1,1,0],
    [0,0,1,1,0,1,1,0],
    [0,0,1,1,1,1,0,0],
    [1,0,1,1,0,0,0,0],
    [1,1,1,1,1,0,0,0],
    [1,1,1,1,0,0,0,0],
    [0,1,1,0,0,0,0,0],
    [0,0,0,1,0,0,0,0],
  ],
}

const CACTUS = [
  [0,1,0],
  [0,1,0],
  [1,1,1],
  [0,1,0],
  [0,1,0],
  [0,1,0],
  [0,1,0],
]

const CACTUS_TALL = [
  [0,1,0,0,1,0],
  [0,1,0,0,1,0],
  [1,1,0,1,1,1],
  [0,1,1,1,1,0],
  [0,1,0,0,1,0],
  [0,1,0,0,1,0],
  [0,1,0,0,1,0],
  [0,1,0,0,1,0],
]

type State = 'idle' | 'running' | 'dead'

interface Obstacle { x: number; type: 'small' | 'tall'; passed: boolean }

interface GameState {
  state: State
  y: number
  vy: number
  obstacles: Obstacle[]
  score: number
  frame: number
  speed: number
  nextSpawn: number
  groundOffset: number
}

function init(): GameState {
  return { state: 'idle', y: 0, vy: 0, obstacles: [], score: 0, frame: 0, speed: 2, nextSpawn: 80, groundOffset: 0 }
}

function drawSprite(ctx: CanvasRenderingContext2D, sprite: number[][], x: number, y: number, s: number, color: string) {
  ctx.fillStyle = color
  for (let r = 0; r < sprite.length; r++)
    for (let c = 0; c < sprite[r].length; c++)
      if (sprite[r][c]) ctx.fillRect(x + c * s, y + r * s, s, s)
}

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<GameState>(init())
  const animRef = useRef(0)
  const [displayState, setDisplayState] = useState<State>('idle')
  const [displayScore, setDisplayScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    const s = localStorage.getItem('dino_high')
    return s ? parseInt(s, 10) : 0
  })
  const highRef = useRef(highScore)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = W * SCALE
    canvas.height = H * SCALE

    const render = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) { animRef.current = requestAnimationFrame(render); return }
      const g = gameRef.current

      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0)

      // Clear
      ctx.fillStyle = '#09090b'
      ctx.fillRect(0, 0, W, H)

      // Ground
      ctx.fillStyle = '#27272a'
      ctx.fillRect(0, GROUND, W, 1)

      // Ground dots
      ctx.fillStyle = '#1c1c20'
      for (let gx = -(g.groundOffset % 16); gx < W; gx += 16) {
        ctx.fillRect(gx, GROUND + 3, 4, 1)
        ctx.fillRect(gx + 8, GROUND + 5, 3, 1)
      }

      const dinoX = 20
      const dinoH = 8 * SCALE
      const dinoY = GROUND - dinoH - g.y

      if (g.state === 'idle') {
        drawSprite(ctx, DINO_FRAMES.stand, dinoX, GROUND - 8 * SCALE, SCALE, '#a1a1aa')
        ctx.fillStyle = '#52525b'
        ctx.font = '8px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('TAP TO START', W / 2, GROUND - 24)
        g.frame++
        animRef.current = requestAnimationFrame(render)
        return
      }

      if (g.state === 'running') {
        g.groundOffset += g.speed

        // Gravity
        if (g.y > 0 || g.vy > 0) {
          g.vy -= 0.4
          g.y += g.vy
          if (g.y <= 0) { g.y = 0; g.vy = 0 }
        }

        // Speed ramp
        g.speed = 2 + g.score * 0.015

        // Spawn
        g.nextSpawn--
        if (g.nextSpawn <= 0) {
          g.obstacles.push({
            x: W + 10,
            type: Math.random() < 0.4 ? 'tall' : 'small',
            passed: false,
          })
          g.nextSpawn = Math.max(40, 80 - g.score) + Math.floor(Math.random() * 40)
        }

        // Update obstacles
        g.obstacles = g.obstacles.filter(o => o.x > -20)
        for (const o of g.obstacles) {
          o.x -= g.speed
          if (!o.passed && o.x + 8 < dinoX) {
            o.passed = true
            g.score++
            setDisplayScore(g.score)
          }

          // Collision (pixel-approximate hitbox)
          const sp = o.type === 'small' ? CACTUS : CACTUS_TALL
          const oW = sp[0].length * SCALE
          const oH = sp.length * SCALE
          const oTop = GROUND - oH
          const margin = 2

          if (
            dinoX + 8 * SCALE - margin > o.x &&
            dinoX + margin < o.x + oW &&
            dinoY + dinoH - margin > oTop
          ) {
            g.state = 'dead'
            setDisplayState('dead')
            if (g.score > highRef.current) {
              highRef.current = g.score
              setHighScore(g.score)
              localStorage.setItem('dino_high', String(g.score))
            }
          }
        }

        // Draw obstacles
        for (const o of g.obstacles) {
          const sp = o.type === 'small' ? CACTUS : CACTUS_TALL
          drawSprite(ctx, sp, o.x, GROUND - sp.length * SCALE, SCALE, '#52525b')
        }

        // Draw dino
        const frame = g.y > 0 ? DINO_FRAMES.stand : (Math.floor(g.frame / 5) % 2 === 0 ? DINO_FRAMES.run1 : DINO_FRAMES.run2)
        drawSprite(ctx, frame, dinoX, dinoY, SCALE, '#d4d4d8')

        // Score
        ctx.fillStyle = '#52525b'
        ctx.font = '8px JetBrains Mono, monospace'
        ctx.textAlign = 'right'
        ctx.fillText(String(g.score).padStart(5, '0'), W - 6, 10)
      }

      if (g.state === 'dead') {
        // Draw obstacles
        for (const o of g.obstacles) {
          const sp = o.type === 'small' ? CACTUS : CACTUS_TALL
          drawSprite(ctx, sp, o.x, GROUND - sp.length * SCALE, SCALE, '#52525b')
        }
        drawSprite(ctx, DINO_FRAMES.stand, dinoX, dinoY, SCALE, '#d4d4d8')

        ctx.fillStyle = 'rgba(9,9,11,0.5)'
        ctx.fillRect(0, 0, W, H)

        ctx.fillStyle = '#f43f5e'
        ctx.font = 'bold 10px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('GAME OVER', W / 2, H / 2 - 2)
        ctx.fillStyle = '#71717a'
        ctx.font = '8px JetBrains Mono, monospace'
        ctx.fillText(String(g.score).padStart(5, '0'), W / 2, H / 2 + 10)
      }

      g.frame++
      animRef.current = requestAnimationFrame(render)
    }

    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const jump = useCallback(() => {
    const g = gameRef.current
    if (g.state === 'idle') {
      Object.assign(g, init())
      g.state = 'running'
      g.vy = 7
      setDisplayState('running')
      setDisplayScore(0)
    } else if (g.state === 'running') {
      if (g.y <= 0) g.vy = 7
    } else {
      Object.assign(g, init())
      setDisplayState('idle')
      setDisplayScore(0)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [jump])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="card rounded-xl overflow-hidden"
    >
      <div className="px-4 py-2 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 size={12} className="text-[var(--color-text-muted)]" />
          <span className="text-[11px] font-medium text-[var(--color-text)]">Dino</span>
          {displayState === 'running' && (
            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{String(displayScore).padStart(5, '0')}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--color-text-faint)]">
            <Trophy size={9} className="text-[var(--color-amber)]" />
            {String(highScore).padStart(5, '0')}
          </div>
          {displayState === 'dead' && (
            <button onClick={jump} className="p-1 text-[var(--color-text-muted)]">
              <RotateCcw size={11} />
            </button>
          )}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="game-canvas w-full"
        style={{ height: H * SCALE, imageRendering: 'pixelated' }}
        onClick={jump}
        onTouchStart={(e) => { e.preventDefault(); jump() }}
      />
    </motion.div>
  )
}
