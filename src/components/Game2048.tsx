import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, Trophy, RotateCcw } from 'lucide-react'

type Board = number[][]

const TILE_COLORS: Record<number, { bg: string; text: string; glow?: string }> = {
  2:    { bg: '#1c1c36', text: '#c084fc' },
  4:    { bg: '#251c3a', text: '#c084fc' },
  8:    { bg: '#2d1b45', text: '#e9d5ff' },
  16:   { bg: '#3b1a5c', text: '#f0abfc', glow: 'rgba(168,85,247,0.15)' },
  32:   { bg: '#4c1d95', text: '#f5d0fe', glow: 'rgba(168,85,247,0.2)' },
  64:   { bg: '#0e7490', text: '#ecfeff', glow: 'rgba(6,182,212,0.2)' },
  128:  { bg: '#0891b2', text: '#ecfeff', glow: 'rgba(6,182,212,0.3)' },
  256:  { bg: '#059669', text: '#ecfdf5', glow: 'rgba(57,255,20,0.2)' },
  512:  { bg: '#16a34a', text: '#f0fdf4', glow: 'rgba(57,255,20,0.3)' },
  1024: { bg: '#ca8a04', text: '#fefce8', glow: 'rgba(250,204,21,0.3)' },
  2048: { bg: '#dc2626', text: '#fff', glow: 'rgba(255,45,120,0.4)' },
}

function createEmptyBoard(): Board {
  return Array.from({ length: 4 }, () => Array(4).fill(0))
}

function addRandomTile(board: Board): Board {
  const empty: [number, number][] = []
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (board[r][c] === 0) empty.push([r, c])
  if (empty.length === 0) return board
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  const newBoard = board.map(row => [...row])
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4
  return newBoard
}

function slide(row: number[]): { result: number[]; score: number } {
  const filtered = row.filter(v => v !== 0)
  let score = 0
  const merged: number[] = []
  let i = 0
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const val = filtered[i] * 2
      merged.push(val)
      score += val
      i += 2
    } else {
      merged.push(filtered[i])
      i++
    }
  }
  while (merged.length < 4) merged.push(0)
  return { result: merged, score }
}

function moveLeft(board: Board): { board: Board; score: number } {
  let totalScore = 0
  const newBoard = board.map(row => {
    const { result, score } = slide(row)
    totalScore += score
    return result
  })
  return { board: newBoard, score: totalScore }
}

function rotateBoard(board: Board): Board {
  return board[0].map((_, c) => board.map(row => row[c]).reverse())
}

function move(board: Board, direction: 'left' | 'right' | 'up' | 'down'): { board: Board; score: number } {
  let rotations = 0
  switch (direction) {
    case 'left': rotations = 0; break
    case 'down': rotations = 1; break
    case 'right': rotations = 2; break
    case 'up': rotations = 3; break
  }

  let b = board
  for (let i = 0; i < rotations; i++) b = rotateBoard(b)
  const { board: moved, score } = moveLeft(b)
  let result = moved
  for (let i = 0; i < (4 - rotations) % 4; i++) result = rotateBoard(result)
  return { board: result, score }
}

function boardsEqual(a: Board, b: Board): boolean {
  return a.every((row, r) => row.every((v, c) => v === b[r][c]))
}

function canMove(board: Board): boolean {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return true
      if (c < 3 && board[r][c] === board[r][c + 1]) return true
      if (r < 3 && board[r][c] === board[r + 1][c]) return true
    }
  return false
}

function initBoard(): Board {
  let b = createEmptyBoard()
  b = addRandomTile(b)
  b = addRandomTile(b)
  return b
}

export default function Game2048() {
  const [board, setBoard] = useState<Board>(initBoard)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('game_2048_high')
    return saved ? parseInt(saved, 10) : 0
  })
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  const handleMove = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return
    setBoard(prev => {
      const { board: newBoard, score: moveScore } = move(prev, direction)
      if (boardsEqual(prev, newBoard)) return prev
      const withNew = addRandomTile(newBoard)
      setScore(s => {
        const newScore = s + moveScore
        if (newScore > highScore) {
          setHighScore(newScore)
          localStorage.setItem('game_2048_high', String(newScore))
        }
        return newScore
      })
      if (!canMove(withNew)) setGameOver(true)
      return withNew
    })
  }, [gameOver, highScore])

  const reset = useCallback(() => {
    setBoard(initBoard())
    setScore(0)
    setGameOver(false)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, 'left' | 'right' | 'up' | 'down'> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
        a: 'left', d: 'right', w: 'up', s: 'down',
      }
      const dir = map[e.key]
      if (dir) { e.preventDefault(); handleMove(dir) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleMove])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null
    const minSwipe = 30
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > minSwipe) handleMove(dx > 0 ? 'right' : 'left')
    } else {
      if (Math.abs(dy) > minSwipe) handleMove(dy > 0 ? 'down' : 'up')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="neon-card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Gamepad2 size={14} className="text-[var(--color-neon-purple)]" />
          <span className="text-xs font-bold text-white tracking-wide">2048</span>
          <span className="ml-1 text-[10px] font-mono text-[var(--color-neon-blue)]">{score}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-gray-500 font-mono">
            <Trophy size={10} className="text-[var(--color-accent-amber)]" />
            <span className="text-[10px]">{highScore}</span>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1 text-[var(--color-primary-light)] active:text-white transition-colors p-1"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Board */}
      <div
        ref={boardRef}
        className="p-3 select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <div className="grid grid-cols-4 gap-1.5 aspect-square max-w-[280px] mx-auto">
          {board.flat().map((val, i) => {
            const style = val ? TILE_COLORS[val] ?? TILE_COLORS[2048] : null
            return (
              <div
                key={i}
                className="relative aspect-square rounded-md flex items-center justify-center"
                style={{
                  background: style ? style.bg : 'rgba(255,255,255,0.02)',
                  border: style ? `1px solid rgba(255,255,255,0.08)` : '1px solid rgba(255,255,255,0.03)',
                  boxShadow: style?.glow ? `0 0 10px ${style.glow}` : undefined,
                }}
              >
                <AnimatePresence mode="popLayout">
                  {val > 0 && (
                    <motion.span
                      key={`${i}-${val}`}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="font-mono font-bold"
                      style={{
                        color: style?.text ?? '#fff',
                        fontSize: val >= 1024 ? '11px' : val >= 128 ? '13px' : '15px',
                        textShadow: style?.glow ? `0 0 8px ${style.glow}` : undefined,
                      }}
                    >
                      {val}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Game over overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-center"
            >
              <p className="text-xs neon-text-pink font-bold">GAME OVER</p>
              <p className="text-[10px] text-gray-500 font-mono mt-1">Score: {score}</p>
              <button
                onClick={reset}
                className="mt-2 px-4 py-1.5 rounded-lg text-[10px] font-bold text-white bg-[var(--color-primary-dark)] active:bg-[var(--color-primary)] transition-colors"
              >
                PLAY AGAIN
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swipe hint */}
        {!gameOver && score === 0 && (
          <p className="text-[9px] text-gray-600 text-center mt-2 font-mono">Swipe to play</p>
        )}
      </div>
    </motion.div>
  )
}
