import { useFrame } from '@react-three/fiber'
import { useBox, usePlatformController } from '@react-three/p2'
import { useEffect, useRef } from 'react'
import type { LineSegments } from 'three'
import * as THREE from 'three'

import { PLAYER_GROUP, SCENERY_GROUP } from './index'

export default ({
  args,
  position,
  localWaypoints,
}: {
  args: [width: number, height: number]
  position: [x: number, y: number]
  localWaypoints: [x: number, y: number][]
}) => {
  const [ref] = useBox(() => ({
    args,
    position,
    mass: 0,
    collisionGroup: SCENERY_GROUP,
  }))

  const [, controllerApi] = usePlatformController(() => ({
    body: ref,
    passengerMask: PLAYER_GROUP,
    localWaypoints,
    speed: 4,
    skinWidth: 0.1,
    dstBetweenRays: 0.5,
  }))

  const raysRef = useRef<LineSegments>(null)

  const rayData = useRef([])

  useEffect(() => {
    controllerApi.raysData.subscribe((e) => {
      rayData.current = e
    })
    const colors = new Float32Array(100 * 3)
    for (let i = 0; i < 300; i = i + 6) {
      colors[i + 0] = 1
      colors[i + 1] = 0
      colors[i + 2] = 0

      colors[i + 3] = 0
      colors[i + 4] = 0
      colors[i + 5] = 1
    }
    raysRef.current &&
      raysRef.current.geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3),
      )
  }, [])

  useFrame(() => {
    return
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[...args, 2]} />
      <meshNormalMaterial />
    </mesh>
  )
}
