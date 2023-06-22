export type CollisionGene = number & { __brand: CollisionGene }

export const SCENERY_GROUP = (1 << 0) as CollisionGene
export const PLAYER_GROUP = (1 << 1) as CollisionGene
export const ENEMY_GROUP = (1 << 2) as CollisionGene
export const PROJECTILE_GROUP = (1 << 3) as CollisionGene

export function computeCollissionGroup(
  menberships: CollisionGene | CollisionGene[],
  filterships: CollisionGene[] = [
    SCENERY_GROUP,
    PLAYER_GROUP,
    ENEMY_GROUP,
    PROJECTILE_GROUP,
  ],
) {
  const _menbership = (Array.isArray(menberships) ? menberships : [menberships])
    .map((m) => m << 16)
    .reduce((acc, val) => (acc &= val), 0)
  const _filtership = filterships.reduce((acc, val) => (acc &= val), 0)
  const result = _menbership & _filtership
  return result
}

export type Duplet = [number, number]

export const MOUSE_POSITION = {
  x: 0,
  y: 0,
}
