import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

import Login from './pages/Login'
import Layout from './components/Layout'
import Clientes from './pages/Clientes'
import Produtos from './pages/Produtos'
import Usuarios from './pages/Usuarios'

// Importação das novas páginas de vendas
import VendasListar from './pages/VendasListar'
import VendaDetalhes from './pages/VendaDetalhes'
import NovaVenda from './pages/NovaVenda'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route
            element={
              <ProtectedRoute allowedRoles={['Gerente', 'Vendedor']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<div><h2>Bem-vindo ao ByteVendas!</h2></div>} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/produtos" element={<Produtos />} />
            
            {/* Rotas de Vendas atreladas ao perfil Vendedor */}
            <Route
              path="/vendas"
              element={
                <ProtectedRoute allowedRoles={['Vendedor']}>
                  <VendasListar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendas/detalhes/:id"
              element={
                <ProtectedRoute allowedRoles={['Vendedor']}>
                  <VendaDetalhes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendas/nova"
              element={
                <ProtectedRoute allowedRoles={['Vendedor']}>
                  <NovaVenda />
                </ProtectedRoute>
              }
            />

            {/* Rota exclusiva de Gerentes */}
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute allowedRoles={['Gerente']}>
                  <Usuarios />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}