import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DAQProvider } from './context/DAQContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DAQProvider>
      <App />
    </DAQProvider>
  </StrictMode>,
)
