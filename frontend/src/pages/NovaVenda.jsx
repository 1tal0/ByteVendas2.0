import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { ArrowLeft, Trash2 } from 'lucide-react'

export default function NovaVenda() {
  const { user } = useContext(AuthContext)
  const { notify } = useToast()
  const navigate = useNavigate()

  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [idCliente, setIdCliente] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('PIX')
  const [status, setStatus] = useState('PENDENTE')
  const [carrinho, setCarrinho] = useState([])
  const [produtoSelecionado, setProdutoSelecionado] = useState('')
  const [quantidade, setQuantidade] = useState(1)

  const carregarAuxiliares = async () => {
    try {
      const [resClientes, resProdutos] = await Promise.all([
        api.get('/cliente/listar'),
        api.get('/produto/listar'),
      ])
      setClientes(resClientes.data)
      setProdutos(resProdutos.data)
    } catch {
      notify('Erro ao carregar dados de clientes e produtos.', 'error')
    }
  }

  useEffect(() => {
    carregarAuxiliares()
  }, [])

  const adicionarAoCarrinho = () => {
    if (!produtoSelecionado) return
    const prod = produtos.find((p) => p.id === Number(produtoSelecionado))
    if (!prod) return

    if (quantidade > prod.qtd_estoque) {
      notify(`Quantidade superior ao estoque (${prod.qtd_estoque} un).`, 'error')
      return
    }

    const subtotal = Number(prod.preco_base) * Number(quantidade)
    setCarrinho([
      ...carrinho,
      {
        id_produto: prod.id,
        nome: prod.nome,
        preco_unitario_momento: Number(prod.preco_base),
        quantidade: Number(quantidade),
        subtotal,
      },
    ])
    setProdutoSelecionado('')
    setQuantidade(1)
  }

  const valorTotalCarrinho = carrinho.reduce((acc, item) => acc + item.subtotal, 0)

  const handleFinalizarVenda = async (e) => {
    e.preventDefault()
    if (!idCliente) return notify('Selecione um cliente.', 'error')
    if (carrinho.length === 0) return notify('Adicione pelo menos um produto.', 'error')

    try {
      const resVenda = await api.post('/venda/cadastrar', {
        id_cliente: Number(idCliente),
        id_vendedor: user.id,
        valor_total: valorTotalCarrinho,
        forma_pagamento: formaPagamento,
        status,
      })

      const idVendaCriada = resVenda.data.detalhes.insertId

      for (const item of carrinho) {
        await api.post('/itemVenda/cadastrar', {
          id_venda: idVendaCriada,
          id_produto: item.id_produto,
          quantidade: item.quantidade,
          preco_unitario_momento: item.preco_unitario_momento,
          subtotal: item.subtotal,
        })
      }

      notify('Venda realizada com sucesso!', 'success')
      navigate('/vendas')
    } catch {
      notify('Erro ao processar venda.', 'error')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Nova venda</h2>
          <p>Selecione o cliente, os itens e finalize o pedido.</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/vendas')}>
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      <div className="card">
        <div className="form-grid cols-3">
          <div className="form-group">
            <label>Cliente</label>
            <select value={idCliente} onChange={(e) => setIdCliente(e.target.value)}>
              <option value="">Selecione o cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome} ({c.cpf})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Forma de pagamento</label>
            <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
              <option value="PIX">PIX</option>
              <option value="CARTAO_CREDITO">Cartao de credito</option>
              <option value="CARTAO_DEBITO">Cartao de debito</option>
              <option value="BOLETO">Boleto</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO">Pago</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Itens</h3>
        <div className="cart-box">
          <div>
            <label>Produto</label>
            <select value={produtoSelecionado} onChange={(e) => setProdutoSelecionado(e.target.value)}>
              <option value="">Selecione o produto</option>
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
          <button type="button" className="btn" onClick={adicionarAoCarrinho}>Adicionar</button>
        </div>

        {carrinho.length > 0 ? (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Preco unit.</th>
                    <th>Qtd.</th>
                    <th>Subtotal</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {carrinho.map((item, index) => (
                    <tr key={index}>
                      <td>{item.nome}</td>
                      <td>R$ {item.preco_unitario_momento.toFixed(2)}</td>
                      <td>{item.quantidade}</td>
                      <td>R$ {item.subtotal.toFixed(2)}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => setCarrinho(carrinho.filter((_, i) => i !== index))}>
                          <Trash2 size={14} /> Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="total-row">
              <h3>Total: R$ {valorTotalCarrinho.toFixed(2)}</h3>
              <button className="btn btn-success" onClick={handleFinalizarVenda}>Finalizar venda</button>
            </div>
          </>
        ) : (
          <p className="empty-state">Nenhum item no carrinho.</p>
        )}
      </div>
    </div>
  )
}
