import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function VendaDetalhes() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  // Dados da venda e itens
  const [venda, setVenda] = useState(null)
  const [itens, setItens] = useState([])
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])

  // Campos de edição da venda
  const [idCliente, setIdCliente] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [status, setStatus] = useState('')

  // Campos para adicionar novo item
  const [produtoSelecionado, setProdutoSelecionado] = useState('')
  const [quantidade, setQuantidade] = useState(1)

  useEffect(() => {
    carregarDados()
  }, [id])

  const carregarDados = async () => {
    try {
      // 1. Busca os detalhes da venda específica
      const resVenda = await api.get(`/venda/listar/${user.id}/${id}`)
      if (resVenda.data && resVenda.data.length > 0) {
        const dadosVenda = resVenda.data[0]
        setVenda(dadosVenda)
        setIdCliente(dadosVenda.id_cliente)
        setFormaPagamento(dadosVenda.forma_pagamento || 'PIX')
        setStatus(dadosVenda.status)
      }

      // 2. Busca os itens da venda
      const resItens = await api.get(`/itemVenda/listar/${id}`)
      setItens(resItens.data)

      // 3. Busca clientes e produtos para permitir edições/inserções
      const [resClientes, resProdutos] = await Promise.all([
        api.get('/cliente/listar'),
        api.get('/produto/listar')
      ])
      setClientes(resClientes.data)
      setProdutos(resProdutos.data)

    } catch (err) {
      alert('Erro ao carregar dados da venda.')
    }
  }

  // Verifica se a venda já está paga
  const isPago = venda?.status === 'PAGO'

  // Recalcula o valor total da venda a partir dos itens em tela
  const valorTotalCalculado = itens.reduce((acc, item) => acc + Number(item.subtotal), 0)

  // Atualizar dados gerais da venda (Status, Forma de Pagamento, Cliente)
  const handleSalvarAlteracoesVenda = async (e) => {
    e.preventDefault()
    if (isPago) return alert('Vendas com status PAGO não podem ser alteradas!')

    try {
      await api.patch(`/venda/atualizar/${id}`, {
        id_cliente: Number(idCliente),
        valor_total: valorTotalCalculado,
        forma_pagamento: formaPagamento,
        status: status
      })

      alert('Venda atualizada com sucesso!')
      carregarDados()
    } catch (err) {
      alert('Erro ao atualizar venda.')
    }
  }

  // Adicionar um novo item à venda
  const handleAdicionarItem = async () => {
    if (isPago) return alert('Não é possível adicionar itens a uma venda concluída (PAGO).')
    if (!produtoSelecionado) return alert('Selecione um produto.')

    const prod = produtos.find(p => p.id === Number(produtoSelecionado))
    if (!prod) return

    if (quantidade > prod.qtd_estoque) {
      alert(`Quantidade indisponível em estoque (Estoque atual: ${prod.qtd_estoque}).`)
      return
    }

    const subtotal = prod.preco_base * quantidade

    try {
      await api.post('/itemVenda/cadastrar', {
        id_venda: Number(id),
        id_produto: prod.id,
        quantidade: Number(quantidade),
        preco_unitario_momento: prod.preco_base,
        subtotal: subtotal
      })

      // Atualiza o valor total na tabela de vendas
      const novoTotal = valorTotalCalculado + subtotal
      await api.patch(`/venda/atualizar/${id}`, {
        id_cliente: Number(idCliente),
        valor_total: novoTotal,
        forma_pagamento: formaPagamento,
        status: status
      })

      setProdutoSelecionado('')
      setQuantidade(1)
      carregarDados()
    } catch (err) {
      alert('Erro ao adicionar item.')
    }
  }

  // Excluir um item da venda
  const handleExcluirItem = async (idItemVenda, subtotalItem) => {
    if (isPago) return alert('Não é possível remover itens de uma venda concluída (PAGO).')

    if (confirm('Deseja remover este item da venda?')) {
      try {
        await api.delete(`/itemVenda/excluir/${idItemVenda}`)

        // Atualiza o valor total na tabela de vendas
        const novoTotal = valorTotalCalculado - subtotalItem
        await api.patch(`/venda/atualizar/${id}`, {
          id_cliente: Number(idCliente),
          valor_total: novoTotal,
          forma_pagamento: formaPagamento,
          status: status
        })

        carregarDados()
      } catch (err) {
        alert('Erro ao excluir item da venda.')
      }
    }
  }

  if (!venda) return <div className="card"><p>Carregando dados da venda...</p></div>

  return (
    <div>
      {/* Alerta caso esteja paga */}
      {isPago && (
        <div style={{ padding: '12px', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '6px', marginBottom: '15px', fontWeight: 'bold' }}>
          🔒 Esta venda está com o status PAGO e foi finalizada. As alterações e edições de itens estão bloqueadas.
        </div>
      )}

      {/* Formulário de Edição dos Dados da Venda */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Editar Venda #{id}</h3>
          <button onClick={() => navigate('/vendas')}>Voltar à Lista</button>
        </div>

        <form onSubmit={handleSalvarAlteracoesVenda}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label>Cliente</label>
              <select 
                value={idCliente} 
                onChange={(e) => setIdCliente(e.target.value)}
                disabled={isPago}
              >
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} ({c.cpf})</option>
                ))}
              </select>
            </div>

            <div>
              <label>Forma de Pagamento</label>
              <select 
                value={formaPagamento} 
                onChange={(e) => setFormaPagamento(e.target.value)}
                disabled={isPago}
              >
                <option value="PIX">PIX</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="CARTAO_DEBITO">Cartão de Débito</option>
                <option value="BOLETO">Boleto</option>
              </select>
            </div>

            <div>
              <label>Status da Venda</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                disabled={isPago}
              >
                <option value="PENDENTE">PENDENTE</option>
                <option value="PAGO">PAGO</option>
                <option value="CANCELADO">CANCELADO</option>
              </select>
            </div>
          </div>

          {!isPago && (
            <button type="submit" style={{ marginTop: '15px', backgroundColor: 'var(--primary)' }}>
              Salvar Dados da Venda
            </button>
          )}
        </form>
      </div>

      {/* Seção de Gerenciamento de Itens */}
      <div className="card">
        <h3>Itens da Venda</h3>

        {/* Adicionar novos itens se não estiver paga */}
        {!isPago && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', padding: '12px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '15px' }}>
            <div style={{ flex: 2 }}>
              <label>Adicionar Novo Produto</label>
              <select 
                value={produtoSelecionado} 
                onChange={(e) => setProdutoSelecionado(e.target.value)}
              >
                <option value="">Selecione um Produto</option>
                {produtos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome} - R$ {Number(p.preco_base).toFixed(2)} (Estoque: {p.qtd_estoque})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label>Qtd.</label>
              <input 
                type="number" 
                min="1" 
                value={quantidade} 
                onChange={(e) => setQuantidade(e.target.value)} 
              />
            </div>

            <button type="button" onClick={handleAdicionarItem}>
              + Inserir Item
            </button>
          </div>
        )}

        {/* Tabela de Itens Cadastrados na Venda */}
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Marca</th>
              <th>Tipo</th>
              <th>Preço Unit. (Momento)</th>
              <th>Qtd.</th>
              <th>Subtotal</th>
              {!isPago && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {itens.map(i => (
              <tr key={i.id_item_venda}>
                <td>{i.nome}</td>
                <td>{i.marca}</td>
                <td>{i.tipo}</td>
                <td>R$ {Number(i.preco_unitario_momento).toFixed(2)}</td>
                <td>{i.quantidade}</td>
                <td>R$ {Number(i.subtotal).toFixed(2)}</td>
                {!isPago && (
                  <td>
                    <button 
                      className="danger" 
                      onClick={() => handleExcluirItem(i.id_item_venda, Number(i.subtotal))}
                    >
                      Remover
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <h3>Total da Venda: R$ {valorTotalCalculado.toFixed(2)}</h3>
        </div>
      </div>
    </div>
  )
}