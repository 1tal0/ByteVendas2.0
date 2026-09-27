import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { ArrowLeft, Trash2 } from 'lucide-react'

export default function VendaDetalhes() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const { notify } = useToast()
  const navigate = useNavigate()

  const [venda, setVenda] = useState(null)
  const [itens, setItens] = useState([])
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [idCliente, setIdCliente] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [status, setStatus] = useState('')
  const [produtoSelecionado, setProdutoSelecionado] = useState('')
  const [quantidade, setQuantidade] = useState(1)

  const carregarDados = async () => {
    try {
      const resVenda = await api.get(`/venda/listar/${user.id}/${id}`)
      if (resVenda.data && resVenda.data.length > 0) {
        const dadosVenda = resVenda.data[0]
        setVenda(dadosVenda)
        setIdCliente(dadosVenda.id_cliente)
        setFormaPagamento(dadosVenda.forma_pagamento || 'PIX')
        setStatus(dadosVenda.status)
      }

      const resItens = await api.get(`/itemVenda/listar/${id}`)
      setItens(resItens.data)

      const [resClientes, resProdutos] = await Promise.all([
        api.get('/cliente/listar'),
        api.get('/produto/listar'),
      ])
      setClientes(resClientes.data)
      setProdutos(resProdutos.data)
    } catch {
      notify('Erro ao carregar dados da venda.', 'error')
    }
  }

  useEffect(() => {
    carregarDados()
  }, [id])

  const isPago = venda?.status === 'PAGO'
  const valorTotalCalculado = itens.reduce((acc, item) => acc + Number(item.subtotal), 0)

  const handleSalvarAlteracoesVenda = async (e) => {
    e.preventDefault()
    if (isPago) return notify('Vendas com status PAGO nao podem ser alteradas.', 'error')

    try {
      await api.patch(`/venda/atualizar/${id}`, {
        id_cliente: Number(idCliente),
        valor_total: valorTotalCalculado,
        forma_pagamento: formaPagamento,
        status,
      })
      notify('Venda atualizada com sucesso.', 'success')
      carregarDados()
    } catch {
      notify('Erro ao atualizar venda.', 'error')
    }
  }

  const handleAdicionarItem = async () => {
    if (isPago) return notify('Nao e possivel adicionar itens a uma venda paga.', 'error')
    if (!produtoSelecionado) return notify('Selecione um produto.', 'error')

    const prod = produtos.find((p) => p.id === Number(produtoSelecionado))
    if (!prod) return

    if (quantidade > prod.qtd_estoque) {
      notify(`Estoque insuficiente (${prod.qtd_estoque}).`, 'error')
      return
    }

    const subtotal = Number(prod.preco_base) * Number(quantidade)

    try {
      await api.post('/itemVenda/cadastrar', {
        id_venda: Number(id),
        id_produto: prod.id,
        quantidade: Number(quantidade),
        preco_unitario_momento: prod.preco_base,
        subtotal,
      })

      await api.patch(`/venda/atualizar/${id}`, {
        id_cliente: Number(idCliente),
        valor_total: valorTotalCalculado + subtotal,
        forma_pagamento: formaPagamento,
        status,
      })

      setProdutoSelecionado('')
      setQuantidade(1)
      notify('Item adicionado.', 'success')
      carregarDados()
    } catch {
      notify('Erro ao adicionar item.', 'error')
    }
  }

  const handleExcluirItem = async (idItemVenda, subtotalItem) => {
    if (isPago) return notify('Nao e possivel remover itens de uma venda paga.', 'error')
    if (!confirm('Deseja remover este item da venda?')) return

    try {
      await api.delete(`/itemVenda/excluir/${idItemVenda}`)
      await api.patch(`/venda/atualizar/${id}`, {
        id_cliente: Number(idCliente),
        valor_total: valorTotalCalculado - subtotalItem,
        forma_pagamento: formaPagamento,
        status,
      })
      notify('Item removido.', 'success')
      carregarDados()
    } catch {
      notify('Erro ao excluir item da venda.', 'error')
    }
  }

  if (!venda) return <div className="card"><p>Carregando dados da venda...</p></div>

  return (
    <div>
      {isPago && (
        <div className="alert alert-danger">
          Esta venda esta com status PAGO. As edicoes de dados e itens estao bloqueadas.
        </div>
      )}

      <div className="page-header">
        <div>
          <h2>Venda #{id}</h2>
          <p>Cliente: {venda.nome} · {new Date(venda.data_venda).toLocaleDateString('pt-BR')}</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/vendas')}>
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Dados da venda</h3>
        <form onSubmit={handleSalvarAlteracoesVenda}>
          <div className="form-grid cols-3">
            <div className="form-group">
              <label>Cliente</label>
              <select value={idCliente} onChange={(e) => setIdCliente(e.target.value)} disabled={isPago}>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome} ({c.cpf})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Forma de pagamento</label>
              <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} disabled={isPago}>
                <option value="PIX">PIX</option>
                <option value="CARTAO_CREDITO">Cartao de credito</option>
                <option value="CARTAO_DEBITO">Cartao de debito</option>
                <option value="BOLETO">Boleto</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={isPago}>
                <option value="PENDENTE">PENDENTE</option>
                <option value="PAGO">PAGO</option>
                <option value="CANCELADO">CANCELADO</option>
              </select>
            </div>
          </div>
          {!isPago && (
            <button type="submit" className="btn" style={{ marginTop: 14 }}>Salvar dados da venda</button>
          )}
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Itens da venda</h3>
        {!isPago && (
          <div className="cart-box">
            <div>
              <label>Produto</label>
              <select value={produtoSelecionado} onChange={(e) => setProdutoSelecionado(e.target.value)}>
                <option value="">Selecione um produto</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} - R$ {Number(p.preco_base).toFixed(2)} (Estoque: {p.qtd_estoque})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Qtd.</label>
              <input type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
            </div>
            <button type="button" className="btn" onClick={handleAdicionarItem}>Inserir item</button>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Marca</th>
                <th>Tipo</th>
                <th>Preco unit.</th>
                <th>Qtd.</th>
                <th>Subtotal</th>
                {!isPago && <th>Acoes</th>}
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 && (
                <tr>
                  <td colSpan={isPago ? 6 : 7} className="empty-state">Nenhum item nesta venda.</td>
                </tr>
              )}
              {itens.map((i) => (
                <tr key={i.id_item_venda}>
                  <td>{i.nome}</td>
                  <td>{i.marca}</td>
                  <td>{i.tipo}</td>
                  <td>R$ {Number(i.preco_unitario_momento).toFixed(2)}</td>
                  <td>{i.quantidade}</td>
                  <td>R$ {Number(i.subtotal).toFixed(2)}</td>
                  {!isPago && (
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleExcluirItem(i.id_item_venda, Number(i.subtotal))}>
                        <Trash2 size={14} /> Remover
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="total-row">
          <h3>Total: R$ {valorTotalCalculado.toFixed(2)}</h3>
        </div>
      </div>
    </div>
  )
}
