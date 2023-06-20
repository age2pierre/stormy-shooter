import type { MutableRefObject } from 'react'
import { useEffect, useRef } from 'react'

function useKeyControls(
    { current }: MutableRefObject<Record<GameControl, boolean>>,
    map: Record<KeyCode, GameControl>,
) {
  useEffect(() => {
    const handleKeydown = ({ key }: KeyboardEvent) => {
      if (!isKeyCode(key)) return
      current[map[key]] = true
    }
    window.addEventListener('keydown', handleKeydown)
    const handleKeyup = ({ key }: KeyboardEvent) => {
      if (!isKeyCode(key)) return
      current[map[key]] = false
    }
    window.addEventListener('keyup', handleKeyup)
    return () => {
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('keyup', handleKeyup)
    }
  }, [current, map])
}

const KEY_CONTROL_MAP = {
  ' ': 'shoot',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'jump',
  q: 'left',
  d: 'right',
  r: 'reset',
  z: 'jump',
} as const

type KeyCode = keyof typeof KEY_CONTROL_MAP
type GameControl = typeof KEY_CONTROL_MAP[KeyCode]

const keyCodes = Object.keys(KEY_CONTROL_MAP) as KeyCode[]
const isKeyCode = (v: unknown): v is KeyCode => keyCodes.includes(v as KeyCode)

export function useControls() {
  const controls = useRef<Record<GameControl, boolean>>({
    shoot: false,
    jump: false,
    left: false,
    reset: false,
    right: false,
  })

  useKeyControls(controls, KEY_CONTROL_MAP)

  return controls
}
