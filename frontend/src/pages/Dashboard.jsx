import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { Users, Package, ShoppingCart } from 'lucide-react'

export default function Dashboard() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [clientes, setClientes] = useState(0)
  const [produtos, setProdutos] = useState(0)
  const [vendas, setVendas] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const [c, p] = await Promise.all([
          api.get('/cliente/listar'),
          api.get('/produto/listar'),
        ])
        setClientes(c.data?.length || 0)
        setProdutos(p.data?.length || 0)
        if (user?.tipo === 'Vendedor') {
          const v = await api.get(`/venda/listar/${user.id}`)
          setVendas(v.data?.length || 0)
        }
      } catch {
        setClientes(0)
        setProdutos(0)
      }
    }
    load()
  }, [user])

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Ola, {user?.nome}</h2>
          <p>Acompanhe o resumo da operacao em tempo real.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Users size={20} /></div>
          <span>Clientes</span>
          <strong>{clientes}</strong>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Package size={20} /></div>
          <span>Produtos</span>
          <strong>{produtos}</strong>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><ShoppingCart size={20} /></div>
          <span>{user?.tipo === 'Vendedor' ? 'Minhas vendas' : 'Perfil'}</span>
          <strong>{user?.tipo === 'Vendedor' ? vendas : user?.tipo}</strong>
        </div>
      </div>

      <div className="card">
        <h3>Atalhos</h3>
        <div className="toolbar" style={{ marginTop: 14 }}>
          <button className="btn" onClick={() => navigate('/clientes')}>Gerenciar clientes</button>
          <button className="btn btn-ghost" onClick={() => navigate('/produtos')}>Ver catalogo</button>
          {user?.tipo === 'Vendedor' && (
            <button className="btn btn-success" onClick={() => navigate('/vendas/nova')}>Nova venda</button>
          )}
          {user?.tipo === 'Gerente' && (
            <button className="btn btn-outline" onClick={() => navigate('/usuarios')}>Usuarios</button>
          )}
        </div>
      </div>
    </div>
  )
}
