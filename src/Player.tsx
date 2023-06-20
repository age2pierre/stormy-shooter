import {
  Lookup,
  animated,
  config,
  useSpring,
  useSpringRef,
} from '@react-spring/three'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

import { useControls } from './useControls'
import { proxy, useSnapshot } from 'valtio'
import { useRapier } from './rapier'
import { Collider, RigidBody } from '@dimforge/rapier2d-compat'
import { Group } from 'three'
import { Duplet } from '.'
import { RoundedBox } from '@react-three/drei'

const player_state = proxy<{
  facing: 'left' | 'right'
  is_hurting: boolean
  lifes: number
  sprite_animation: 'idle' | 'running'
}>({
  facing: 'right',
  is_hurting: false,
  lifes: 3,
  sprite_animation: 'idle',
})

const PLAYER_SIZE = [1, 1] as const
const SPEED = 0.1
const COS_SPEED = Math.cos(Math.PI / 4) * SPEED

export function Player({ position }: { position: [x: number, y: number] }) {
  const bodyRef = useRef<RigidBody | null>(null)
  const colliderRef = useRef<Collider | null>(null)
  const groupRef = useRef<Group>(null)
  const controls = useControls()
  const { camera } = useThree()

  const {
    characterController: character_controller,
    rapier,
    world,
  } = useRapier()

  const [springs, api] = useSpring<{
    speed: Duplet
    cameraPos: Duplet
  }>(() => ({
    speed: [0, 0],
    cameraPos: position,
    config: (key) =>
      ({
        speed: config.stiff,
        cameraPos: config.molasses,
      }[key]),
  }))

  useEffect(() => {
    bodyRef.current = world.createRigidBody(
      rapier.RigidBodyDesc.kinematicPositionBased().setTranslation(...position),
    )
    colliderRef.current = world.createCollider(
      rapier.ColliderDesc.cuboid(PLAYER_SIZE[0] / 2, PLAYER_SIZE[1] / 2),
      bodyRef.current,
    )
    return () => {
      if (bodyRef.current) {
        world.removeRigidBody(bodyRef.current)
      }
    }
  }, [])

  useFrame(() => {
    const { shoot, left, right, up, down } = controls.current

    if (colliderRef.current && bodyRef.current && groupRef.current) {
      const diag = (left || right) && (up || down)
      const speed = diag ? COS_SPEED : SPEED

      const speedTarget = springs.speed.get()
      character_controller.computeColliderMovement(colliderRef.current, {
        x: speedTarget[0],
        y: speedTarget[1],
      })
      const movement = character_controller.computedMovement()
      // const grounded = character_controller.computedGrounded()

      const newPos = bodyRef.current.translation()
      newPos.x += movement.x
      newPos.y += movement.y
      bodyRef.current.setNextKinematicTranslation(newPos)

      const { x, y } = bodyRef.current.translation()
      groupRef.current.position.x = x
      groupRef.current.position.y = y

      api.start({
        speed: [
          left ? speed : right ? -speed : 0,
          up ? speed : down ? -speed : 0,
        ],
        cameraPos: [x, y],
      })

      const cameraPos = springs.cameraPos.get()
      camera.position.x = cameraPos[0]
      camera.position.y = cameraPos[1]
    }
  })

  return (
    <group ref={groupRef}>
      <RoundedBox args={PLAYER_SIZE as Duplet} radius={0.2}>
        <meshNormalMaterial />
      </RoundedBox>
    </group>
  )
}
