import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ServerEmptyPage } from './pages/server/ServerEmptyPage'
import { CreateServerPage } from './pages/server/CreateServerPage'
import { MainApplicationPage } from './pages/server/MainApplicationPage'
import { OwnedServersPage } from './pages/server/OwnedServersPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/servers/empty" element={<ServerEmptyPage />} />
        <Route path="/servers/create" element={<CreateServerPage />} />
        <Route path="/servers/owned" element={<OwnedServersPage />} />
        <Route path="/app/main" element={<MainApplicationPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
