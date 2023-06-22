import { useEffect } from 'react'
import { proxy } from 'valtio'

export const game_store = proxy({
  paused: false,
})

export function useWindowFocus() {
  useEffect(() => {
    const onOutOfFocus = () => {
      game_store.paused = true
    }
    const onFocus = () => {
      game_store.paused = false
    }
    window.onblur = onOutOfFocus
    window.onfocus = onFocus
    return () => {
      window.onblur = null
      window.onfocus = null
    }
  }, [])
}
