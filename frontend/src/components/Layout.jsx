import { useContext, useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { LayoutDashboard, Users, Package, ShoppingCart, UserCog, Menu, LogOut } from 'lucide-react'

const TITLES = {
  '/dashboard': ['Painel', 'Visao geral do ByteVendas'],
  '/clientes': ['Clientes', 'Cadastro e manutencao da base de clientes'],
  '/produtos': ['Produtos', 'Catalogo, estoque e dados fiscais'],
  '/vendas': ['Vendas', 'Historico e acompanhamento das vendas'],
  '/vendas/nova': ['Nova venda', 'Registre um pedido completo'],
  '/usuarios': ['Usuarios', 'Gestao de acessos do sistema'],
}

export default function Layout() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const titlePair = TITLES[location.pathname]
    || (location.pathname.startsWith('/vendas/detalhes')
      ? ['Detalhes da venda', 'Edite status, pagamento e itens']
      : ['ByteVendas', ''])

  const close = () => setOpen(false)

  return (
    <div className="app-shell">
      {open && <div className="sidebar-backdrop" onClick={close} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">BV</div>
          <div className="brand-copy">
            <strong>ByteVendas</strong>
            <span>Gestao comercial</span>
          </div>
        </div>
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/dashboard" end onClick={close}>
                <LayoutDashboard size={18} /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/clientes" onClick={close}>
                <Users size={18} /> Clientes
              </NavLink>
            </li>
            <li>
              <NavLink to="/produtos" onClick={close}>
                <Package size={18} /> Produtos
              </NavLink>
            </li>
            {user?.tipo === 'Vendedor' && (
              <li>
                <NavLink to="/vendas" end onClick={close}>
                  <ShoppingCart size={18} /> Vendas
                </NavLink>
              </li>
            )}
            {user?.tipo === 'Gerente' && (
              <li>
                <NavLink to="/usuarios" onClick={close}>
                  <UserCog size={18} /> Usuarios
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
        <div className="sidebar-user">
          <p>{user?.nome}</p>
          <small>{user?.tipo}</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Abrir menu">
              <Menu size={20} />
            </button>
            <div>
              <h1>{titlePair[0]}</h1>
              <p>{titlePair[1]}</p>
            </div>
          </div>
          <button className="btn btn-danger" onClick={handleLogout}>
            <LogOut size={16} /> Sair
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
