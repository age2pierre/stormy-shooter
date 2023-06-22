import { ActiveEvents, Collider, EventQueue } from '@dimforge/rapier2d-compat'
import { useFrame } from '@react-three/fiber'
import { ReactNode } from 'react'
import { MathUtils } from 'three'
import { useAsset } from 'use-asset'

import { importRapier, RapierContext } from './rapier'

export function Physics({ children }: { children: ReactNode }) {
  const rapier = useAsset(importRapier)

  const world = new rapier.World({ x: 0, y: 0 })
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
        },
      }}
    >
      {children}
    </RapierContext.Provider>
  )
}
