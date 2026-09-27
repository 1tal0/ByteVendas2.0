import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'
import { Pencil, Trash2, Plus } from 'lucide-react'

const EMPTY = {
  nome: '',
  cpf: '',
  endereco: '',
  nome_usuario: '',
  email: '',
  senha: '',
  tipo: 'Vendedor',
}

export default function Usuarios() {
  const { notify } = useToast()
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [busca, setBusca] = useState('')

  const carregarUsuarios = async () => {
    try {
      const response = await api.get('/usuario/listar')
      setUsuarios(response.data)
    } catch {
      notify('Erro ao carregar usuarios.', 'error')
    }
  }

  useEffect(() => {
    carregarUsuarios()
  }, [])

  const abrirNovo = () => {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }

  const abrirEdicao = (u) => {
    setEditing(u)
    setForm({
      nome: u.nome || '',
      cpf: u.cpf || '',
      endereco: u.endereco || '',
      nome_usuario: u.nome_usuario || '',
      email: u.email || '',
      senha: u.senha || '',
      tipo: u.tipo || 'Vendedor',
    })
    setModalOpen(true)
  }

  const handleSalvar = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.patch(`/usuario/atualizar/${editing.id}`, form)
        notify('Usuario atualizado com sucesso.', 'success')
      } else {
        await api.post('/usuario/cadastrar', form)
        notify('Usuario cadastrado com sucesso.', 'success')
      }
      setModalOpen(false)
      setForm(EMPTY)
      setEditing(null)
      carregarUsuarios()
    } catch {
      notify(editing ? 'Erro ao atualizar usuario.' : 'Erro ao cadastrar usuario.', 'error')
    }
  }

  const handleExcluir = async (id) => {
    if (!confirm('Deseja realmente excluir este usuario?')) return
    try {
      await api.delete(`/usuario/excluir/${id}`)
      notify('Usuario excluido.', 'success')
      carregarUsuarios()
    } catch {
      notify('Erro ao excluir usuario.', 'error')
    }
  }

  const filtrados = usuarios.filter((u) => {
    const q = busca.toLowerCase()
    return (
      u.nome?.toLowerCase().includes(q) ||
      u.nome_usuario?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.tipo?.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Usuarios</h2>
          <p>{usuarios.length} conta(s) no sistema.</p>
        </div>
        <button className="btn" onClick={abrirNovo}>
          <Plus size={16} /> Novo usuario
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Equipe</h3>
          <input
            className="search-input"
            placeholder="Buscar por nome, login, e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Usuario</th>
                <th>E-mail</th>
                <th>CPF</th>
                <th>Perfil</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">Nenhum usuario encontrado.</td>
                </tr>
              )}
              {filtrados.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nome}</td>
                  <td>{u.nome_usuario}</td>
                  <td>{u.email}</td>
                  <td>{u.cpf}</td>
                  <td>
                    <span className={`badge ${u.tipo === 'Gerente' ? 'badge-amber' : 'badge-cyan'}`}>
                      {u.tipo}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => abrirEdicao(u)}>
                        <Pencil size={14} /> Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleExcluir(u.id)}>
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={editing ? `Editar usuario #${editing.id}` : 'Cadastrar usuario'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSalvar} className="form-grid">
          <div className="form-group">
            <label>Nome completo</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>CPF</label>
            <input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} required />
          </div>
          <div className="form-group span-2">
            <label>Endereco</label>
            <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Nome de usuario</label>
            <input value={form.nome_usuario} onChange={(e) => setForm({ ...form, nome_usuario: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Perfil</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              <option value="Vendedor">Vendedor</option>
              <option value="Gerente">Gerente</option>
            </select>
          </div>
          <div className="form-group span-2" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn">{editing ? 'Salvar alteracoes' : 'Cadastrar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
