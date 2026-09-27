import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '', cpf: '', endereco: '', nome_usuario: '', email: '', senha: '', tipo: 'Vendedor'
  })

  useEffect(() => {
    carregarUsuarios()
  }, [])

  const carregarUsuarios = async () => {
    try {
      const response = await api.get('/usuario/listar')
      setUsuarios(response.data)
    } catch (err) {
      alert('Erro ao carregar usuários.')
    }
  }

  const handleCadastrar = async (e) => {
    e.preventDefault()
    try {
      await api.post('/usuario/cadastrar', novoUsuario)
      alert('Usuário cadastrado com sucesso!')
      setNovoUsuario({
        nome: '', cpf: '', endereco: '', nome_usuario: '', email: '', senha: '', tipo: 'Vendedor'
      })
      carregarUsuarios()
    } catch (err) {
      alert('Erro ao cadastrar usuário.')
    }
  }

  const handleExcluir = async (id) => {
    if (confirm('Deseja realmente excluir este usuário?')) {
      try {
        await api.delete(`/usuario/excluir/${id}`)
        carregarUsuarios()
      } catch (err) {
        alert('Erro ao excluir usuário.')
      }
    }
  }

  return (
    <div>
      <div className="card">
        <h3>Cadastrar Novo Usuário</h3>
        <form onSubmit={handleCadastrar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input
            type="text" placeholder="Nome Completo" value={novoUsuario.nome}
            onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })} required
          />
          <input
            type="text" placeholder="CPF" value={novoUsuario.cpf}
            onChange={(e) => setNovoUsuario({ ...novoUsuario, cpf: e.target.value })} required
          />
          <input
            type="text" placeholder="Endereço" value={novoUsuario.endereco}
            onChange={(e) => setNovoUsuario({ ...novoUsuario, endereco: e.target.value })}
          />
          <input
            type="text" placeholder="Nome de Usuário (login)" value={novoUsuario.nome_usuario}
            onChange={(e) => setNovoUsuario({ ...novoUsuario, nome_usuario: e.target.value })} required
          />
          <input
            type="email" placeholder="E-mail" value={novoUsuario.email}
            onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })} required
          />
          <input
            type="password" placeholder="Senha" value={novoUsuario.senha}
            onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })} required
          />
          <select
            value={novoUsuario.tipo}
            onChange={(e) => setNovoUsuario({ ...novoUsuario, tipo: e.target.value })}
            style={{ gridColumn: 'span 2' }}
          >
            <option value="Vendedor">Vendedor</option>
            <option value="Gerente">Gerente</option>
          </select>
          <button type="submit" style={{ gridColumn: 'span 2' }}>Salvar Usuário</button>
        </form>
      </div>

      <div className="card">
        <h3>Lista de Usuários do Sistema</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Usuário</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.nome}</td>
                <td>{u.nome_usuario}</td>
                <td>{u.email}</td>
                <td>{u.tipo}</td>
                <td>
                  <button className="danger" onClick={() => handleExcluir(u.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}