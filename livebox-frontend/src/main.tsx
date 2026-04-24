import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { InvitePreviewPage } from './pages/server/InvitePreviewPage'
import { ServerEmptyPage } from './pages/server/ServerEmptyPage'
import { CreateServerPage } from './pages/server/CreateServerPage'
import { MainApplicationPage } from './pages/server/MainApplicationPage'
import { OwnedServersPage } from './pages/server/OwnedServersPage'

import { ProtectedRoute } from './components/auth/ProtectedRoute'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/invite/:code" element={<InvitePreviewPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/servers/empty" 
          element={
            <ProtectedRoute>
              <ServerEmptyPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/servers/create" 
          element={
            <ProtectedRoute>
              <CreateServerPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/servers/owned" 
          element={
            <ProtectedRoute>
              <OwnedServersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/app/main" 
          element={
            <ProtectedRoute>
              <MainApplicationPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
