import { useState, useEffect, useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function Clientes() {
  const { user } = useContext(AuthContext)
  const [clientes, setClientes] = useState([])
  const [novoCliente, setNovoCliente] = useState({
    nome: '', cpf: '', endereco: '', email: '', telefone: ''
  })

  useEffect(() => {
    carregarClientes()
  }, [])

  const carregarClientes = async () => {
    try {
      const response = await api.get('/cliente/listar')
      setClientes(response.data)
    } catch (err) {
      alert('Erro ao carregar clientes.')
    }
  }

  const handleCadastrar = async (e) => {
    e.preventDefault()
    try {
      await api.post('/cliente/cadastrar', novoCliente)
      setNovoCliente({ nome: '', cpf: '', endereco: '', email: '', telefone: '' })
      carregarClientes()
    } catch (err) {
      alert('Erro ao cadastrar cliente.')
    }
  }

  const handleExcluir = async (id) => {
    if (confirm('Deseja realmente excluir este cliente?')) {
      try {
        await api.delete(`/cliente/excluir/${id}`)
        carregarClientes()
      } catch (err) {
        alert('Erro ao excluir cliente.')
      }
    }
  }

  return (
    <div>
      <div className="card">
        <h3>Cadastrar Novo Cliente</h3>
        <form onSubmit={handleCadastrar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input
            type="text"
            placeholder="Nome"
            value={novoCliente.nome}
            onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="CPF"
            value={novoCliente.cpf}
            onChange={(e) => setNovoCliente({ ...novoCliente, cpf: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Endereço"
            value={novoCliente.endereco}
            onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
          />
          <input
            type="email"
            placeholder="E-mail"
            value={novoCliente.email}
            onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Telefone"
            value={novoCliente.telefone}
            onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
          />
          <button type="submit" style={{ gridColumn: 'span 2' }}>Salvar Cliente</button>
        </form>
      </div>

      <div className="card">
        <h3>Lista de Clientes</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>E-mail</th>
              <th>Telefone</th>
              {user?.tipo === 'Gerente' && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.nome}</td>
                <td>{c.cpf}</td>
                <td>{c.email}</td>
                <td>{c.telefone}</td>
                {user?.tipo === 'Gerente' && (
                  <td>
                    <button className="danger" onClick={() => handleExcluir(c.id)}>Excluir</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}