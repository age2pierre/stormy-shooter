import { Collider, RigidBody } from '@dimforge/rapier2d-compat'
import { config, useSpring } from '@react-spring/three'
import { Plane, Shadow, useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { ReactNode, useCallback, useEffect, useRef } from 'react'
import { DoubleSide, Group, NearestFilter, Vector2 } from 'three'

import crosshairUrl from './assets/crosshair.png'
import trooperUrl from './assets/trooper.png'
import { addBullet } from './bullets-store'
import { Duplet } from './common'
import { MOUSE_POSITION } from './common'
import { useRapier } from './rapier'
import { useControls } from './useControls'

const SPEED = 0.15
const COS_SPEED = Math.cos(Math.PI / 4) * SPEED

const vec2 = new Vector2(0, 0)

const COOLDOWN_SHOOT = 0.5

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
  const controls = useControls()
  const { camera } = useThree()
  const frameState = useRef({
    lastShootTime: 0,
    crosshair_x: 0,
    crosshair_y: 0,
    elapsedTime: 0,
    x: 0,
    y: 0,
  })

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

  const clickCallback = useCallback(() => {
    // shoot bullet if cooldowned and input pressed
    const { current: _frameState } = frameState
    if (_frameState.elapsedTime - _frameState.lastShootTime <= COOLDOWN_SHOOT)
      return
    addBullet({
      direction: [_frameState.crosshair_x, _frameState.crosshair_y],
      position: [
        _frameState.x + _frameState.crosshair_x,
        _frameState.y + _frameState.crosshair_y,
      ],
    })
    _frameState.lastShootTime = _frameState.elapsedTime
  }, [])

  useEffect(() => {
    bodyRef.current = world.createRigidBody(
      rapier.RigidBodyDesc.kinematicPositionBased().setTranslation(...position),
    )
    colliderRef.current = world.createCollider(
      rapier.ColliderDesc.cuboid(0.5, 0.7),
      bodyRef.current,
    )
    window.addEventListener('click', clickCallback)
    return () => {
      if (bodyRef.current) {
        world.removeRigidBody(bodyRef.current)
      }
      window.removeEventListener('click', clickCallback)
    }
  }, [])

  useFrame((_, dt) => {
    if (
      !colliderRef.current ||
      !bodyRef.current ||
      !groupRef.current ||
      !crosshairGroupRef.current ||
      !trooperGroupRef.current
    )
      return

    // get player input
    const { left, right, up, down } = controls.current
    const diag = (left || right) && (up || down)
    const speed = diag ? COS_SPEED : SPEED

    // get target speed as a filtered out value of d-pad
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

    // compute and set crosshair angle
    const { x: crosshair_x, y: crosshair_y } = vec2
      .set(MOUSE_POSITION.x - x, MOUSE_POSITION.y - y)
      .normalize()
      .multiplyScalar(1.5)
    crosshairGroupRef.current.position.x = crosshair_x
    crosshairGroupRef.current.position.y = crosshair_y

    // flip sprite dependent on cursor direction
    trooperGroupRef.current.scale.x = crosshair_x > 0 ? 1 : -1

    // get linear velocity and animate idle/walking as a function of it
    const { x: vel_x, y: vel_y } = bodyRef.current.linvel()
    const speedRatio = (Math.abs(vel_x) + Math.abs(vel_y)) / (SPEED * 50)
    const sinedTime = Math.sin(frameState.current.elapsedTime * 10)
    trooperGroupRef.current.position.y = (sinedTime / 30) * (1 - speedRatio)
    trooperGroupRef.current.rotation.z = (sinedTime / 15) * speedRatio - Math.PI

    frameState.current = {
      elapsedTime: frameState.current.elapsedTime + dt,
      lastShootTime: frameState.current.lastShootTime,
      crosshair_x,
      crosshair_y,
      x,
      y,
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
      {children}
    </group>
  )
}
