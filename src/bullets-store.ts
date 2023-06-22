import { nanoid } from 'nanoid'
import { subscribe, useSnapshot } from 'valtio'
import { proxy } from 'valtio'

import { Duplet } from './common'

const bullets_store = proxy<Record<BulletId, BulletInitState | null>>()

subscribe(bullets_store, () => {
  console.log('bullet_store => \n' + JSON.stringify(bullets_store, 2))
})

export type BulletId = string & { __brand: BulletId }

export type BulletInitState = {
  direction: Duplet
  position: Duplet
}

export function useBulletStore() {
  return useSnapshot(bullets_store)
}

export function addBullet(args: BulletInitState): BulletId {
  const id = nanoid() as BulletId
  bullets_store[id] = args
  return id
}

export function deleteBullet(id: BulletId) {
  bullets_store[id] = null
  return
}
