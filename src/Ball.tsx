import { RoundedBox, Sphere } from '@react-three/drei'
import { Duplet } from '.'
import { useRapier } from './rapier'
import { useEffect, useRef } from 'react'
import { Collider, RigidBody } from '@dimforge/rapier2d-compat'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'

export function Ball({
  radius,
  position,
}: {
  radius: number
  position: Duplet
}) {
  const groupRef = useRef<Group>(null)
  const { rapier, world } = useRapier()
  const bodyRef = useRef<RigidBody>()

  useEffect(() => {
    bodyRef.current = world.createRigidBody(
      rapier.RigidBodyDesc.dynamic()
        .setTranslation(...position)
        .setLinearDamping(0.05),
    )
    world.createCollider(
      rapier.ColliderDesc.ball(radius).setRestitution(0.5),
      bodyRef.current,
    )
    return () => {
      if (bodyRef.current) {
        world.removeRigidBody(bodyRef.current)
      }
    }
  }, [])

  useFrame(() => {
    if (bodyRef.current && groupRef.current) {
      const { x, y } = bodyRef.current.translation()
      groupRef.current.position.x = x
      groupRef.current.position.y = y
    }
  })

  return (
    <group ref={groupRef}>
      <Sphere args={[radius]}>
        <meshNormalMaterial />
      </Sphere>
    </group>
  )
}
