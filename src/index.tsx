import './index.css'

import { Suspense } from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Suspense fallback={null}>
    <App />,
  </Suspense>,
)
