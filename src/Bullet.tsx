import { Duplet, useBox, useCircle } from '@react-three/p2'
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
  const has_timeout = useRef(false)
  const [group_ref] = useBox(() => ({
    mass: Number.EPSILON,
    args: [0.3, 0.3],
    linearDamping: 0,
    angularDamping: 0,
    position: props.init_position,
    velocity: [(props.speed ?? 20) * (props.direction === 'left' ? -1 : 1), 0],
    allowSleep: false,
    collisionResponse: false,
    collisionFilterGroup: BULLET_GROUP,
    collisionFilterMask: ENEMY_GROUP | SCENERY_GROUP,
    onCollide: (e) => {
      console.log('Bullet onCollide')
      if (e.collisionFilters.bodyFilterGroup === SCENERY_GROUP) {
        props.onCollide?.({
          type: 'scenery',
        })
      }
      if (e.collisionFilters.bodyFilterGroup === ENEMY_GROUP) {
        props.onCollide?.({
          type: 'enemy',
        })
      }
    },
  }))

  useFrame((_, delta) => {
    counter_ms.current += delta

    if (!has_timeout.current && (props.ttl ?? 10) <= counter_ms.current) {
      has_timeout.current = true
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
