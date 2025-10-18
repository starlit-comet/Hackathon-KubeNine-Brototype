import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import type { StorybookConfig } from '@storybook/react-vite';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
