import { Canvas } from '@react-three/fiber'
import { Player } from './Player'
import { useEffect } from 'react'
import { proxy } from 'valtio'
import { Physics } from './rapier'
import { Box } from './Box'
import { AdaptiveDpr, Sphere } from '@react-three/drei'
import { Projectile } from './Projectile'

export const game_store = proxy({
  paused: false,
})

export default function App() {
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

  return (
    <div className="App">
      <Canvas
        camera={{
          position: [0, 0, -15],
          zoom: 1,
          fov: 70,
          rotation: [Math.PI, 0, Math.PI],
        }}
        performance={{
          min: 0.1,
          max: 1,
        }}
      >
        <AdaptiveDpr pixelated />
        <Physics>
          <Player position={[0, 2]} />
          <Projectile direction={[-1, 0]} radius={0.2} position={[0, 4]}>
            <Sphere args={[0.2]}>
              <meshNormalMaterial />
            </Sphere>
          </Projectile>
          <Box size={[8, 1]} position={[-15, 5]} />
          <Box size={[40, 1]} position={[0, -5]} />
          <Box size={[1, 6]} position={[2, 8]} />
          <Box size={[1, 10]} position={[-8, 0]} />
          <Box size={[3, 3]} position={[-3, 9]} />
          <Box size={[3, 3]} position={[-3, 9]} />
        </Physics>
      </Canvas>
    </div>
  )
}
