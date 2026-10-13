import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/variables.css'
import App from './App.jsx'
import { installBrokenImageFallback } from './services/api/brokenImageFallback.js'

installBrokenImageFallback()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
