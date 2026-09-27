import { useContext } from 'react'
import { Link, useNavigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2>ByteVendas</h2>
        <nav>
          <ul className="nav-links">
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/clientes">Clientes</Link></li>
            <li><Link to="/produtos">Produtos</Link></li>
            {user?.tipo === 'Vendedor' && (
              <li><Link to="/vendas">Vendas</Link></li>
            )}
            {user?.tipo === 'Gerente' && (
              <li><Link to="/usuarios">Usuários</Link></li>
            )}
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h3>Olá, {user?.nome}</h3>
            <small style={{ color: '#64748b' }}>Perfil: {user?.tipo}</small>
          </div>
          <button onClick={handleLogout} className="danger">Sair</button>
        </header>

        <Outlet />
      </main>
    </div>
  )
}