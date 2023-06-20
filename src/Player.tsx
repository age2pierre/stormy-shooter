import { animated, config, useSpring } from '@react-spring/three'
import { useFrame, useThree } from '@react-three/fiber'
import { useBox, useKinematicCharacterController } from '@react-three/p2'
import { useEffect, useRef, useState } from 'react'
import type { Object3D } from 'three'
import * as THREE from 'three'

import { useControls } from './use-controls'
import { PLAYER_GROUP, SCENERY_GROUP } from './index'
import { proxy } from 'valtio'
import { useTexture } from '@react-three/drei'

const player_state = proxy<{
  facing: 'left' | 'right'
  is_hurt: boolean
  lifes: number
  sprite_animation: 'idle' | 'running'
}>({
  facing: 'right',
  is_hurt: false,
  lifes: 3,
  sprite_animation: 'idle',
})

export default (props: { position: [x: number, y: number] }) => {
  const { camera } = useThree()

  const body = useRef<Object3D>(null)

  const controls = useControls()

  const bodyPosition = useRef<[x: number, y: number]>()
  const rayData = useRef([])

  const [, bodyApi] = useBox(
    () => ({
      mass: 0,
      position: props.position,
      fixedRotation: true,
      damping: 0,
      type: 'Kinematic',
      collisionGroup: PLAYER_GROUP,
    }),
    body,
  )

  const [, controllerApi] = useKinematicCharacterController(() => ({
    body,
    collisionMask: SCENERY_GROUP,
    velocityXSmoothing: 0.0001,
    maxJumpHeight: 6,
  }))

  const collisions = useRef<{ below: boolean }>({ below: false })

  const [yImpulse, setYImpulse] = useState(0)

  const springs = useSpring({
    from: {
      scaleY: yImpulse,
      scaleX: 1 + (1 - yImpulse) / 2,
      positionY: yImpulse > 1 ? (yImpulse - 1) / 1.5 : yImpulse - 1,
    },
    to: { scaleY: 1, scaleX: 1, positionY: 0 },
    config: config.wobbly,
    reset: true,
  })

  useEffect(() => {
    controllerApi.raysData.subscribe((e) => {
      rayData.current = e
    })

    controllerApi.collisions.subscribe((e: { below: boolean }) => {
      //console.log(e);
      if (e.below !== collisions.current.below && !e.below) setYImpulse(1.2) // jumped
      if (e.below !== collisions.current.below && e.below) setYImpulse(0.8) // landed

      collisions.current = e
    })

    bodyApi.position.subscribe((p) => {
      bodyPosition.current = p

      camera.position.lerp({ x: p[0], y: p[1], z: 100 } as THREE.Vector3, 0.1)

      camera.lookAt(p[0], p[1], 0)
    })
  }, [])

  useFrame(() => {
    const { jump, left, right } = controls.current

    controllerApi.setJump(jump)

    controllerApi.setInput([~~right - ~~left, 0])
  })

  // const sprite_texture = useTexture()

  return (
    <group ref={body as any}>
      <animated.mesh
        scale-y={springs.scaleY}
        scale-x={springs.scaleX}
        position-y={springs.positionY}
      >
        <boxGeometry args={[1, 1]} />
        <meshNormalMaterial />
      </animated.mesh>
    </group>
  )
}
