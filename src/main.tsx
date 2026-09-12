import '@/styles/global.css'

import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { ProtectedRoute } from '@/components/common/protected-route'
import { AuthProvider } from '@/contexts/auth-context'
import HomePage from '@/pages/guest/home'
import LoginPage from '@/pages/guest/login'
import IssuesPage from '@/pages/issues'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/issues" element={<ProtectedRoute><IssuesPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>,
)
