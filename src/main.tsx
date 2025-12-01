import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TaskProvider } from './context/TaskContext.tsx'
import { AIProvider } from './context/AIContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TaskProvider>
      <AIProvider>
        <App />
      </AIProvider>
    </TaskProvider>
  </StrictMode>,
)
