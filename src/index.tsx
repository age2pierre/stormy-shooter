import './index.css'

import ReactDOM from 'react-dom/client'

import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />,
)

export const SCENERY_GROUP = 1 << 0
export const PLAYER_GROUP = 1 << 1
