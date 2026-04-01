import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { Home as HomePage } from './components/Home'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/tool" element={<App />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  </StrictMode>,
)

