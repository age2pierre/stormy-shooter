import type Rapier from '@dimforge/rapier2d-compat'
import {
  Collider,
  KinematicCharacterController,
  World,
} from '@dimforge/rapier2d-compat'
import { createContext, useContext } from 'react'

interface RapierContext {
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

export async function importRapier() {
  const r = await import('@dimforge/rapier2d-compat')
  await r.init()
  return r
}

export function useRapier() {
  const ctx = useContext(RapierContext)
  if (!ctx) {
    throw Error('You can only useRapier inside <Physics /> children')
  }
  return ctx
}
