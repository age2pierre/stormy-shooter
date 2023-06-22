import {
  ActiveCollisionTypes,
  Collider,
  RigidBody,
} from '@dimforge/rapier2d-compat'
import { useFrame } from '@react-three/fiber'
import { ReactNode, useEffect, useMemo, useRef } from 'react'
import { Group, Vector2 } from 'three'

import { computeCollissionGroup, Duplet, PROJECTILE_GROUP } from './common'
import { useRapier } from './rapier'

export function Projectile({
  position,
  direction,
  radius = 0.2,
  speed = 5,
  children,
  ttl = 10,
  onTimeout,
  onCollide,
}: {
  ttl?: number
  position: Duplet
  direction: Duplet
  speed?: number
  radius?: number
  children: ReactNode
  onTimeout?: () => void
  onCollide?: (ev: { position: Duplet; target: Collider }) => void
}) {
  const bodyRef = useRef<RigidBody | null>(null)
  const colliderRef = useRef<Collider | null>(null)
  const linVel = useMemo(() => {
    const { x, y } = new Vector2(direction[0], direction[1])
      .normalize()
      .multiplyScalar(speed)
    return [x, y] as const
  }, [direction, speed])

  const groupRef = useRef<Group>(null)
  const { rapier, world, registerCollisionEvent, cleanupCollisionEvent } =
    useRapier()

  useEffect(() => {
    bodyRef.current = world.createRigidBody(
      rapier.RigidBodyDesc.kinematicVelocityBased()
        .setTranslation(...position)
        .setLinvel(...linVel),
    )
    colliderRef.current = world.createCollider(
      rapier.ColliderDesc.ball(radius).setActiveCollisionTypes(
        ActiveCollisionTypes.ALL,
      ),
      bodyRef.current,
    )
    registerCollisionEvent(colliderRef.current, (target) => {
      onCollide?.({
        position: [
          groupRef.current?.position.x ?? position[0],
          groupRef.current?.position.y ?? position[1],
        ],
        target,
      })
    })
    return () => {
      if (colliderRef.current) {
        cleanupCollisionEvent(colliderRef.current)
      }
      if (bodyRef.current) {
        world.removeRigidBody(bodyRef.current)
      }
    }
  }, [])

  const { current: ttlRef } = useRef({
    triggered: false,
    counter: 0,
  })
  useFrame((_, dt) => {
    ttlRef.counter += dt
    if (!ttlRef.triggered && ttlRef.counter >= ttl) {
      onTimeout?.()
    }

    if (!bodyRef.current || !groupRef.current) return

    const { x, y } = bodyRef.current.translation()
    groupRef.current.position.x = x
    groupRef.current.position.y = y
  })

  return <group ref={groupRef}>{children}</group>
}
