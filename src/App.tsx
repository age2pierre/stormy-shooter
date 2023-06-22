import { AdaptiveDpr, Sky } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import {
  ChromaticAberration,
  EffectComposer,
  Scanline,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

import { Box } from './Box'
import { BulletsManager } from './BulletsManager'
// import { DebugRapier } from './DebugRapier'
// import { useWindowFocus } from './game-store'
import { MouseTracker } from './MouseTracker'
import { Physics } from './Physics'
import { Player } from './Player'

export default function App() {
  // useWindowFocus()

  return (
    <div className="App">
      <Canvas
        camera={{
          position: [0, 0, -15],
          zoom: 1,
          fov: 70,
          rotation: [Math.PI - 0.2, 0, Math.PI],
        }}
        performance={{
          min: 0.1,
          max: 1,
        }}
      >
        <Sky
          distance={450000}
          sunPosition={[0, -1, 0]}
          inclination={0}
          azimuth={0.1}
        />
        <EffectComposer>
          <Vignette offset={0.3} darkness={0.6} eskil={false} />
          <ChromaticAberration
            modulationOffset={0.1}
            radialModulation={true}
            offset={[0.003, 0.006] as any}
          />
          <Scanline
            density={0.5}
            blendFunction={BlendFunction.OVERLAY}
            opacity={0.05}
          />
        </EffectComposer>
        <ambientLight />
        <MouseTracker />
        <AdaptiveDpr pixelated />
        <Physics>
          <Player position={[0, 2]} />
          <BulletsManager />
          <Box size={[8, 1]} position={[-15, 5]} />
          <Box size={[40, 1]} position={[0, -5]} />
          <Box size={[1, 6]} position={[2, 8]} />
          <Box size={[1, 10]} position={[-8, 0]} />
          <Box size={[3, 3]} position={[-3, 9]} />
          <Box size={[3, 3]} position={[-3, 9]} />
          {/* <DebugRapier /> */}
        </Physics>
      </Canvas>
    </div>
  )
}
