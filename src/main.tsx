import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { OmnibusProvider } from './context/OmnibusContext'

createRoot(document.getElementById('root')!).render(
  <OmnibusProvider>
    <App />
  </OmnibusProvider>,
)
