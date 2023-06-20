import { Box as BoxDrei } from '@react-three/drei'
import { Duplet } from '.'
import { useRapier } from './rapier'
import { useEffect, useRef } from 'react'
import { RigidBody } from '@dimforge/rapier2d-compat'

export function Box({ size, position }: { size: Duplet; position: Duplet }) {
  const { rapier, world } = useRapier()
  const bodyRef = useRef<RigidBody>()

  useEffect(() => {
    bodyRef.current = world.createRigidBody(
      rapier.RigidBodyDesc.fixed().setTranslation(...position),
    )
    world.createCollider(
      rapier.ColliderDesc.cuboid(size[0] / 2, size[1] / 2),
      bodyRef.current,
    )
    return () => {
      if (bodyRef.current) {
        world.removeRigidBody(bodyRef.current)
      }
    }
  }, [])

  return (
    <group position={[...position, 0]}>
      <BoxDrei args={[...size, 1]}>
        <meshNormalMaterial />
      </BoxDrei>
    </group>
  )
}
