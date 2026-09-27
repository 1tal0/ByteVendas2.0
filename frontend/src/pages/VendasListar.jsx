import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { Plus, Eye } from 'lucide-react'

function statusBadge(status) {
  if (status === 'PAGO') return 'badge-green'
  if (status === 'CANCELADO') return 'badge-red'
  return 'badge-amber'
}

export default function VendasListar() {
  const { user } = useContext(AuthContext)
  const { notify } = useToast()
  const [vendas, setVendas] = useState([])
  const [busca, setBusca] = useState('')
  const navigate = useNavigate()

  const carregarVendas = async () => {
    try {
      const res = await api.get(`/venda/listar/${user.id}`)
      setVendas(res.data)
    } catch {
      notify('Erro ao carregar lista de vendas.', 'error')
    }
  }

  useEffect(() => {
    carregarVendas()
  }, [])

  const filtradas = vendas.filter((v) => {
    const q = busca.toLowerCase()
    return (
      String(v.id_venda).includes(q) ||
      v.nome?.toLowerCase().includes(q) ||
      v.cpf?.includes(q) ||
      v.status?.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Vendas</h2>
          <p>{vendas.length} pedido(s) registrados.</p>
        </div>
        <button className="btn" onClick={() => navigate('/vendas/nova')}>
          <Plus size={16} /> Nova venda
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Historico</h3>
          <input
            className="search-input"
            placeholder="Buscar por cliente, CPF ou status..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">Nenhuma venda encontrada.</td>
                </tr>
              )}
              {filtradas.map((v) => (
                <tr key={v.id_venda}>
                  <td>#{v.id_venda}</td>
                  <td>{v.nome} ({v.cpf})</td>
                  <td>{new Date(v.data_venda).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <span className={`badge ${statusBadge(v.status)}`}>{v.status}</span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/vendas/detalhes/${v.id_venda}`)}>
                      <Eye size={14} /> Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
