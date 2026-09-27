import { useState, useEffect, useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'
import { Pencil, Trash2, Plus, Search } from 'lucide-react'

const EMPTY = { nome: '', cpf: '', endereco: '', email: '', telefone: '' }

export default function Clientes() {
  const { user } = useContext(AuthContext)
  const { notify } = useToast()
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [busca, setBusca] = useState('')

  const carregarClientes = async () => {
    try {
      const response = await api.get('/cliente/listar')
      setClientes(response.data)
    } catch {
      notify('Erro ao carregar clientes.', 'error')
    }
  }

  useEffect(() => {
    carregarClientes()
  }, [])

  const abrirNovo = () => {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }

  const abrirEdicao = (c) => {
    setEditing(c)
    setForm({
      nome: c.nome || '',
      cpf: c.cpf || '',
      endereco: c.endereco || '',
      email: c.email || '',
      telefone: c.telefone || '',
    })
    setModalOpen(true)
  }

  const handleSalvar = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.patch(`/cliente/atualizar/${editing.id}`, form)
        notify('Cliente atualizado com sucesso.', 'success')
      } else {
        await api.post('/cliente/cadastrar', form)
        notify('Cliente cadastrado com sucesso.', 'success')
      }
      setModalOpen(false)
      setForm(EMPTY)
      setEditing(null)
      carregarClientes()
    } catch {
      notify(editing ? 'Erro ao atualizar cliente.' : 'Erro ao cadastrar cliente.', 'error')
    }
  }

  const handleExcluir = async (id) => {
    if (!confirm('Deseja realmente excluir este cliente?')) return
    try {
      await api.delete(`/cliente/excluir/${id}`)
      notify('Cliente excluido.', 'success')
      carregarClientes()
    } catch {
      notify('Erro ao excluir cliente.', 'error')
    }
  }

  const filtrados = clientes.filter((c) => {
    const q = busca.toLowerCase()
    return (
      c.nome?.toLowerCase().includes(q) ||
      c.cpf?.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.telefone?.includes(q)
    )
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Clientes</h2>
          <p>{clientes.length} registro(s) cadastrado(s).</p>
        </div>
        <button className="btn" onClick={abrirNovo}>
          <Plus size={16} /> Novo cliente
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Lista de clientes</h3>
          <div className="toolbar">
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input
                className="search-input"
                style={{ paddingLeft: 34, margin: 0 }}
                placeholder="Buscar por nome, CPF, e-mail..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Endereco</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">Nenhum cliente encontrado.</td>
                </tr>
              )}
              {filtrados.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.nome}</td>
                  <td>{c.cpf}</td>
                  <td>{c.email}</td>
                  <td>{c.telefone}</td>
                  <td>{c.endereco}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => abrirEdicao(c)}>
                        <Pencil size={14} /> Editar
                      </button>
                      {user?.tipo === 'Gerente' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleExcluir(c.id)}>
                          <Trash2 size={14} /> Excluir
                        </button>
                      )}
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
        title={editing ? `Editar cliente #${editing.id}` : 'Cadastrar cliente'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSalvar} className="form-grid">
          <div className="form-group">
            <label>Nome</label>
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
            <label>E-mail</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Telefone</label>
            <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
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
