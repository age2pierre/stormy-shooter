import { Canvas } from '@react-three/fiber'
import { Debug, Physics } from '@react-three/p2'
import { Box } from './Box'
import Platform from './Platform'
import Player from './Player'
import { useEffect } from 'react'
import { proxy, useSnapshot } from 'valtio'
import { Bullet } from './Bullet'

const game_store = proxy({
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

  const { paused } = useSnapshot(game_store)

  return (
    <div className="App">
      <Canvas camera={{ position: [0, 0, 0], zoom: 5 }}>
        <Physics normalIndex={2} isPaused={paused}>
          {/* <Debug normalIndex={2} linewidth={0.001}> */}
          <Player position={[0, 2]} />
          <Bullet
            direction="left"
            init_position={[0, 5]}
            onTimeout={() => {
              console.log('bullet timeout')
            }}
            onCollide={(e) => {
              console.log('bullet onCollide')
              console.debug(e)
            }}
          />
          <Box args={[8, 1]} position={[-15, 5]} />
          <Box args={[40, 1]} position={[0, -5]} />
          <Box args={[40, 1]} position={[1, -7]} />
          <Box args={[1, 6]} position={[2, 8]} />
          <Box args={[1, 10]} position={[-8, 0]} />
          <Box args={[3, 3]} position={[-3, 9]} />
          <Box args={[3, 3]} position={[-3, 9]} />
          <Box args={[1, 10]} position={[14, 8]} angle={-Math.PI / 4} />
          <Platform
            args={[4, 3]}
            position={[-8, 8]}
            localWaypoints={[
              [0, 0],
              [5, 10],
            ]}
          />
          <Platform
            args={[3, 1]}
            position={[6, 9]}
            localWaypoints={[
              [0, 0],
              [4, 0],
            ]}
          />
          {/* </Debug> */}
        </Physics>
      </Canvas>
    </div>
  )
}
