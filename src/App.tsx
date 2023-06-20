import { Canvas } from '@react-three/fiber'
import { Debug, Physics } from '@react-three/p2'
import { Box } from './Box'
import Platform from './Platform'
import Player from './Player'

export default function App() {
  return (
    <div className="App">
      <Canvas camera={{ position: [0, 0, 0], zoom: 5 }}>
        <Physics normalIndex={2}>
          {/* <Debug normalIndex={2} linewidth={0.001}> */}
            <Player position={[-7, 14]} />
            <Box args={[1, 5]} position={[-2, 3]} />
            <Box args={[8, 1]} position={[-15, 5]} />
            <Box args={[16, 1]} position={[-4, 0]} />
            <Box args={[40, 1]} position={[0, -5]} />
            <Box args={[1, 6]} position={[2, 8]} />
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
