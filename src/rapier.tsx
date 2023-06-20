import { useAsset } from 'use-asset'

import type Rapier from '@dimforge/rapier2d-compat'
import {
  ActiveEvents,
  Collider,
  EventQueue,
  KinematicCharacterController,
  World,
} from '@dimforge/rapier2d-compat'
import { ReactNode, createContext, useContext, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, LineSegments, MathUtils } from 'three'

export interface RapierContext {
  rapier: typeof Rapier
  world: World
  characterController: KinematicCharacterController
  registerCollisionEvent: (
    collider: Collider,
    onStart?: (target: Collider) => void,
    onEnd?: (target: Collider) => void,
  ) => void
  cleanupCollisionEvent: (collider: Collider) => void
}

export const RapierContext = createContext<RapierContext | undefined>(undefined)

async function importRapier() {
  let r = await import('@dimforge/rapier2d-compat')
  await r.init()
  return r
}

export function useRapier() {
  return useContext(RapierContext)!
}

export function Physics({ children }: { children: ReactNode }) {
  const rapier = useAsset(importRapier)

  const world = new rapier.World({ x: 0.0, y: 0 })
  const characterController = world.createCharacterController(0.01)
  const eventQueue = new EventQueue(false)
  const eventMap = new Map<
    number,
    {
      onStart?: (collided: Collider) => void
      onEnd?: (collided: Collider) => void
    }
  >()

  useFrame((_, dt) => {
    const clampedDelta = MathUtils.clamp(dt, 0, 0.2)
    world.timestep = clampedDelta
    world.step(eventQueue)

    eventQueue.drainCollisionEvents((h1, h2, started) => {
      const c1 = world.getCollider(h1)
      const c2 = world.getCollider(h2)

      const e1 = eventMap.get(h1)
      const e2 = eventMap.get(h2)

      if (started) {
        e1?.onStart?.(c2)
        e2?.onStart?.(c1)
      } else {
        e1?.onEnd?.(c2)
        e2?.onEnd?.(c1)
      }
    })
  })

  return (
    <RapierContext.Provider
      value={{
        rapier,
        world,
        characterController,
        registerCollisionEvent: (collider, onStart, onEnd) => {
          collider.setActiveEvents(ActiveEvents.COLLISION_EVENTS)
          eventMap.set(collider.handle, { onEnd, onStart })
          return () => {
            eventMap.delete(collider.handle)
          }
        },
        cleanupCollisionEvent: (collider) => {
          eventMap.delete(collider.handle)
        }
      }}
    >
      {children}
    </RapierContext.Provider>
  )
}

export function Debug() {
  const { world } = useRapier()
  const ref = useRef<LineSegments>(null)

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return

    const buffers = world.debugRender()

    mesh.geometry.setAttribute(
      'position',
      new BufferAttribute(buffers.vertices, 2),
    )
    mesh.geometry.setAttribute('color', new BufferAttribute(buffers.colors, 4))
  })

  return (
    <lineSegments ref={ref} frustumCulled={false}>
      <lineBasicMaterial color={0xffffff} vertexColors />
      <bufferGeometry />
    </lineSegments>
  )
}
