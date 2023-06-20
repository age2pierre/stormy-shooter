import { useBox } from '@react-three/p2'
import { SCENERY_GROUP } from './index'

export function Box({
  args,
  position,
  angle,
}: {
  args: [width: number, height: number]
  position: [x: number, y: number]
  angle?: number
}) {
  const [ref] = useBox(() => ({
    args,
    position,
    angle,
    mass: 0,
    collisionGroup: SCENERY_GROUP,
  }))
  return (
    <mesh ref={ref as any}>
      <boxGeometry args={[...args, 3]} />
      <meshNormalMaterial />
    </mesh>
  )
}
