import { Plane } from '@react-three/drei'

import { MOUSE_POSITION } from './common'

export function MouseTracker() {
  return (
    <Plane
      args={[100, 100]}
      rotation-x={Math.PI}
      position={[0, 0, 0]}
      onPointerMove={(event) => {
        const { x, y } = event.point
        MOUSE_POSITION.x = x
        MOUSE_POSITION.y = y
      }}
    >
      <meshStandardMaterial opacity={0} transparent />
    </Plane>
  )
}
