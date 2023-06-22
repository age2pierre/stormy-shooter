import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { BufferAttribute, LineSegments } from 'three'

import { useRapier } from './rapier'

export function DebugRapier() {
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
      <lineBasicMaterial color={16777215} vertexColors linewidth={3} />
      <bufferGeometry />
    </lineSegments>
  )
}
