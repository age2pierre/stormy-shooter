import { Sphere } from '@react-three/drei'

import { BulletId, deleteBullet, useBulletStore } from './bullets-store'
import { Duplet } from './common'
import { Projectile } from './Projectile'

export function BulletsManager() {
  const bullets = useBulletStore()
  return (
    <>
      {Object.entries(bullets)
        .filter((e) => Boolean(e[1]))
        .map(([id, state]) => (
          <Projectile
            key={id}
            direction={state!.direction as Duplet}
            radius={0.2}
            position={state!.position as Duplet}
            onTimeout={() => {
              deleteBullet(id as BulletId)
            }}
            onCollide={() => {
              deleteBullet(id as BulletId)
            }}
          >
            <Sphere args={[0.2]}>
              <meshNormalMaterial />
            </Sphere>
          </Projectile>
        ))}
    </>
  )
}
