import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function NovaVenda() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])

  const [idCliente, setIdCliente] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('PIX')
  const [status, setStatus] = useState('PENDENTE')
  const [carrinho, setCarrinho] = useState([])

  const [produtoSelecionado, setProdutoSelecionado] = useState('')
  const [quantidade, setQuantidade] = useState(1)

  useEffect(() => {
    carregarAuxiliares()
  }, [])

  const carregarAuxiliares = async () => {
    try {
      const [resClientes, resProdutos] = await Promise.all([
        api.get('/cliente/listar'),
        api.get('/produto/listar')
      ])
      setClientes(resClientes.data)
      setProdutos(resProdutos.data)
    } catch (err) {
      alert('Erro ao carregar dados de clientes e produtos.')
    }
  }

  const adicionarAoCarrinho = () => {
    if (!produtoSelecionado) return
    const prod = produtos.find(p => p.id === Number(produtoSelecionado))
    if (!prod) return

    if (quantidade > prod.qtd_estoque) {
      alert(`Quantidade superior ao estoque disponível (${prod.qtd_estoque} un).`)
      return
    }

    const subtotal = prod.preco_base * quantidade
    setCarrinho([...carrinho, {
      id_produto: prod.id,
      nome: prod.nome,
      preco_unitario_momento: prod.preco_base,
      quantidade: Number(quantidade),
      subtotal
    }])

    setProdutoSelecionado('')
    setQuantidade(1)
  }

  const removerDoCarrinho = (index) => {
    setCarrinho(carrinho.filter((_, i) => i !== index))
  }

  const valorTotalCarrinho = carrinho.reduce((acc, item) => acc + item.subtotal, 0)

  const handleFinalizarVenda = async (e) => {
    e.preventDefault()
    if (!idCliente) return alert('Selecione um cliente.')
    if (carrinho.length === 0) return alert('Adicione pelo menos um produto ao carrinho.')

    try {
      const resVenda = await api.post('/venda/cadastrar', {
        id_cliente: Number(idCliente),
        id_vendedor: user.id,
        valor_total: valorTotalCarrinho,
        forma_pagamento: formaPagamento,
        status: status
      })

      const idVendaCriada = resVenda.data.detalhes.insertId

      for (const item of carrinho) {
        await api.post('/itemVenda/cadastrar', {
          id_venda: idVendaCriada,
          id_produto: item.id_produto,
          quantidade: item.quantidade,
          preco_unitario_momento: item.preco_unitario_momento,
          subtotal: item.subtotal
        })
      }

      alert('Venda realizada com sucesso!')
      navigate('/vendas')
    } catch (err) {
      alert('Erro ao processar venda.')
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Registrar Nova Venda</h3>
        <button onClick={() => navigate('/vendas')}>Cancelar / Voltar</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
        <div>
          <label>Cliente</label>
          <select value={idCliente} onChange={(e) => setIdCliente(e.target.value)}>
            <option value="">Selecione o Cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.cpf})</option>)}
          </select>
        </div>

        <div>
          <label>Forma de Pagamento</label>
          <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
            <option value="PIX">PIX</option>
            <option value="CARTAO_CREDITO">Cartão de Crédito</option>
            <option value="CARTAO_DEBITO">Cartão de Débito</option>
            <option value="BOLETO">Boleto</option>
          </select>
        </div>

        <div>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="PENDENTE">Pendente</option>
            <option value="PAGO">Pago</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Adicionar Produto ao Carrinho */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', padding: '10px', background: '#f1f5f9', borderRadius: '6px' }}>
        <div style={{ flex: 2 }}>
          <label>Adicionar Produto</label>
          <select value={produtoSelecionado} onChange={(e) => setProdutoSelecionado(e.target.value)}>
            <option value="">Selecione o Produto</option>
            {produtos.map(p => (
              <option key={p.id} value={p.id}>{p.nome} - R$ {p.preco_base} (Estoque: {p.qtd_estoque})</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Qtd.</label>
          <input type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
        </div>
        <button type="button" onClick={adicionarAoCarrinho}>Adicionar Item</button>
      </div>

      {/* Tabela do Carrinho */}
      {carrinho.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <h4>Itens da Venda</h4>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço Unit.</th>
                <th>Qtd.</th>
                <th>Subtotal</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carrinho.map((item, index) => (
                <tr key={index}>
                  <td>{item.nome}</td>
                  <td>R$ {item.preco_unitario_momento.toFixed(2)}</td>
                  <td>{item.quantidade}</td>
                  <td>R$ {item.subtotal.toFixed(2)}</td>
                  <td><button className="danger" onClick={() => removerDoCarrinho(index)}>Remover</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Total: R$ {valorTotalCarrinho.toFixed(2)}</h3>
            <button onClick={handleFinalizarVenda} style={{ backgroundColor: 'var(--success)' }}>Finalizar Venda</button>
          </div>
        </div>
      )}
    </div>
  )
}