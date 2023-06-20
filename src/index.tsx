import './index.css'

import ReactDOM from 'react-dom/client'

import App from './App'
import { Suspense } from 'react'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Suspense fallback={null}>
    <App />,
  </Suspense>,
)

export const SCENERY_GROUP = 1 << 0
export const PLAYER_GROUP = 1 << 1
export const ENEMY_GROUP = 1 << 2
export const BULLET_GROUP = 1 << 3

export type Duplet = [number, number]
