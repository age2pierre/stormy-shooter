import { Duplet, useCircle } from '@react-three/p2'
import { useEffect, useRef } from 'react'
import { BULLET_GROUP, ENEMY_GROUP, PLAYER_GROUP, SCENERY_GROUP } from '.'
import { useFrame } from '@react-three/fiber'

export type BulletColissionEvent =
  | {
      type: 'scenery'
    }
  | {
      type: 'enemy'
      enemy_id?: string
    }

export function Bullet(props: {
  direction: 'left' | 'right'
  init_position: Duplet
  /** in unit/sec */
  speed?: number
  /** in  seconds */
  ttl?: number
  onCollide?: (ev: BulletColissionEvent) => void
  onTimeout: () => void
}) {
  const counter_ms = useRef(0)
  const [group_ref , circle_api] = useCircle(() => ({
    type: 'Kinematic',
    mass: 0,
    args: [0.3],
    position: props.init_position,
    // collisionFilterGroup: BULLET_GROUP,
    // collisionFilterMask: ENEMY_GROUP | SCENERY_GROUP,
    onCollide: (e) => {
      console.log('Bullet onCollide')
      if (e.collisionFilters.targetFilterGroup === SCENERY_GROUP) {
        props.onCollide?.({
          type: 'scenery',
        })
      }
      if (e.collisionFilters.targetFilterGroup === ENEMY_GROUP) {
        props.onCollide?.({
          type: 'enemy',
        })
      }
    },
  }))

  useEffect(() => {
    circle_api.velocity.set(
      (props.speed ?? 5) * (props.direction === 'left' ? -1 : 1),
      0,
    )
  }, [])

  useFrame((_, delta) => {
    counter_ms.current += delta

    if ((props.ttl ?? 3) <= counter_ms.current) {
      props.onTimeout()
    }
  })

  return (
    <group ref={group_ref as any}>
      <mesh>
        <sphereGeometry args={[0.3]} />
        <meshNormalMaterial />
      </mesh>
    </group>
  )
}
