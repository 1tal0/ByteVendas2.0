import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function VendasListar() {
  const { user } = useContext(AuthContext)
  const [vendas, setVendas] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    carregarVendas()
  }, [])

  const carregarVendas = async () => {
    try {
      const res = await api.get(`/venda/listar/${user.id}`)
      setVendas(res.data)
    } catch (err) {
      alert('Erro ao carregar lista de vendas.')
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Histórico de Vendas</h3>
        <button onClick={() => navigate('/vendas/nova')}>+ Registrar Nova Venda</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID Venda</th>
            <th>Cliente</th>
            <th>Data</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {vendas.map(v => (
            <tr key={v.id_venda}>
              <td>#{v.id_venda}</td>
              <td>{v.nome} ({v.cpf})</td>
              <td>{new Date(v.data_venda).toLocaleDateString()}</td>
              <td>{v.status}</td>
              <td>
                <button onClick={() => navigate(`/vendas/detalhes/${v.id_venda}`)}>
                  Ver Detalhes
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}