import { useState, useEffect, useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'
import { Pencil, Trash2, Plus } from 'lucide-react'

const EMPTY = {
  nome: '',
  marca: '',
  preco_base: '',
  qtd_estoque: '',
  tipo: 'Nacional',
  imposto_local: '',
  taxa_importacao: '',
  pais_origem: '',
}

function montarPayload(form) {
  return {
    ...form,
    preco_base: parseFloat(form.preco_base),
    qtd_estoque: parseInt(form.qtd_estoque, 10),
    imposto_local: form.tipo === 'Nacional' ? parseFloat(form.imposto_local || 0) : 0,
    taxa_importacao: form.tipo === 'Importado' ? parseFloat(form.taxa_importacao || 0) : 0,
    pais_origem: form.tipo === 'Importado' ? form.pais_origem : 'Brasil',
  }
}

export default function Produtos() {
  const { user } = useContext(AuthContext)
  const { notify } = useToast()
  const isGerente = user?.tipo === 'Gerente'
  const [produtos, setProdutos] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [busca, setBusca] = useState('')

  const carregarProdutos = async () => {
    try {
      const response = await api.get('/produto/listar')
      setProdutos(response.data)
    } catch {
      notify('Erro ao carregar produtos.', 'error')
    }
  }

  useEffect(() => {
    carregarProdutos()
  }, [])

  const abrirNovo = () => {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }

  const abrirEdicao = (p) => {
    setEditing(p)
    setForm({
      nome: p.nome || '',
      marca: p.marca || '',
      preco_base: p.preco_base ?? '',
      qtd_estoque: p.qtd_estoque ?? '',
      tipo: p.tipo || 'Nacional',
      imposto_local: p.imposto_local ?? '',
      taxa_importacao: p.taxa_importacao ?? '',
      pais_origem: p.pais_origem || '',
    })
    setModalOpen(true)
  }

  const handleSalvar = async (e) => {
    e.preventDefault()
    const payload = montarPayload(form)
    try {
      if (editing) {
        await api.patch(`/produto/atualizar/${editing.id}`, payload)
        notify('Produto atualizado com sucesso.', 'success')
      } else {
        await api.post('/produto/cadastrar', payload)
        notify('Produto cadastrado com sucesso.', 'success')
      }
      setModalOpen(false)
      setForm(EMPTY)
      setEditing(null)
      carregarProdutos()
    } catch {
      notify(editing ? 'Erro ao atualizar produto.' : 'Erro ao cadastrar produto.', 'error')
    }
  }

  const handleExcluir = async (id) => {
    if (!confirm('Deseja realmente excluir este produto?')) return
    try {
      await api.delete(`/produto/excluir/${id}`)
      notify('Produto excluido.', 'success')
      carregarProdutos()
    } catch {
      notify('Erro ao excluir produto.', 'error')
    }
  }

  const filtrados = produtos.filter((p) => {
    const q = busca.toLowerCase()
    return p.nome?.toLowerCase().includes(q) || p.marca?.toLowerCase().includes(q) || p.tipo?.toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Produtos</h2>
          <p>{produtos.length} item(ns) no catalogo.</p>
        </div>
        {isGerente && (
          <button className="btn" onClick={abrirNovo}>
            <Plus size={16} /> Novo produto
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Catalogo</h3>
          <input
            className="search-input"
            placeholder="Buscar por nome, marca ou tipo..."
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
                <th>Marca</th>
                <th>Tipo</th>
                <th>Preco base</th>
                <th>Estoque</th>
                <th>Detalhes fiscais</th>
                {isGerente && <th>Acoes</th>}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={isGerente ? 8 : 7} className="empty-state">Nenhum produto encontrado.</td>
                </tr>
              )}
              {filtrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nome}</td>
                  <td>{p.marca}</td>
                  <td>
                    <span className={`badge ${p.tipo === 'Nacional' ? 'badge-cyan' : 'badge-amber'}`}>
                      {p.tipo}
                    </span>
                  </td>
                  <td>R$ {Number(p.preco_base).toFixed(2)}</td>
                  <td>{p.qtd_estoque} un</td>
                  <td>
                    {p.tipo === 'Nacional'
                      ? `Imposto: ${p.imposto_local}%`
                      : `Taxa: ${p.taxa_importacao}% (${p.pais_origem})`}
                  </td>
                  {isGerente && (
                    <td>
                      <div className="actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => abrirEdicao(p)}>
                          <Pencil size={14} /> Editar
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleExcluir(p.id)}>
                          <Trash2 size={14} /> Excluir
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={editing ? `Editar produto #${editing.id}` : 'Cadastrar produto'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSalvar} className="form-grid">
          <div className="form-group">
            <label>Nome</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Marca</label>
            <input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Preco base (R$)</label>
            <input
              type="number"
              step="0.01"
              value={form.preco_base}
              onChange={(e) => setForm({ ...form, preco_base: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Qtd. em estoque</label>
            <input
              type="number"
              value={form.qtd_estoque}
              onChange={(e) => setForm({ ...form, qtd_estoque: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              <option value="Nacional">Nacional</option>
              <option value="Importado">Importado</option>
            </select>
          </div>
          {form.tipo === 'Nacional' ? (
            <div className="form-group">
              <label>Imposto local (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.imposto_local}
                onChange={(e) => setForm({ ...form, imposto_local: e.target.value })}
                required
              />
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Taxa de importacao (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.taxa_importacao}
                  onChange={(e) => setForm({ ...form, taxa_importacao: e.target.value })}
                  required
                />
              </div>
              <div className="form-group span-2">
                <label>Pais de origem</label>
                <input
                  value={form.pais_origem}
                  onChange={(e) => setForm({ ...form, pais_origem: e.target.value })}
                  required
                />
              </div>
            </>
          )}
          <div className="form-group span-2" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn">{editing ? 'Salvar alteracoes' : 'Cadastrar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
