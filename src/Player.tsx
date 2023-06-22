import {
  Lookup,
  animated,
  config,
  useSpring,
  useSpringRef,
} from '@react-spring/three'
import { useFrame, useThree } from '@react-three/fiber'
import { ReactNode, useEffect, useRef } from 'react'
import crosshairUrl from './crosshair.png'
import trooperUrl from './trooper.png'

import { useControls } from './useControls'
import { proxy } from 'valtio'
import { useRapier } from './rapier'
import { Collider, RigidBody } from '@dimforge/rapier2d-compat'
import {
  DoubleSide,
  Group,
  NearestFilter,
  PlaneGeometry,
  Texture,
  Vector2,
} from 'three'
import { Duplet } from '.'
import { Plane, Shadow, useTexture } from '@react-three/drei'
import { MOUSE_POSITION } from './App'

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

const SPEED = 0.15
const COS_SPEED = Math.cos(Math.PI / 4) * SPEED
const COOLDOWN_SHOOT = 0.5

const vec2 = new Vector2(0, 0)

export function Player({
  position,
  children,
}: {
  position: [x: number, y: number]
  children?: ReactNode
}) {
  const bodyRef = useRef<RigidBody | null>(null)
  const colliderRef = useRef<Collider | null>(null)
  const groupRef = useRef<Group>(null)
  const crosshairGroupRef = useRef<Group>(null)
  const trooperGroupRef = useRef<Group>(null)
  const elapsedTime = useRef(0)
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
      rapier.ColliderDesc.cuboid(0.5, 0.7),
      bodyRef.current,
    )
    return () => {
      if (bodyRef.current) {
        world.removeRigidBody(bodyRef.current)
      }
    }
  }, [])

  useFrame((_, dt) => {
    elapsedTime.current += dt
    const { shoot, left, right, up, down } = controls.current

    if (colliderRef.current && bodyRef.current && groupRef.current) {
      const diag = (left || right) && (up || down)
      const speed = diag ? COS_SPEED : SPEED

      // get spring'd speed
      const speedTarget = springs.speed.get()
      // compute movement with collisions
      character_controller.computeColliderMovement(colliderRef.current, {
        x: speedTarget[0],
        y: speedTarget[1],
      })
      const movement = character_controller.computedMovement()
      // update body position
      const newPos = bodyRef.current.translation()
      newPos.x += movement.x
      newPos.y += movement.y
      bodyRef.current.setNextKinematicTranslation(newPos)
      // update mesh positon
      const { x, y } = bodyRef.current.translation()
      groupRef.current.position.x = x
      groupRef.current.position.y = y
      // set spring (player and camera) target values
      api.start({
        speed: [
          left ? speed : right ? -speed : 0,
          up ? speed : down ? -speed : 0,
        ],
        cameraPos: [x, y],
      })
      // update camera position
      const cameraPos = springs.cameraPos.get()
      camera.position.x = cameraPos[0]
      camera.position.y = cameraPos[1]

      if (crosshairGroupRef.current && trooperGroupRef.current) {
        // compute crosshair angle
        const { x: crosshair_x, y: crosshair_y } = vec2
          .set(MOUSE_POSITION.x - x, MOUSE_POSITION.y - y)
          .normalize()
          .multiplyScalar(1.5)
        crosshairGroupRef.current.position.x = crosshair_x
        crosshairGroupRef.current.position.y = crosshair_y

        trooperGroupRef.current.scale.x = crosshair_x > 0 ? 1 : -1
      }
      if (trooperGroupRef.current) {
        const { x, y } = bodyRef.current.linvel()
        const speedRatio = (Math.abs(x) + Math.abs(y)) / (SPEED * 50)
        const sinedTime = Math.sin(elapsedTime.current * 10)
        trooperGroupRef.current.position.y = (sinedTime / 30) * (1 - speedRatio)
        trooperGroupRef.current.rotation.z =
          (sinedTime / 15) * speedRatio - Math.PI
      }
    }
  })

  const [crosshairTexture, trooperTexture] = useTexture(
    [crosshairUrl, trooperUrl],
    (textures) => {
      if (!Array.isArray(textures)) return
      textures.forEach((texture) => {
        texture.minFilter = NearestFilter
        texture.magFilter = NearestFilter
      })
    },
  )

  return (
    <group ref={groupRef}>
      <Shadow
        rotation-x={Math.PI}
        scale={2}
        position-z={-0.1}
        colorStop={0.1}
      />
      <group
        ref={trooperGroupRef}
        position-z={-0.2}
        rotation={[Math.PI, 0, Math.PI]}
      >
        <Plane args={[2, 2]}>
          <meshStandardMaterial
            side={DoubleSide}
            color={0xffffff}
            alphaTest={1}
            map={trooperTexture}
            transparent
          />
        </Plane>
      </group>
      <group
        ref={crosshairGroupRef}
        position-z={-0.3}
        rotation={[Math.PI, 0, 0]}
      >
        <Plane args={[0.7, 0.7]}>
          <meshStandardMaterial
            color={0xffffff}
            map={crosshairTexture}
            transparent
          />
        </Plane>
      </group>
    </group>
  )
}
